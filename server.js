const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});
const inbox = new Map();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

function safeName(name) {
  return String(name || "shared-file").replace(/[\\\/\0-\x1f]/g, "_").slice(0, 120);
}
function humanSize(n) {
  if (n < 1024) return n + " B";
  if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
  return (n / 1048576).toFixed(1) + " MB";
}
function validCode(code) { return /^\d{6}$/.test(String(code)); }

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "PRADIP SHARE", version: "1.0.0" });
});

app.post("/api/send", upload.single("file"), (req, res) => {
  const code = String(req.body.code || "");
  if (!validCode(code)) return res.status(400).json({ error: "Receiver code must be 6 digits." });
  if (!req.file) return res.status(400).json({ error: "Choose a file first." });

  const id = crypto.randomBytes(16).toString("hex");
  const item = {
    id,
    name: safeName(req.file.originalname),
    mime: req.file.mimetype || "application/octet-stream",
    size: req.file.size,
    data: req.file.buffer,
    created: Date.now()
  };
  const list = inbox.get(code) || [];
  list.push(item);
  inbox.set(code, list);
  res.json({ ok: true, id, name: item.name, sizeText: humanSize(item.size) });
});

app.get("/api/inbox/:code", (req, res) => {
  const code = String(req.params.code || "");
  if (!validCode(code)) return res.status(400).json({ error: "Invalid receiver code." });
  const files = (inbox.get(code) || []).map(f => ({
    id: f.id, name: f.name, size: f.size, sizeText: humanSize(f.size)
  }));
  res.json({ files });
});

app.get("/api/download/:id", (req, res) => {
  const id = String(req.params.id || "");
  for (const [code, list] of inbox.entries()) {
    const index = list.findIndex(f => f.id === id);
    if (index !== -1) {
      const f = list[index];
      res.setHeader("Content-Type", f.mime);
      res.setHeader("Content-Length", f.size);
      res.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodeURIComponent(f.name));
      return res.end(f.data);
    }
  }
  res.status(404).json({ error: "File not found. It may have expired or server restarted." });
});

app.delete("/api/delete/:id", (req, res) => {
  const id = String(req.params.id || "");
  for (const [code, list] of inbox.entries()) {
    const index = list.findIndex(f => f.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      inbox.set(code, list);
      return res.json({ ok: true });
    }
  }
  res.status(404).json({ error: "File not found." });
});

app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Maximum file size is 25 MB." });
  }
  console.error(err);
  res.status(500).json({ error: "Server error." });
});

const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => console.log("PRADIP SHARE listening on " + port));
