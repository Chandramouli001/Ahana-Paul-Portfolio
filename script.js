(function(){
"use strict";
var KEY="ms_uploads_v1",MAX_MB=10,OK=["image/jpeg","image/png","image/webp","image/gif"];
var $=function(id){return document.getElementById(id)};
var grid=$("grid"),cur="all",mine=load(),ART=[];
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(mine));return true}catch(e){alert("Browser storage is full. Delete some uploads or add images to the /images folder instead.");return false}}
function all(){return mine.map(function(m,i){m.up=i;return m}).concat(window.ARTWORKS||[])}
function ph(i,bw){var c=bw?["#2b2825","#666","#999"]:[["#e8742a","#7a1f2b","#0f7c7a"],["#f2a900","#1f2a5a","#c2185b"],["#0f7c7a","#e8742a","#7a1f2b"]][i%3];
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480"><rect width="400" height="480" fill="#fbf3e4"/><g transform="translate(200 230)" fill="none" stroke-width="3">';
 for(var k=0;k<12;k++)o+='<ellipse rx="22" ry="78" cy="-78" transform="rotate('+k*30+')" stroke="'+c[k%3]+'" fill="'+c[k%3]+'" fill-opacity=".18"/>';
 return "data:image/svg+xml;utf8,"+encodeURIComponent(o+'<circle r="40" stroke="'+c[0]+'"/><circle r="18" fill="'+c[1]+'"/></g></svg>')}
function render(){
 ART=all();grid.innerHTML="";
 ART.forEach(function(a,i){
  var d=document.createElement("article");d.className="card"+(a.bw?" bw":"");d.dataset.cat=a.cat;d.style.animationDelay=Math.min(i,10)*60+"ms";
  var b=document.createElement("button");b.className="open";b.setAttribute("aria-label","View "+a.title);
  var im=new Image();im.loading="lazy";im.src=a.src||ph(i,a.bw);im.alt=a.alt||a.title+" — "+(a.bw?"black and white ":"colour ")+a.cat+" drawing by Ahana Paul";
  var h=document.createElement("h3");h.textContent=a.title;var s=document.createElement("small");s.textContent=a.cat+(a.bw?" · b/w":" · colour");
  b.append(im,h,s);b.onclick=function(){openLb(i)};d.append(b);
  if(a.up!==undefined){var x=document.createElement("button");x.className="del";x.textContent="✕";x.title="Remove this upload";x.setAttribute("aria-label","Remove "+a.title);
   x.onclick=function(e){e.stopPropagation();if(confirm('Remove "'+a.title+'"?')){mine.splice(a.up,1);save();render()}};d.append(x)}
  grid.append(d)});
 filt()}
