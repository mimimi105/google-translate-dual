// ==UserScript==
// @name         Google Translate Dual Direction
// @namespace    https://github.com/mimimi105/google-translate-dual
// @version      1.0.0
// @description  Adds a reverse translation panel below Google Translate
// @match        https://translate.google.com/*
// @match        https://translate.google.co.jp/*
// @connect      translate.googleapis.com
// @connect      translate.google.com
// @grant        none
// @author       mimimi105
// @homepageURL  https://github.com/mimimi105/google-translate-dual
// @supportURL   https://github.com/mimimi105/google-translate-dual/issues
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = "#gt-dual-reverse-panel {\n  border-top: 1px solid #dadce0;\n  padding: 8px 0 16px 0;\n  background: #fff;\n  margin-top: 8px;\n}\n\n#gt-dual-reverse-panel .dual-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 8px;\n  font-family: 'Google Sans', arial, sans-serif;\n  font-size: 14px;\n  color: #5f6368;\n  user-select: none;\n}\n\n#gt-dual-reverse-panel .dual-header-left {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n#gt-dual-reverse-panel .dual-header .lang-label {\n  font-weight: 500;\n  color: #1a73e8;\n}\n\n#gt-dual-reverse-panel .dual-header .arrow {\n  color: #5f6368;\n}\n\n#gt-dual-reverse-panel .dual-body {\n  display: flex;\n  gap: 8px;\n}\n\n#gt-dual-reverse-panel .dual-input-area,\n#gt-dual-reverse-panel .dual-output-area {\n  flex: 1;\n  min-height: 80px;\n  position: relative;\n}\n\n#gt-dual-reverse-panel .dual-input-area textarea {\n  width: 100%;\n  min-height: 166px;\n  border: 1px solid #dadce0;\n  border-radius: 16px;\n  padding: 12px 16px 44px 16px;\n  font-family: 'Google Sans', arial, sans-serif;\n  font-size: 24px;\n  line-height: 32px;\n  color: #202124;\n  resize: none;\n  outline: none;\n  box-sizing: border-box;\n}\n\n#gt-dual-reverse-panel .dual-input-area textarea:focus {\n  border-color: #dadce0;\n  box-shadow: none;\n}\n\n#gt-dual-reverse-panel .dual-output-area .result-text {\n  padding: 12px 16px 44px 16px;\n  font-family: 'Google Sans', arial, sans-serif;\n  font-size: 24px;\n  line-height: 32px;\n  color: #202124;\n  min-height: 166px;\n  background: #f0f9f2;\n  border-radius: 16px;\n  white-space: pre-wrap;\n  word-break: break-word;\n  box-sizing: border-box;\n}\n\n#gt-dual-reverse-panel .dual-output-area .result-text.placeholder {\n  color: #80868b;\n}\n\n#gt-dual-reverse-panel.font-small .dual-input-area textarea,\n#gt-dual-reverse-panel.font-small .dual-output-area .result-text {\n  font-size: 18px;\n  line-height: 24px;\n}\n\n#gt-dual-reverse-panel .dual-tts-btn {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  width: 40px;\n  height: 40px;\n  padding: 0;\n  border-radius: 50%;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n  overflow: hidden;\n  fill: #5f6368;\n  transition: none;\n}\n\n#gt-dual-reverse-panel .dual-tts-btn svg {\n  fill: inherit;\n}\n\n#gt-dual-reverse-panel .dual-tts-btn::before {\n  content: '';\n  position: absolute;\n  inset: 0;\n  border-radius: 50%;\n  background: currentColor;\n  opacity: 0;\n  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n#gt-dual-reverse-panel .dual-tts-btn:hover::before {\n  opacity: 0.08;\n}\n\n#gt-dual-reverse-panel .dual-tts-btn:active::before {\n  opacity: 0.12;\n}\n\n#gt-dual-reverse-panel .dual-tts-btn.playing {\n  fill: #5f6368;\n}\n\n#gt-dual-reverse-panel .dual-tts-btn:disabled {\n  opacity: 0.3;\n  cursor: default;\n}\n\n#gt-dual-reverse-panel .dual-tts-btn:disabled::before {\n  display: none;\n}\n\n#gt-dual-reverse-panel .dual-tts-row {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  position: absolute;\n  bottom: 8px;\n  left: 8px;\n}\n\n#gt-dual-reverse-panel .dual-auto-toggle {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n}\n\n#gt-dual-reverse-panel .dual-auto-toggle-label {\n  font-size: 13px;\n  color: #5f6368;\n}\n\n#gt-dual-reverse-panel .dual-toggle-track {\n  position: relative;\n  width: 36px;\n  height: 20px;\n  background: #dadce0;\n  border-radius: 10px;\n  transition: background 0.2s;\n}\n\n#gt-dual-reverse-panel .dual-toggle-thumb {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  width: 16px;\n  height: 16px;\n  background: #fff;\n  border-radius: 50%;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);\n  transition: transform 0.2s;\n}\n\n#gt-dual-reverse-panel .dual-toggle-input {\n  position: absolute;\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n#gt-dual-reverse-panel .dual-toggle-track.active {\n  background: #90ce92;\n}\n\n#gt-dual-reverse-panel .dual-toggle-track.active .dual-toggle-thumb {\n  transform: translateX(16px);\n}\n";
  document.head.appendChild(style);

  // Main script
  var q="gt-dual-reverse-panel",F="gt-dual-auto-retranslate",G=80,k=300,Z={listen:"Listen",stop:"Stop",placeholder:"Enter {lang} text...",resultPlaceholder:"Translation",error:"Translation error",autoRetranslate:"Auto re-translate"},w={insertionPoint:".OPPzxe",originalTextarea:"textarea.er8xn",originalOutput:".usGWQd",originalOutputSpans:'.usGWQd span.ryNqvb[jsname="W297wb"]'};function o(c){let h=document.documentElement.lang||navigator.language||"en";try{return new Intl.DisplayNames([h],{type:"language"}).of(c)??c}catch{return c}}function P(){let c=new URL(location.href),h=c.searchParams.get("sl"),m=c.searchParams.get("tl");if(!h||!m)return null;return{sl:h,tl:m}}async function U(c,h,m){if(!c.trim())return"";let f=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(h)}&tl=${encodeURIComponent(m)}&dt=t&q=${encodeURIComponent(c)}`;return(await(await fetch(f)).json())[0].map((z)=>z[0]).join("")}var K='<svg focusable="false" width="20" height="20" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"></path><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"></path></svg>',x='<svg focusable="false" width="20" height="20" viewBox="0 0 24 24"><path d="M6,6h12v12H6V6z"></path></svg>';var I={...Z},W=!1,Y=[];function S(){return document.documentElement.lang||"en"}async function N(){let c=S();if(c.startsWith("en")){W=!0;return}let h=Object.keys(Z),m=h.map((f)=>Z[f]).join(`
