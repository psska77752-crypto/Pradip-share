# PRADIP SHARE – GitHub + Render

## क्या है?
GitHub पर source code रखें और Render पर Node.js API चलाएँ। GitHub Pages अकेले Node.js API नहीं चला सकता; वह static files serve करता है। इसलिए इस project में Render Web Service इस्तेमाल करें।

## GitHub पर upload
1. GitHub में नया repository बनाएँ: `pradip-share`
2. इस ZIP को extract करें।
3. सभी files/folders repository के root में upload करें: `package.json`, `server.js`, `public/`, `kaios/`.
4. Commit changes करें।

## Render पर deploy
1. https://render.com पर sign up/login करें।
2. Dashboard → New → Web Service.
3. GitHub connect करके `pradip-share` repository चुनें।
4. Runtime: Node.
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Create Web Service दबाएँ।
8. Deploy पूरा होने पर `https://your-service.onrender.com` जैसा URL मिलेगा।

## API endpoints
- `GET /api/health` – server status
- `POST /api/send` – multipart/form-data: `file` और `code`
- `GET /api/inbox/:code` – उस code की file list
- `GET /api/download/:id` – file download
- `DELETE /api/delete/:id` – file delete

## Test
Browser में `https://YOUR-SERVICE.onrender.com/api/health` खोलें। JSON में `ok:true` दिखना चाहिए। फिर उसी base URL को Android और KaiOS के browser में खोलें।

## जरूरी सीमाएँ
- यह demo है: files RAM में रखी जाती हैं। Server restart/redeploy या sleep के बाद files खो सकती हैं।
- Free Render services inactivity के बाद sleep होती हैं; अगली request पर start होने में समय लग सकता है।
- अधिकतम file 25 MB.
- यह demo authentication, encryption-at-rest, rate limiting और durable storage नहीं देता। Private/sensitive files के लिए इसे production में न चलाएँ।
- दोनों फोन में एक ही deployed URL खोलना होगा। यह Bluetooth/Wi-Fi Direct नहीं, internet/server-based sharing है।
- KaiOS F271i की file picker, download support और systemXHR permission firmware पर निर्भर है।
