/* Mu Sigma Lambda Cornell: shared page script */
(function(){
  var root = document.documentElement.dataset.root || "";

  /* Folder links like "team/" are clean URLs on GitHub Pages. When the site is
     opened straight from disk (or in a preview), point them at index.html instead. */
  var h = location.hostname, local = location.protocol === "file:" || /claude/.test(h);
  if (local){
    document.querySelectorAll("a[href]").forEach(function(a){
      var v = a.getAttribute("href");
      if (/^(https?:|mailto:|#)/.test(v)) return;
      var m = v.match(/^([^#]*)(#.*)?$/), p = m[1], hash = m[2] || "";
      if (p === "" || p.slice(-1) === "/") a.setAttribute("href", p + "index.html" + hash);
    });
  }

  /* Get-involved modal */
  var jm = document.getElementById("joinModal");
  if (!jm) return;
  var lastFocus = null;
  function home(path){ return root + (local && (path === "" || path.charAt(0) === "#") ? "index.html" : "") + path; }
  function sub(dir){ return root + dir + (local ? "index.html" : ""); }
  function openJoin(e){
    jm.dataset.mode = (e.currentTarget.dataset.joinOpen) || "involved";
    lastFocus = document.activeElement;
    jm.hidden = false;
    document.body.style.overflow = "hidden";
    jm.querySelector(".modal-opt").focus();
  }
  function closeJoin(){
    jm.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll("[data-join-open]").forEach(function(b){ b.addEventListener("click", openJoin); });
  document.getElementById("optStudent").addEventListener("click", function(){
    if (jm.dataset.mode === "connect"){ location.href = sub("find-us/"); return; }
    var form = document.getElementById("interest-form");
    if (form) form.scrollIntoView({behavior:"smooth", block:"center"});
    else location.href = home("#interest-form");
  });
  jm.addEventListener("click", function(e){ if (e.target.closest("[data-close]")) closeJoin(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !jm.hidden) closeJoin(); });
})();