`);try{let $=(await U(m,"en",c)).split(`
`);for(let d=0;d<h.length;d++)if($[d])I[h[d]]=$[d]}catch{}W=!0;for(let f of Y)f();Y.length=0}function _(){if(W)return Promise.resolve();return new Promise((c)=>Y.push(c))}function M(c,h){let m=I[c];if(h)for(let[f,$]of Object.entries(h))m=m.replace(`{${f}}`,$);return m}function g(c,h){let m=document.createElement("button");m.className="dual-tts-btn",m.innerHTML=K,m.title=M("listen"),m.disabled=!0;let f=null,$=!1;function d(){if(f)f.pause(),f.currentTime=0,f=null;$=!1,m.classList.remove("playing"),m.innerHTML=K,m.title=M("listen")}return m.addEventListener("click",()=>{if($){d();return}let z=h();if(!z.trim())return;let V=`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(c)}&q=${encodeURIComponent(z)}`;f=new Audio(V),$=!0,m.classList.add("playing"),m.innerHTML=x,m.title=M("stop"),f.play().catch(()=>d()),f.addEventListener("ended",d),f.addEventListener("error",d)}),m}function T(c,h){c.classList.toggle("font-small",h.length>G)}function E(c,h){let m=h,f=c,$=document.createElement("div");$.id=q,$.innerHTML=`
    <div class="dual-header">
      <div class="dual-header-left">
        <span class="lang-label">${o(m)}</span>
        <span class="arrow">→</span>
        <span class="lang-label">${o(f)}</span>
      </div>
      <label class="dual-auto-toggle">
        <span class="dual-auto-toggle-label">${M("autoRetranslate")}</span>
        <div class="dual-toggle-track">
          <div class="dual-toggle-thumb"></div>
          <input type="checkbox" class="dual-toggle-input" />
        </div>
      </label>
    </div>
    <div class="dual-body">
      <div class="dual-input-area">
        <textarea placeholder="${M("placeholder",{lang:o(m)})}"></textarea>
        <div class="dual-tts-row" data-side="input"></div>
      </div>
      <div class="dual-output-area">
        <div class="result-text placeholder">${M("resultPlaceholder")}</div>
        <div class="dual-tts-row" data-side="output"></div>
      </div>
    </div>
  `;let d=$.querySelector("textarea"),z=$.querySelector(".result-text"),V=$.querySelector(".dual-toggle-input"),v=$.querySelector(".dual-toggle-track"),y=g(m,()=>d.value),p=g(f,()=>{let H=z.textContent??"";return z.classList.contains("placeholder")?"":H});$.querySelector('.dual-tts-row[data-side="input"]').appendChild(y),$.querySelector('.dual-tts-row[data-side="output"]').appendChild(p);let n,X="";function D(){if(X)z.textContent=X+"...",z.classList.remove("placeholder");else z.textContent=M("resultPlaceholder"),z.classList.add("placeholder");p.disabled=!0}function C(){clearTimeout(n);let H=d.value;if(T($,H),y.disabled=!H.trim(),!H.trim()){X="",z.textContent=M("resultPlaceholder"),z.classList.add("placeholder"),p.disabled=!0;return}D(),n=setTimeout(async()=>{try{let Q=await U(H,m,f);X=Q,z.textContent=Q,z.classList.remove("placeholder"),p.disabled=!Q.trim()}catch{z.textContent=M("error"),z.classList.add("placeholder"),p.disabled=!0}},k)}d.addEventListener("input",C);let J=null;function i(){let H=document.querySelectorAll(w.originalOutputSpans);return Array.from(H).map((Q)=>Q.textContent??"").join("")}function b(){let H=i();if(H!==d.value)d.value=H,C()}function O(){b();let H=document.querySelector(w.originalOutput);if(!H)return;J=new MutationObserver(()=>b()),J.observe(H,{childList:!0,subtree:!0,characterData:!0})}function u(){if(J)J.disconnect(),J=null}function B(H){if(V.checked=H,v.classList.toggle("active",H),H)O();else u()}if(V.addEventListener("change",()=>{let H=V.checked;localStorage.setItem(F,H?"1":"0"),B(H)}),localStorage.getItem(F)==="1")B(!0);return $}function r(){return!!document.querySelector(w.originalTextarea)}function j(){if(!r())return null;return document.querySelector(w.insertionPoint)}async function L(){if(document.getElementById(q))return;let c=P();if(!c)return;let h=j();if(!h)return;await _();let m=E(c.sl,c.tl);h.parentElement?.insertBefore(m,h.nextSibling)}function A(){let c=location.href;new MutationObserver(()=>{if(location.href!==c)c=location.href,document.getElementById(q)?.remove();if(!document.getElementById(q)&&j())L()}).observe(document.body,{childList:!0,subtree:!0})}async function R(){if(N(),j()){await L(),A();return}let c=new MutationObserver(async()=>{if(j())c.disconnect(),await L(),A()});c.observe(document.body,{childList:!0,subtree:!0})}if(document.readyState==="complete")R();else window.addEventListener("load",R);

})();