function filt(){[].forEach.call(grid.children,function(c){c.classList.toggle("hide",cur!=="all"&&c.dataset.cat!==cur)})}
document.querySelectorAll(".chip[data-f]").forEach(function(c){c.onclick=function(){cur=c.dataset.f;document.querySelectorAll(".chip[data-f]").forEach(function(x){x.setAttribute("aria-pressed",x===c)});filt()}});
var lb=$("lb"),idx=0;
function list(){return ART.map(function(a,i){return i}).filter(function(i){return cur==="all"||ART[i].cat===cur})}
function show(){var a=ART[idx],i=$("li");i.src=a.src||ph(idx,a.bw);i.alt=a.alt||a.title;i.style.filter=a.bw?"grayscale(1)":"none";$("lc").textContent=a.title}
function openLb(i){idx=i;show();lb.classList.add("open")}
function step(d){var l=list(),p=l.indexOf(idx);idx=l[(p+d+l.length)%l.length];show()}
lb.querySelector(".x").onclick=function(){lb.classList.remove("open")};
lb.querySelector(".p").onclick=function(){step(-1)};lb.querySelector(".n").onclick=function(){step(1)};
lb.onclick=function(e){if(e.target===lb)lb.classList.remove("open")};
document.addEventListener("keydown",function(e){if(!lb.classList.contains("open"))return;if(e.key==="Escape")lb.classList.remove("open");if(e.key==="ArrowRight")step(1);if(e.key==="ArrowLeft")step(-1)});
var dlg=$("dlg"),file=$("file"),data=null,err=$("err");
function reset(){data=null;$("up").reset();$("prev").hidden=true;$("dropTxt").hidden=false;$("save").disabled=true;err.textContent=""}
$("addBtn").onclick=function(){reset();dlg.showModal()};
$("cancel").onclick=function(){dlg.close()};
file.onchange=function(){pick(file.files[0])};
var drop=$("drop");
["dragenter","dragover"].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.add("over")})});
["dragleave","drop"].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.remove("over")})});
drop.addEventListener("drop",function(e){pick(e.dataTransfer.files[0])});
function pick(f){
 err.textContent="";if(!f)return;
 if(OK.indexOf(f.type)<0){err.textContent="Please choose a JPG, PNG, WEBP or GIF image.";return}
 if(f.size>MAX_MB*1048576){err.textContent="That file is over "+MAX_MB+" MB. Please choose a smaller one.";return}
 var u=URL.createObjectURL(f),im=new Image();
 im.onload=function(){
  var s=Math.min(1,1400/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
  var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
  data=c.toDataURL("image/jpeg",.86);URL.revokeObjectURL(u);
  $("prev").src=data;$("prev").hidden=false;$("dropTxt").hidden=true;$("save").disabled=false;
  if(!$("ft").value)$("ft").value=f.name.replace(/\.[^.]+$/,"").replace(/[-_]+/g," ")};
 im.onerror=function(){err.textContent="That image could not be read."};im.src=u}
$("up").onsubmit=function(e){e.preventDefault();if(!data)return;
 mine.unshift({title:$("ft").value.trim()||"Untitled",cat:$("fc").value,bw:$("fb").checked,alt:$("fa").value.trim(),src:data});
 if(save()){render();dlg.close();$("gallery").scrollIntoView()}else mine.shift()};
var T=$("theme");T.onclick=function(){var n=document.documentElement.dataset.theme==="night";document.documentElement.dataset.theme=n?"day":"night";T.textContent=n?"🌙":"☀️"};
$("cf").onsubmit=function(e){e.preventDefault();var d=new FormData(this);
 location.href="mailto:"+window.SITE.email+"?subject="+encodeURIComponent("Commission: "+d.get("s"))+"&body="+encodeURIComponent(d.get("m")+"\n\n— "+d.get("n")+" ("+d.get("e")+")")};
$("y").textContent=new Date().getFullYear();
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target,t=+el.dataset.n,n=0,s=setInterval(function(){n+=Math.ceil(t/40);if(n>=t){n=t;clearInterval(s)}el.textContent=n+"+"},35);io.unobserve(el)})});
document.querySelectorAll("[data-n]").forEach(function(e){io.observe(e)});
var ic={instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>',facebook:'<path d="M14 8h2.5V4.5H14C11.5 4.5 10 6 10 8.5V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9c0-.6.4-1 .5-1z"/>',youtube:'<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z"/>',whatsapp:'<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.3-2.4-2.4l.8-1-1-2z"/>',email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'},soc=(window.SITE.social)||{};
document.querySelectorAll(".social").forEach(function(box){Object.keys(soc).forEach(function(k){if(!ic[k])return;var a=document.createElement("a");a.href=soc[k];a.target="_blank";a.rel="noopener noreferrer me";a.setAttribute("aria-label","Ahana Paul on "+k);a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+ic[k]+'</svg>';box.append(a)})});
var pt=document.getElementById("petals");if(pt){var h="";for(var k=0;k<16;k++)h+='<ellipse rx="14" ry="50" cy="-86" transform="rotate('+k*22.5+')"/>';pt.innerHTML=h}
render();
})();