/* Mu Sigma Lambda Cornell — temporary preview gate.
   Hides the site behind a password while the chapter is pending approval.
   To take the site public: delete the <script src=".../gate.js"> line and the
   <meta name="robots"> line from each page's <head> (or delete this file). */
(function(){
  var HASH = "ta5d0anok";            /* hash of the preview password */
  var KEY  = "msl-preview-ok";

  function h(s){var a=0xdeadbeef,b=0x41c6ce57;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677);}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return (4294967296*(2097151&b)+(a>>>0)).toString(36);}

  try { if (localStorage.getItem(KEY) === HASH) return; } catch(e){}

  var src = (document.currentScript && document.currentScript.src) || "";
  var crest = src ? src.replace(/gate\.js(\?.*)?$/, "crest.png") : "assets/crest.png";

  var html = document.documentElement;
  html.classList.add("msl-gated");
  var st = document.createElement("style");
  st.textContent =
    "html.msl-gated body>*:not(#msl-gate){display:none!important}" +
    "html.msl-gated body{overflow:hidden}" +
    "#msl-gate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px 16px;overflow-y:auto;" +
      "background:radial-gradient(120% 80% at 50% 0%,#C42424 0%,#B31B1B 40%,#7E1212 100%);color:#fff;font-family:Archivo,'Helvetica Neue',Arial,sans-serif}" +
    "#msl-gate .g-card{width:100%;max-width:440px;text-align:center}" +
    "#msl-gate .g-crest{width:120px;height:auto;display:block;margin:0 auto 22px;filter:drop-shadow(0 8px 20px rgba(40,4,6,.35))}" +
    "#msl-gate .g-tag{display:inline-block;font-size:11.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#2A0A0C;background:#E9B44C;padding:5px 11px;border-radius:999px}" +
    "#msl-gate h1{font-size:clamp(30px,6vw,40px);font-weight:700;line-height:1.1;letter-spacing:-.01em;margin:16px 0 12px;text-wrap:balance}" +
    "#msl-gate p{margin:0 auto;max-width:38ch;font-size:15.5px;line-height:1.6;color:rgba(255,255,255,.86)}" +
    "#msl-gate form{margin:30px auto 0;max-width:340px;text-align:left}" +
    "#msl-gate label{display:block;font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.75);margin-bottom:8px}" +
    "#msl-gate .g-row{display:flex;gap:8px}" +
    "#msl-gate input{flex:1;min-width:0;font:inherit;font-size:16px;padding:12px 14px;border-radius:6px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.1);color:#fff}" +
    "#msl-gate input::placeholder{color:rgba(255,255,255,.55)}" +
    "#msl-gate input:focus{outline:2px solid #E9B44C;outline-offset:2px}" +
    "#msl-gate button{font:inherit;font-weight:700;font-size:15px;padding:12px 18px;border-radius:6px;border:0;background:#fff;color:#B31B1B;cursor:pointer}" +
    "#msl-gate button:hover{background:#FBEFD5}" +
    "#msl-gate button:focus-visible{outline:2px solid #E9B44C;outline-offset:2px}" +
    "#msl-gate .g-err{min-height:20px;margin-top:8px;font-size:13.5px;color:#FBEFD5}" +
    "#msl-gate .g-shake{animation:mslShake .3s}" +
    "@keyframes mslShake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}" +
    "#msl-gate .g-foot{margin-top:28px;font-size:13px;color:rgba(255,255,255,.65)}" +
    "#msl-gate .g-foot a{color:#fff}";
  document.head.appendChild(st);

  function mount(){
    if (document.getElementById("msl-gate")) return;
    var g = document.createElement("div");
    g.id = "msl-gate";
    g.setAttribute("role", "dialog");
    g.setAttribute("aria-modal", "true");
    g.setAttribute("aria-labelledby", "msl-gate-h");
    g.innerHTML =
      '<div class="g-card">' +
        '<img class="g-crest" src="' + crest + '" alt="Mu Sigma Lambda crest">' +
        '<span class="g-tag">Pending approval</span>' +
        '<h1 id="msl-gate-h">Mu Sigma Lambda Cornell Chapter is coming soon</h1>' +
        '<p>We are currently working with Cornell to establish the chapter. This site is pending approval and will be public shortly.</p>' +
        '<form novalidate>' +
          '<label for="msl-pw">Preview access</label>' +
          '<div class="g-row">' +
            '<input id="msl-pw" type="password" autocomplete="current-password" placeholder="Password" required>' +
            '<button type="submit">Enter</button>' +
          '</div>' +
          '<div class="g-err" aria-live="polite"></div>' +
        '</form>' +
        '<p class="g-foot">Mu Sigma Lambda &middot; Alpha Delta Chapter &middot; Cornell University</p>' +
      '</div>';
    document.body.insertBefore(g, document.body.firstChild);
    var f = g.querySelector("form"), i = g.querySelector("input"), err = g.querySelector(".g-err");
    f.addEventListener("submit", function(e){
      e.preventDefault();
      if (h(i.value.trim().toLowerCase()) === HASH){
        try { localStorage.setItem(KEY, HASH); } catch(x){}
        html.classList.remove("msl-gated");
        g.remove(); st.remove();
      } else {
        err.textContent = "Incorrect password.";
        f.classList.remove("g-shake"); void f.offsetWidth; f.classList.add("g-shake");
        i.select();
      }
    });
    i.focus();
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
