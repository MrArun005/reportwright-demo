/* ReportWright viewer loader: the viewer itself is in esm/ */
(function () {
  var s = document.currentScript, base = s && s.src ? s.src.replace(/[^/]*$/, '') : '/embed/';
  var ready = import(base + 'esm/viewer.js'), designer = null;
  window.ReportWright = window.Pagewright = { // Pagewright: the old name, deprecated (0.9)
    mountViewer: function (t, o) { return ready.then(function (m) { return m.mountViewer(t, o); }); },
    // the designer loads only when a page asks for it
    mountDesigner: function (t, o) { designer = designer || import(base + 'esm/designer.js'); return designer.then(function (m) { return m.mountDesigner(t, o); }); },
    ready: ready
  };
})();
