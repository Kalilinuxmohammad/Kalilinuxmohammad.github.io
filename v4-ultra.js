(()=>{
"use strict";

const KEY="LPIC_V4_ULTRA_STATE";

let state;

try{
 state=JSON.parse(
  localStorage.getItem(KEY) ||
  '{"done":{},"bookmarks":[],"theme":"dark","xp":0}'
 );
}catch(e){
 state={
  done:{},
  bookmarks:[],
  theme:"dark",
  xp:0
 };
}

const chapters=Array.from({length:12},(_,i)=>({
 n:i+1,
 url:`chapter-${String(i+1).padStart(2,"0")}/index.html`
}));

function save(){
 localStorage.setItem(KEY,JSON.stringify(state));
}

function getChapter(){
 const match=location.pathname.match(/chapter-(\d{2})/);
 return match ? Number(match[1]) : 0;
}

function toast(message){
 let box=document.querySelector(".v4-toast");

 if(!box){
  box=document.createElement("div");
  box.className="v4-toast";
  document.body.appendChild(box);
 }

 box.textContent=message;
 box.classList.add("show");

 setTimeout(()=>{
  box.classList.remove("show");
 },1800);
}

function applyTheme(){
 document.body.classList.toggle(
  "v4-light",
  state.theme==="light"
 );
}

function toggleTheme(){
 state.theme=state.theme==="light"?"dark":"light";
 save();
 applyTheme();
 toast(
  state.theme==="light"
  ?"Light mode enabled"
  :"Dark mode enabled"
 );
}

function completeChapter(){
 const n=getChapter();

 if(!n){
  return;
 }

 state.done[n]=!state.done[n];

 state.xp=
  Object.keys(state.done)
  .filter(k=>state.done[k])
  .length*100;

 save();

 updateButtons();

 toast(
  state.done[n]
  ?"Chapter completed ✓"
  :"Completion removed"
 );
}

function toggleBookmark(){
 const n=getChapter();

 if(!n){
  return;
 }

 const key=location.pathname;

 const index=state.bookmarks.findIndex(
  item=>item.key===key
 );

 if(index>=0){
  state.bookmarks.splice(index,1);
  toast("Bookmark removed");
 }else{
  state.bookmarks.push({
   key:key,
   title:document.title,
   url:location.href,
   chapter:n
  });
  toast("Bookmark saved ★");
 }

 save();
 updateButtons();
}

function updateButtons(){
 const n=getChapter();

 const doneButton=
  document.querySelector("[data-v4-done]");

 const bookmarkButton=
  document.querySelector("[data-v4-book]");

 if(doneButton){
  doneButton.textContent=
   state.done[n]
   ?"✓ Completed"
   :"Mark complete";
 }

 if(bookmarkButton){
  const saved=state.bookmarks.some(
   item=>item.key===location.pathname
  );

  bookmarkButton.textContent=
   saved
   ?"★ Bookmarked"
   :"☆ Bookmark";
 }
}

function safe(text){
 return String(text).replace(
  /[&<>"']/g,
  char=>({
   "&":"&amp;",
   "<":"&lt;",
   ">":"&gt;",
   '"':"&quot;",
   "'":"&#039;"
  })[char]
 );
}

function dashboard(){
 const root=document.querySelector("#v4-dashboard");

 if(!root){
  return;
 }

 const completed=
  Object.keys(state.done)
  .filter(k=>state.done[k]).length;

 const percent=
  Math.round((completed/12)*100);

 const level=
  Math.floor(state.xp/200)+1;

 root.innerHTML=`
 <section class="v4-panel v4-hero">

  <div class="v4-kicker">
   LPIC-1 • CYBER ACADEMY
  </div>

  <div class="v4-title">
   Mission Control
  </div>

  <div class="v4-sub">
   Your offline LPIC-1 command center.
   Progress is stored locally in this browser.
  </div>

  <div class="v4-progress">
   <i style="width:${percent}%"></i>
  </div>

  <div class="v4-sub" style="margin-top:9px">
   ${completed}/12 chapters completed
   • ${percent}%
   • Level ${level}
   • ${state.xp} XP
  </div>

 </section>

 <div class="v4-grid">

  <div class="v4-card">
   <strong>${completed}</strong>
   <span>Completed</span>
  </div>

  <div class="v4-card">
   <strong>${12-completed}</strong>
   <span>Remaining</span>
  </div>

  <div class="v4-card">
   <strong>${level}</strong>
   <span>Level</span>
  </div>

  <div class="v4-card">
   <strong>${state.bookmarks.length}</strong>
   <span>Bookmarks</span>
  </div>

 </div>

 <section class="v4-panel">

  <div class="v4-kicker">
   CHAPTER MATRIX
  </div>

  <div class="v4-list">

   ${chapters.map(ch=>`
    <div class="v4-row">
     <a href="${ch.url}">
      Chapter ${String(ch.n).padStart(2,"0")}
     </a>

     <small>
      ${state.done[ch.n]?"✓ Completed":"Pending"}
     </small>
    </div>
   `).join("")}

  </div>

 </section>

 ${
  state.bookmarks.length
  ?`
  <section class="v4-panel">

   <div class="v4-kicker">
    BOOKMARKS
   </div>

   <div class="v4-list">

    ${state.bookmarks.map(item=>`
     <div class="v4-row">

      <a href="${item.url}">
       ${safe(item.title)}
      </a>

      <small>
       Ch ${item.chapter}
      </small>

     </div>
    `).join("")}

   </div>

  </section>
  `
  :""
 }
 `;
}

function install(){
 document.body.classList.add("v4");

 applyTheme();

 const chapter=getChapter();

 if(chapter===11){
  document.body.classList.add("v4-golden");
 }

 if(chapter===12){
  document.body.classList.add("v4-exam");
 }

 const shell=document.createElement("div");
 shell.className="v4-shell";

 if(chapter){

  shell.innerHTML=`
   <button class="v4-btn" data-v4-done>
    ${state.done[chapter]
     ?"✓ Completed"
     :"Mark complete"}
   </button>

   <button class="v4-btn" data-v4-book>
    ${
     state.bookmarks.some(
      item=>item.key===location.pathname
     )
     ?"★ Bookmarked"
     :"☆ Bookmark"
    }
   </button>

   <button class="v4-btn" data-v4-theme>
    ◐ Theme
   </button>
  `;

 }else{

  shell.innerHTML=`
   <button class="v4-btn" data-v4-theme>
    ◐ Theme
   </button>
  `;

 }

 document.body.appendChild(shell);

 document
  .querySelector("[data-v4-done]")
  ?.addEventListener("click",completeChapter);

 document
  .querySelector("[data-v4-book]")
  ?.addEventListener("click",toggleBookmark);

 document
  .querySelector("[data-v4-theme]")
  ?.addEventListener("click",toggleTheme);

 if(!chapter){

  const dashboardRoot=
   document.createElement("div");

  dashboardRoot.id="v4-dashboard";

  document.body.prepend(dashboardRoot);

  dashboard();

 }

 updateButtons();
}

document.addEventListener(
 "DOMContentLoaded",
 install
);

})();
