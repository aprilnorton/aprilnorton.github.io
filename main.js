/* =========================================================
   April Norton — portfolio interactions
   ========================================================= */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var C = {
    steel:  '#7C8A93',
    accent: '#C0562B',
    ink:    '#1F1B18',
    ink3:   '#8A7C6E',
    rule:   '#E0D3C1',
    wash:   '#F6E4D9'
  };

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- hero marquee ---------- */
  var stripShots = [
    'IMG_6750', 'IMG_7394', 'IMG_6819', 'IMG_6753', 'IMG_7368',
    'IMG_6697', 'IMG_7578', 'IMG_6737', 'IMG_6579', 'IMG_7367',
    'IMG_6752', 'IMG_7573'
  ];
  var strip = document.getElementById('strip');
  if (strip) {
    var html = stripShots.map(function (s) {
      return '<img src="images/' + s + '.jpg" alt="" loading="lazy">';
    }).join('');
    strip.innerHTML = html + html; // duplicate for seamless loop
  }

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('stuck', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- scroll reveal ---------- */
  var revealables = document.querySelectorAll('.rv');
  // Anything already at or above the fold on load (including a direct #anchor
  // landing) is shown straight away rather than waiting to be scrolled into view.
  revealables.forEach(function (n) {
    if (n.getBoundingClientRect().top < window.innerHeight * 1.1) n.classList.add('in');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealables.forEach(function (n) { io.observe(n); });
  } else {
    revealables.forEach(function (n) { n.classList.add('in'); });
  }

  /* ---------- nav active section ---------- */
  var ids = ['work', 'mandoline', 'mockup', 'mold', 'thermal', 'testing', 'about', 'contact'];
  var links = {};
  ids.forEach(function (id) {
    var a = document.querySelector('.nav-links a[href="#' + id + '"]');
    if (a) links[id] = a;
  });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          for (var k in links) links[k].classList.remove('active');
          var a = links[e.target.id];
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lb'),
      lbImg = document.getElementById('lbImg'),
      lbCap = document.getElementById('lbCap');
  var shots = Array.prototype.slice.call(document.querySelectorAll('figure.shot button'));
  var idx = -1, lastFocus = null;

  function show(i) {
    if (!shots.length) return;
    idx = (i + shots.length) % shots.length;
    var b = shots[idx];
    lbImg.src = b.getAttribute('data-full');
    lbImg.alt = b.querySelector('img') ? b.querySelector('img').alt : '';
    lbCap.innerHTML = b.getAttribute('data-cap') || '';
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lbX').focus();
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
    if (lastFocus) lastFocus.focus();
  }
  shots.forEach(function (b, i) {
    b.addEventListener('click', function () { open(i); });
  });
  document.getElementById('lbX').addEventListener('click', close);
  document.getElementById('lbP').addEventListener('click', function () { show(idx - 1); });
  document.getElementById('lbN').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* =========================================================
     CHARTS
     ========================================================= */
  fetch('data/thermal.json')
    .then(function (r) { return r.json(); })
    .then(function (d) { drawLines(d); drawDev(d); fillTable(d); })
    .catch(function () {
      // If opened via file:// without a server, fetch is blocked.
      var wraps = document.querySelectorAll('.chart-wrap');
      Array.prototype.forEach.call(wraps, function (w) {
        w.innerHTML = '<p style="font-size:.85rem;color:#8A7C6E;padding:1.5rem 0;margin:0">' +
          'Chart data needs a local server to load. Run <code>python3 -m http.server</code> ' +
          'in this folder and open <code>localhost:8000</code> — or view the deployed site.</p>';
      });
    });

  /* ---- line chart: 8 probes + mean ---- */
  function drawLines(d) {
    var svg = document.getElementById('chartLines');
    if (!svg) return;
    var W = 900, H = 400, M = { t: 18, r: 58, b: 40, l: 48 };
    var iw = W - M.l - M.r, ih = H - M.t - M.b;

    var xmax = 18;
    var ymin = 55, ymax = 220;
    var X = function (v) { return M.l + (v / xmax) * iw; };
    var Y = function (v) { return M.t + (1 - (v - ymin) / (ymax - ymin)) * ih; };

    // grid + y axis
    for (var v = 60; v <= 220; v += 40) {
      el('line', { x1: M.l, x2: M.l + iw, y1: Y(v), y2: Y(v), stroke: C.rule, 'stroke-width': 1 }, svg);
      var t = el('text', { x: M.l - 10, y: Y(v) + 4, 'text-anchor': 'end', fill: C.ink3,
        'font-size': 11, 'font-family': 'IBM Plex Mono, monospace' }, svg);
      t.textContent = v;
    }
    var yl = el('text', { x: M.l - 10, y: M.t - 4, 'text-anchor': 'end', fill: C.ink3,
      'font-size': 10, 'font-family': 'IBM Plex Mono, monospace' }, svg);
    yl.textContent = '°F';

    // x axis
    for (var m = 0; m <= 18; m += 3) {
      var xt = el('text', { x: X(m), y: H - 14, 'text-anchor': 'middle', fill: C.ink3,
        'font-size': 11, 'font-family': 'IBM Plex Mono, monospace' }, svg);
      xt.textContent = m;
    }
    var xl = el('text', { x: M.l + iw / 2, y: H - 1, 'text-anchor': 'middle', fill: C.ink3,
      'font-size': 10, 'font-family': 'IBM Plex Mono, monospace' }, svg);
    xl.textContent = 'MINUTES ELAPSED';

    // plateau band annotation
    el('rect', { x: X(4), y: M.t, width: X(8.5) - X(4), height: ih,
      fill: C.wash, opacity: .55 }, svg);
    var bl = el('text', { x: (X(4) + X(8.5)) / 2, y: M.t + 14, 'text-anchor': 'middle',
      fill: '#96401D', 'font-size': 10, 'font-family': 'IBM Plex Mono, monospace',
      'letter-spacing': '.08em' }, svg);
    bl.textContent = 'PLATEAU';

    // 212 reference line
    el('line', { x1: M.l, x2: M.l + iw, y1: Y(212), y2: Y(212), stroke: C.ink3,
      'stroke-width': 1, 'stroke-dasharray': '3 4' }, svg);
    var rl = el('text', { x: M.l + iw + 6, y: Y(212) + 4, fill: C.ink3, 'font-size': 10,
      'font-family': 'IBM Plex Mono, monospace' }, svg);
    rl.textContent = '212 ref';

    function path(vals) {
      var p = '';
      for (var i = 0; i < vals.length; i++) {
        p += (i ? 'L' : 'M') + X(d.t[i]).toFixed(1) + ' ' + Y(vals[i]).toFixed(1);
      }
      return p;
    }

    // 8 probe traces — one visual class, thin and low emphasis
    d.series.forEach(function (s) {
      el('path', { d: path(s.v), fill: 'none', stroke: C.steel, 'stroke-width': 1.4,
        opacity: .55, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    });
    // mean on top
    el('path', { d: path(d.mean), fill: 'none', stroke: C.accent, 'stroke-width': 2.4,
      'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);

    // hover layer
    var hoverLine = el('line', { y1: M.t, y2: M.t + ih, stroke: C.ink, 'stroke-width': 1,
      opacity: 0, 'pointer-events': 'none' }, svg);
    var hoverDot = el('circle', { r: 4.5, fill: C.accent, stroke: '#FAF5EE',
      'stroke-width': 2, opacity: 0, 'pointer-events': 'none' }, svg);
    var hit = el('rect', { x: M.l, y: M.t, width: iw, height: ih, fill: 'transparent',
      style: 'cursor:crosshair' }, svg);

    var tt = document.getElementById('tt1');
    var wrap = svg.parentNode;

    hit.addEventListener('mousemove', function (e) {
      var r = svg.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width * W;
      var mins = (px - M.l) / iw * xmax;
      // nearest sample by elapsed time (samples don't span the full axis)
      var i = 0, best = Infinity;
      for (var j = 0; j < d.t.length; j++) {
        var dd = Math.abs(d.t[j] - mins);
        if (dd < best) { best = dd; i = j; }
      }

      var vals = d.series.map(function (s) { return s.v[i]; });
      var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);

      hoverLine.setAttribute('x1', X(d.t[i]));
      hoverLine.setAttribute('x2', X(d.t[i]));
      hoverLine.setAttribute('opacity', .35);
      hoverDot.setAttribute('cx', X(d.t[i]));
      hoverDot.setAttribute('cy', Y(d.mean[i]));
      hoverDot.setAttribute('opacity', 1);

      tt.innerHTML = '<b>' + d.t[i].toFixed(1) + ' min</b><br>' +
        'mean <i>' + d.mean[i].toFixed(1) + ' °F</i><br>' +
        'range ' + lo.toFixed(1) + '–' + hi.toFixed(1) + ' °F<br>' +
        'spread ' + (hi - lo).toFixed(2) + ' °F';
      tt.style.opacity = 1;

      var wr = wrap.getBoundingClientRect();
      var lx = (X(d.t[i]) / W) * wr.width;
      tt.style.left = Math.min(wr.width - 130, Math.max(0, lx + 14)) + 'px';
      tt.style.top = Math.max(0, (Y(d.mean[i]) / H) * wr.height - 60) + 'px';
    });
    hit.addEventListener('mouseleave', function () {
      tt.style.opacity = 0;
      hoverLine.setAttribute('opacity', 0);
      hoverDot.setAttribute('opacity', 0);
    });
  }

  /* ---- deviation dot plot ---- */
  function drawDev(d) {
    var svg = document.getElementById('chartDev');
    if (!svg) return;
    var W = 900, H = 300, M = { t: 26, r: 70, b: 44, l: 190 };
    var iw = W - M.l - M.r, ih = H - M.t - M.b;
    var lim = 2;
    var X = function (v) { return M.l + ((v + lim) / (lim * 2)) * iw; };
    var rows = d.dev.slice().sort(function (a, b) { return b.dev - a.dev; });
    var step = ih / rows.length;

    // x grid
    for (var v = -2; v <= 2; v += 1) {
      el('line', { x1: X(v), x2: X(v), y1: M.t - 6, y2: M.t + ih,
        stroke: v === 0 ? C.ink3 : C.rule, 'stroke-width': 1 }, svg);
      var t = el('text', { x: X(v), y: H - 22, 'text-anchor': 'middle', fill: C.ink3,
        'font-size': 11, 'font-family': 'IBM Plex Mono, monospace' }, svg);
      t.textContent = (v > 0 ? '+' : '') + v.toFixed(0);
    }
    var xl = el('text', { x: M.l + iw / 2, y: H - 5, 'text-anchor': 'middle', fill: C.ink3,
      'font-size': 10, 'font-family': 'IBM Plex Mono, monospace' }, svg);
    xl.textContent = 'DEVIATION FROM GRAND MEAN (°F)';

    var tt = document.getElementById('tt2');
    var wrap = svg.parentNode;

    rows.forEach(function (r, i) {
      var y = M.t + step * (i + .5);

      // label
      var lab = el('text', { x: M.l - 14, y: y + 4, 'text-anchor': 'end', fill: C.ink,
        'font-size': 12 }, svg);
      lab.textContent = r.name === 'TOp LId' ? 'Top Lid' :
                        r.name === 'Caraffe' ? 'Carafe' : r.name;

      // stem from zero
      el('line', { x1: X(0), x2: X(r.dev), y1: y, y2: y, stroke: C.steel,
        'stroke-width': 2, 'stroke-linecap': 'round', opacity: .5 }, svg);

      // dot
      var g = el('g', { style: 'cursor:pointer' }, svg);
      el('circle', { cx: X(r.dev), cy: y, r: 14, fill: 'transparent' }, g);
      var dot = el('circle', { cx: X(r.dev), cy: y, r: 5.5, fill: C.accent,
        stroke: '#FAF5EE', 'stroke-width': 2 }, g);

      // value label
      var val = el('text', {
        x: X(r.dev) + (r.dev >= 0 ? 13 : -13), y: y + 4,
        'text-anchor': r.dev >= 0 ? 'start' : 'end',
        fill: C.ink3, 'font-size': 11,
        'font-family': 'IBM Plex Mono, monospace'
      }, svg);
      val.textContent = (r.dev > 0 ? '+' : '') + r.dev.toFixed(2);

      g.addEventListener('mouseenter', function () {
        dot.setAttribute('r', 7);
        tt.innerHTML = '<b>' + lab.textContent + '</b><br>' +
          'plateau mean <i>' + r.mean.toFixed(2) + ' °F</i><br>' +
          'deviation ' + (r.dev > 0 ? '+' : '') + r.dev.toFixed(2) + ' °F<br>' +
          'std. dev ' + r.sd.toFixed(2) + ' °F';
        tt.style.opacity = 1;
        var wr = wrap.getBoundingClientRect();
        tt.style.left = Math.min(wr.width - 150, (X(r.dev) / W) * wr.width + 16) + 'px';
        tt.style.top = Math.max(0, (y / H) * wr.height - 52) + 'px';
      });
      g.addEventListener('mouseleave', function () {
        dot.setAttribute('r', 5.5);
        tt.style.opacity = 0;
      });
    });

    // spread bracket
    var top = rows[0], bot = rows[rows.length - 1];
    var bx = X(top.dev) + 62;
    var note = el('text', { x: M.l + iw + 60, y: M.t + ih + 2, 'text-anchor': 'end',
      fill: '#96401D', 'font-size': 11, 'font-family': 'IBM Plex Mono, monospace' }, svg);
    note.textContent = 'total spread ' + d.spread.toFixed(2) + ' °F';
  }

  /* ---- table view ---- */
  function fillTable(d) {
    var tb = document.querySelector('#tbl1 tbody');
    if (!tb) return;
    d.dev.slice().sort(function (a, b) { return b.dev - a.dev; }).forEach(function (r) {
      var name = r.name === 'TOp LId' ? 'Top Lid' : r.name === 'Caraffe' ? 'Carafe' : r.name;
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + name + '</td><td>' + r.mean.toFixed(2) + '</td><td>' +
        (r.dev > 0 ? '+' : '') + r.dev.toFixed(2) + '</td><td>' + r.sd.toFixed(2) + '</td>';
      tb.appendChild(tr);
    });
    var tr2 = document.createElement('tr');
    tr2.innerHTML = '<td style="color:#8A7C6E">Grand mean</td><td style="color:#8A7C6E">' +
      d.grandMean.toFixed(2) + '</td><td style="color:#8A7C6E">spread ' +
      d.spread.toFixed(2) + '</td><td></td>';
    tb.appendChild(tr2);
  }
})();
