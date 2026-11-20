(function(){
var $=function(id){return document.getElementById(id);};
var myCode="";
function status(s){$("status").textContent=s;}
function code(){myCode=String(Math.floor(100000+Math.random()*900000));$("myCode").textContent=myCode;}
function req(method,url,data,done){
 var x=new XMLHttpRequest();x.open(method,url,true);
 x.onload=function(){var r={};try{r=JSON.parse(x.responseText||"{}");}catch(e){}
 if(x.status>=200&&x.status<300)done(null,r);else done(new Error(r.error||"Server error "+x.status));};
 x.onerror=function(){done(new Error("Network error. Check internet connection."));};x.send(data||null);
}
$("newCode").onclick=code;
$("sendTab").onclick=function(){$("sendPanel").classList.remove("hidden");$("receivePanel").classList.add("hidden");$("sendTab").classList.add("active");$("receiveTab").classList.remove("active");};
$("receiveTab").onclick=function(){$("receivePanel").classList.remove("hidden");$("sendPanel").classList.add("hidden");$("receiveTab").classList.add("active");$("sendTab").classList.remove("active");};
$("sendBtn").onclick=function(){
 var f=$("file").files&&$("file").files[0],c=$("recipient").value.replace(/\D/g,"");
 if(!f){status("Choose a file first.");return;}if(!/^\d{6}$/.test(c)){status("Enter receiver's 6-digit code.");return;}
 var d=new FormData();d.append("file",f,f.name);d.append("code",c);status("Sending "+f.name+"...");
 req("POST","/api/send",d,function(e,r){if(e){status(e.message);return;}status("Sent: "+r.name);$("file").value="";});
};
$("checkBtn").onclick=function(){
 req("GET","/api/inbox/"+myCode,null,function(e,r){if(e){status(e.message);return;}
 var box=$("incoming");box.innerHTML="";
 if(!r.files||!r.files.length){box.textContent="No files received yet.";status("Inbox is empty.");return;}
 r.files.forEach(function(f){var row=document.createElement("div");row.className="file-row";
 var n=document.createElement("div");n.textContent=f.name+" ("+f.sizeText+")";
 var a=document.createElement("a");a.href="/api/download/"+encodeURIComponent(f.id);a.textContent="DOWNLOAD";a.setAttribute("download",f.name);
 row.appendChild(n);row.appendChild(a);box.appendChild(row);});
 status(r.files.length+" file(s) found.");});
};
code();
})();