/*
 * Glass Dual Gauge for Home Assistant
 * Two concentric gauges on a frosted-glass card: one value on each ring,
 * with colour thresholds, zones, markers and a clear centre readout.
 * Single file, no build step, no dependencies.
 */
(() => {
  const VERSION = "1.3.1";
  const TAG = "glass-dual-gauge";
  const EDITOR_TAG = "glass-dual-gauge-editor";
  if (customElements.get(TAG)) return;

  // ------------------------------------------------------------------ geometry
  // The gauge is drawn in a 200 × 200 box. Angles are in degrees, 0 = top, clockwise.
  const C = 100;
  // Default ring thickness and the space between the rings (in the 200-unit drawing).
  const THICKNESS = { inner: 8, outer: 10, min: 2, max: 24 };
  const GAP = { def: 9, min: 0, max: 30 };
  const OUTER_EDGE = 89; // outside edge of the outer ring
  const MIN_INNER_HOLE = 40; // keep room in the middle for the readout

  /** Radius and thickness of each ring, from the chosen thicknesses and gap. */
  const ringGeometry = (innerW, outerW, gap) => {
    const ow = clamp(num(outerW, THICKNESS.outer), THICKNESS.min, THICKNESS.max);
    let iw = clamp(num(innerW, THICKNESS.inner), THICKNESS.min, THICKNESS.max);
    let g = clamp(num(gap, GAP.def), GAP.min, GAP.max);
    const or = OUTER_EDGE - ow / 2;
    let ir = or - ow / 2 - g - iw / 2;
    if (ir - iw / 2 < MIN_INNER_HOLE) {
      // Too thick for the space: shrink the gap first, then the inner ring.
      const over = MIN_INNER_HOLE - (ir - iw / 2);
      const fromGap = Math.min(over, g);
      g -= fromGap;
      ir += fromGap;
      if (ir - iw / 2 < MIN_INNER_HOLE) iw = Math.max(THICKNESS.min, 2 * (ir - MIN_INNER_HOLE));
    }
    return { outer: { r: or, w: ow }, inner: { r: ir, w: iw } };
  };
  const ARCS = [360, 300, 270, 240, 180];
  const DEFAULT_ARC = 270;
  const ANIM_MS = 900;

  const DEFAULT_COLORS = [
    { from: 0, color: "#38d6a0" },
    { from: 60, color: "#ffc857" },
    { from: 85, color: "#ff5c7a" },
  ];

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const num = (v, fallback) => (v === undefined || v === null || v === "" || Number.isNaN(Number(v)) ? fallback : Number(v));

  const polar = (r, deg) => {
    const a = (deg * Math.PI) / 180;
    return [C + r * Math.sin(a), C - r * Math.cos(a)];
  };

  const arcPath = (r, a1, a2) => {
    if (a2 < a1) [a1, a2] = [a2, a1];
    const span = Math.min(a2 - a1, 359.99);
    const [x1, y1] = polar(r, a1);
    const [x2, y2] = polar(r, a1 + span);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  // ------------------------------------------------------------------ colour
  const parseHex = (c) => {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c || "").trim());
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.replace(/./g, (x) => x + x);
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  const mix = (a, b, t) => {
    const ca = parseHex(a);
    const cb = parseHex(b);
    if (!ca || !cb) return t < 0.5 ? a : b;
    const m = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
    return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
  };

  /**
   * Colour stops for a gauge, sorted by value. `colors` uses "from" (the colour applies
   * from this value up). A single `color` paints the whole ring.
   */
  const colorStops = (g) => {
    if (Array.isArray(g.colors) && g.colors.length) {
      return g.colors.map((s) => ({ from: num(s.from, g.min), color: s.color })).sort((a, b) => a.from - b.from);
    }
    if (g.color) return [{ from: g.min, color: g.color }];
    // Default stops are percentages of the range.
    return DEFAULT_COLORS.map((s) => ({ from: g.min + ((g.max - g.min) * s.from) / 100, color: s.color }));
  };

  const colorAt = (g, value) => {
    const stops = colorStops(g);
    if (stops.length === 1 || value <= stops[0].from) return stops[0].color;
    let i = 0;
    while (i < stops.length - 1 && value >= stops[i + 1].from) i++;
    if (g.color_mode !== "gradient" || i === stops.length - 1) return stops[i].color;
    const lo = stops[i];
    const hi = stops[i + 1];
    return mix(lo.color, hi.color, (value - lo.from) / (hi.from - lo.from || 1));
  };

  // ------------------------------------------------------------------ config
  const normaliseGauge = (g, ring) => {
    if (!g || typeof g !== "object") throw new Error(`The ${ring} gauge needs an entity.`);
    if (!g.entity) throw new Error(`The ${ring} gauge needs an entity.`);
    const min = num(g.min, 0);
    const max = num(g.max, 100);
    if (max <= min) throw new Error(`The ${ring} gauge's max must be bigger than its min.`);
    return {
      ...g,
      ring,
      min,
      max,
      decimals: g.decimals === undefined || g.decimals === "" ? null : clamp(Math.round(Number(g.decimals)), 0, 6),
      color_mode: g.color_mode === "gradient" ? "gradient" : "steps",
      bidirectional: !!g.bidirectional,
      markers: Array.isArray(g.markers) ? g.markers : [],
      zones: Array.isArray(g.zones) ? g.zones : [],
    };
  };

  const normalise = (config) => {
    if (!config || !Array.isArray(config.gauges) || config.gauges.length !== 2) {
      throw new Error("Add exactly two gauges under 'gauges': the first is the inner ring, the second the outer ring.");
    }
    const swap = !!config.flip;
    const [first, second] = swap ? [config.gauges[1], config.gauges[0]] : config.gauges;
    const arc = ARCS.includes(Number(config.arc)) ? Number(config.arc) : DEFAULT_ARC;
    let primary = config.primary || "inner";
    if (primary !== "inner" && primary !== "outer") primary = "inner";
    const inner = normaliseGauge(first, "inner");
    const outer = normaliseGauge(second, "outer");
    return {
      name: config.name || "",
      arc,
      primary,
      geo: ringGeometry(inner.thickness, outer.thickness, config.ring_gap),
      track_color: parseHex(config.track_color) ? config.track_color : null,
      theme: ["dark", "light"].includes(config.theme) ? config.theme : "auto",
      glass: config.glass !== false,
      show_scale: config.show_scale !== false,
      style: METER_KEYS.includes(config.style) ? config.style : "rings",
      inner,
      outer,
    };
  };

  // ------------------------------------------------------------------ styles
  const STYLE = `
  :host { display:block; height:100%; }
  * { box-sizing: border-box; }
  .card { position:relative; overflow:hidden; height:100%; padding: 16px 18px 18px; display:flex; flex-direction:column;
    border-radius: var(--ha-card-border-radius, 22px); color: var(--g-fg); isolation:isolate;
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif));
    --g-fg: #f4f7ff; --g-fg-rgb: 244,247,255; --g-dim: rgba(244,247,255,.62); --g-track: rgba(255,255,255,.09);
    --g-tick: rgba(255,255,255,.28); --g-tick-major: rgba(255,255,255,.55); --g-knob: #ffffff; }
  .card.glass { background:
      radial-gradient(120% 90% at 0% 0%, rgba(110,130,255,.20), transparent 55%),
      radial-gradient(120% 90% at 100% 100%, rgba(34,211,197,.14), transparent 55%),
      linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.04) 60%, rgba(255,255,255,.08)),
      rgba(14,18,36,.55);
    -webkit-backdrop-filter: blur(24px) saturate(170%); backdrop-filter: blur(24px) saturate(170%);
    border: 1px solid rgba(255,255,255,.18);
    box-shadow: 0 18px 50px -18px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.32), inset 0 -1px 0 rgba(255,255,255,.05); }
  .card.glass::before { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:-1;
    background: linear-gradient(115deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 34%); }
  .card.plain { background: var(--ha-card-background, var(--card-background-color, #1c1c1f)); border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, transparent)); box-shadow: var(--ha-card-box-shadow, none); }
  .card.light { --g-fg: #131a33; --g-fg-rgb: 19,26,51; --g-dim: rgba(19,26,51,.6); --g-track: rgba(19,26,51,.08);
    --g-tick: rgba(19,26,51,.22); --g-tick-major: rgba(19,26,51,.45); --g-knob: #ffffff; }
  .card.light.glass { background:
      radial-gradient(120% 90% at 0% 0%, rgba(110,130,255,.18), transparent 55%),
      radial-gradient(120% 90% at 100% 100%, rgba(34,211,197,.14), transparent 55%),
      linear-gradient(150deg, rgba(255,255,255,.85), rgba(255,255,255,.55));
    border-color: rgba(255,255,255,.75); box-shadow: 0 18px 44px -20px rgba(30,40,90,.35), inset 0 1px 0 rgba(255,255,255,.9); }
  .card.light.plain { background: var(--ha-card-background, var(--card-background-color, #ffffff)); }
  .card.light .knob { filter: drop-shadow(0 1px 2px rgba(19,26,51,.35)); }

  .head { flex:none; display:flex; align-items:baseline; justify-content:space-between; gap:12px; min-height: 22px; margin-bottom: 4px; }
  .title { font-size: 15px; font-weight: 600; letter-spacing: .01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .legend { flex:none; display:flex; gap: 6px 14px; font-size: 12px; color: var(--g-dim); flex-wrap: wrap; justify-content:center; margin-top: 6px; }
  .legend:empty { display:none; }
  .legend span { display:inline-flex; align-items:center; gap:6px; white-space:nowrap; }
  .legend i { width:8px; height:8px; border-radius:50%; background: var(--c, currentColor); box-shadow: 0 0 8px var(--c, transparent); }

  .gauge { position:relative; flex:none; width:100%; max-width: var(--g-max, 340px); margin: auto; aspect-ratio: 1; container-type: inline-size; }
  svg { position:absolute; inset:0; width:100%; height:100%; overflow: visible; }
  .track { fill:none; stroke: var(--g-track); stroke-linecap: round; }
  .zone { fill:none; stroke-linecap: butt; }
  .fill { fill:none; stroke-linecap: round; transition: stroke .5s ease; }
  .fill.off { opacity: 0; }
  .knob { fill: var(--g-knob); filter: drop-shadow(0 0 3px rgba(0,0,0,.45)); transition: opacity .3s; }
  .knob.off { opacity:0; }
  .zero { stroke: rgba(var(--g-fg-rgb), .55); stroke-width: 1.2; stroke-linecap: round; }
  .tick { stroke: var(--g-tick); stroke-width: .7; stroke-linecap: round; }
  .tick.major { stroke: var(--g-tick-major); stroke-width: 1.1; }
  .scale { fill: var(--g-dim); font-size: 6.5px; font-weight: 500; font-variant-numeric: tabular-nums; }
  .marker { stroke-width: 1.6; stroke-linecap: round; }
  .marker-label { font-size: 6px; font-weight: 600; }
  .hit { fill:none; stroke: transparent; cursor:pointer; pointer-events: stroke; }
  .hit:focus-visible { outline:none; stroke: rgba(var(--g-fg-rgb), .18); }

  .center { position:absolute; left:0; right:0; top:0; height: calc(100% * 200 / var(--h, 200)); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; pointer-events:none; padding: 0 26%; }
  .gauge.half .center { height:100%; justify-content:flex-end; padding-bottom: 4%; }
  .center button { pointer-events:auto; font:inherit; color:inherit; background:none; border:0; padding: 0; cursor:pointer; -webkit-tap-highlight-color: transparent; }
  .label { font-size: calc(3.6cqw * var(--s, 1)); letter-spacing: .14em; text-transform: uppercase; color: var(--g-dim); font-weight: 600; max-width: 100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .big { display:flex; align-items:baseline; justify-content:center; gap: .8cqw; line-height: 1; margin: calc(1.6cqw * var(--s, 1)) 0 calc(2.2cqw * var(--s, 1)); }
  .big .v { font-size: calc(15.5cqw * var(--s, 1)); font-weight: 300; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
  .big .u { font-size: calc(5.2cqw * var(--s, 1)); color: var(--g-dim); font-weight: 500; }
  .divider { width: calc(22cqw * var(--s, 1)); height: 1px; background: linear-gradient(90deg, transparent, rgba(var(--g-fg-rgb), .28), transparent); margin-bottom: 2.4cqw; }
  .small { display:flex; align-items:center; justify-content:center; gap: 1.6cqw; font-size: calc(5.2cqw * var(--s, 1)); font-variant-numeric: tabular-nums; font-weight: 500; }
  .small .u { color: var(--g-dim); font-size: calc(3.8cqw * var(--s, 1)); }
  .small i { width: 2.2cqw; height: 2.2cqw; border-radius:50%; background: var(--c); box-shadow: 0 0 1.6cqw var(--c); flex:none; }
  .small-label { font-size: calc(3.2cqw * var(--s, 1)); color: var(--g-dim); margin-top: .8cqw; letter-spacing: .06em; max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .unavail { margin: -1cqw 0 2.4cqw; }
  .gauge.half .divider, .gauge.half .small-label:not(.unavail) { display:none; }
  .gauge.half .big { margin-bottom: 1.4cqw; }
  .na { opacity: .45; }
  .st { fill: var(--g-fg); font-variant-numeric: tabular-nums; }
  .sd { fill: var(--g-dim); }
  .on { fill: #0b1020; opacity: .82; }
  .tap { cursor: pointer; }
  .meter-liquid .center { text-shadow: 0 1px 10px rgba(0,0,0,.45); }
  .error { padding: 16px; color: #ff9cb0; font-size: 14px; }
  @media (prefers-reduced-motion: reduce) { .fill { transition: none; } }
  `;

  // ------------------------------------------------------------------ meter styles
  // Every style except "rings" is drawn in full on each frame from a small context:
  //   ctx.i / ctx.o : { t (0..1), t2 (0..2, for going over the max), color, text, unit, name, ring, na }
  //   ctx.arc, ctx.glow (filter url), ctx.track (track stroke attributes), ctx.phase (for motion)
  // Coordinates are in a 200-wide box with the centre at (100, 100) unless a style says otherwise.
  const f1 = (v) => (Math.round(v * 10) / 10).toString();
  const P = (r, deg, cx = 100, cy = 100) => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  };
  const arcAt = (r, a1, a2, cx = 100, cy = 100) => {
    if (a2 < a1) [a1, a2] = [a2, a1];
    const span = Math.min(a2 - a1, 359.99);
    const [x1, y1] = P(r, a1, cx, cy);
    const [x2, y2] = P(r, a1 + span, cx, cy);
    return `M${f1(x1)} ${f1(y1)} A${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${f1(x2)} ${f1(y2)}`;
  };
  const line = (x1, y1, x2, y2, attrs) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" ${attrs}/>`;
  const T = (x, y, size, content, cls = "st", anchor = "middle", weight = 500) =>
    `<text class="${cls}" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="font-size:${size}px;font-weight:${weight}">${content}</text>`;
  const valueText = (v, size, unitSize) =>
    `${esc(v.text)}${v.unit && !v.na ? `<tspan class="sd" style="font-size:${unitSize}px;font-weight:500"> ${esc(v.unit)}</tspan>` : ""}`;
  // A "● value unit" line under a drawing, for styles that don't use the centre readout.
  const footer = (ctx, y, size = 12) => {
    const dot = (v, x) =>
      `<circle cx="${f1(x)}" cy="${f1(y - size * 0.35)}" r="${f1(size * 0.28)}" fill="${v.na ? "transparent" : v.color}" stroke="${v.na ? "var(--g-track)" : "none"}"/>`;
    return `<g data-ring="inner" class="tap">${dot(ctx.i, 50)}${T(58, y, size, valueText(ctx.i, size, size * 0.72), "st", "start")}${T(58, y + size * 1.15, size * 0.66, esc(ctx.i.name), "sd", "start", 400)}</g>
      <g data-ring="outer" class="tap">${dot(ctx.o, 112)}${T(120, y, size, valueText(ctx.o, size, size * 0.72), "st", "start")}${T(120, y + size * 1.15, size * 0.66, esc(ctx.o.name), "sd", "start", 400)}</g>`;
  };

  const METERS = {
    rings: { label: "Rings", desc: "Two smooth arcs" },

    orbit: {
      label: "Orbit",
      desc: "Moons with fading tails",
      center: true,
      scale: 0.9,
      draw(ctx) {
        let o = `<circle cx="100" cy="100" r="84" fill="none" ${ctx.track} stroke-width="1.4"/><circle cx="100" cy="100" r="64" fill="none" ${ctx.track} stroke-width="1.4"/>`;
        for (const [r, v, size] of [[84, ctx.o, 8], [64, ctx.i, 6.5]]) {
          if (v.na) continue;
          const d = v.t * 360;
          let trail = "";
          for (let k = 12; k > 0; k--) {
            const [x, y] = P(r, d - k * 4.5);
            trail += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(size * (1 - k / 14))}" fill="${v.color}" opacity="${f1(0.55 - k * 0.04)}"/>`;
          }
          const [x, y] = P(r, d);
          o += `<g data-ring="${v.ring}" class="tap">${trail}<circle cx="${f1(x)}" cy="${f1(y)}" r="${size}" fill="${v.color}" filter="${ctx.glow}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(size * 0.4)}" fill="#fff" opacity=".85"/></g>`;
        }
        return o;
      },
    },

    liquid: {
      label: "Liquid",
      desc: "A bowl that fills up",
      center: true,
      scale: 0.88,
      usesArc: true,
      draw(ctx) {
        const r = 56;
        const level = 100 + r - ctx.i.t * r * 2;
        let wave = `M${100 - r - 4} ${f1(level)}`;
        for (let x = 100 - r - 4; x <= 100 + r + 4; x += 4) wave += ` L${x} ${f1(level + Math.sin(x / 13 + ctx.phase) * (ctx.i.t > 0.02 && ctx.i.t < 0.98 ? 2.6 : 0))}`;
        wave += ` L${100 + r + 4} ${100 + r + 4} L${100 - r - 4} ${100 + r + 4} Z`;
        const a = ctx.arc;
        return `<defs><clipPath id="bowl"><circle cx="100" cy="100" r="${r}"/></clipPath></defs>
          <g data-ring="inner" class="tap"><circle cx="100" cy="100" r="${r}" fill="rgba(var(--g-fg-rgb),.04)" ${ctx.track} stroke-width="1.6"/>
          ${ctx.i.na ? "" : `<path d="${wave}" fill="${ctx.i.color}" opacity=".78" clip-path="url(#bowl)"/>`}</g>
          <g data-ring="outer" class="tap"><path d="${arcAt(80, -a / 2, a / 2)}" fill="none" ${ctx.track} stroke-width="9" stroke-linecap="round"/>
          ${ctx.o.na || ctx.o.t < 0.005 ? "" : `<path d="${arcAt(80, -a / 2, -a / 2 + ctx.o.t * a)}" fill="none" stroke="${ctx.o.color}" stroke-width="9" stroke-linecap="round" filter="${ctx.glow}"/>`}</g>`;
      },
    },

    butterfly: {
      label: "Butterfly",
      desc: "Two wings, side by side",
      draw(ctx) {
        const wing = (v, a1, a2, flip) => {
          const span = a2 - a1;
          const fill = v.na || v.t < 0.005 ? "" : flip ? arcAt(78, a2 - v.t * span, a2) : arcAt(78, a1, a1 + v.t * span);
          return `<g data-ring="${v.ring}" class="tap"><path d="${arcAt(78, a1, a2)}" fill="none" ${ctx.track} stroke-width="14" stroke-linecap="round"/>
            ${fill ? `<path d="${fill}" fill="none" stroke="${v.color}" stroke-width="14" stroke-linecap="round" filter="${ctx.glow}"/>` : ""}</g>`;
        };
        return `${wing(ctx.i, -160, -20, false)}${wing(ctx.o, 20, 160, true)}
          ${line(100, 30, 100, 170, `stroke="var(--g-track)" stroke-width="1"`)}
          <g data-ring="inner" class="tap">${T(72, 104, 16, valueText(ctx.i, 16, 8))}${T(72, 120, 8, esc(ctx.i.name), "sd", "middle", 400)}</g>
          <g data-ring="outer" class="tap">${T(128, 104, 16, valueText(ctx.o, 16, 8))}${T(128, 120, 8, esc(ctx.o.name), "sd", "middle", 400)}</g>`;
      },
    },

    segments: {
      label: "Segments",
      desc: "Pills that light up",
      center: true,
      scale: 0.9,
      usesArc: true,
      draw(ctx) {
        const a = ctx.arc;
        let o = "";
        for (const [r, v, n, len, w] of [[84, ctx.o, 36, 11, 4.8], [64, ctx.i, 26, 10, 4.4]]) {
          const lit = v.na ? 0 : Math.round(v.t * n);
          let on = "";
          let off = "";
          for (let k = 0; k < n; k++) {
            const d = a >= 360 ? (k * 360) / n : -a / 2 + (k * a) / (n - 1);
            const [x1, y1] = P(r - len / 2, d);
            const [x2, y2] = P(r + len / 2, d);
            if (k < lit) on += line(x1, y1, x2, y2, `stroke="${v.color}" stroke-width="${w}" stroke-linecap="round"`);
            else off += line(x1, y1, x2, y2, `${ctx.track} stroke-width="${w}" stroke-linecap="round"`);
          }
          o += `<g data-ring="${v.ring}" class="tap">${off}<g filter="${ctx.glow}">${on}</g></g>`;
        }
        return o;
      },
    },

    pulse: {
      label: "Pulse",
      desc: "Spokes like an equaliser",
      center: true,
      scale: 0.82,
      draw(ctx) {
        const n = 64;
        const lit = ctx.o.na ? 0 : Math.round(ctx.o.t * n);
        let on = "";
        let off = "";
        for (let k = 0; k < n; k++) {
          const d = (k * 360) / n;
          const wob = 0.5 + 0.5 * Math.abs(Math.sin(k * 1.7 + ctx.phase * 0.6));
          const len = k < lit ? 8 + 16 * wob : 4;
          const [x1, y1] = P(66, d);
          const [x2, y2] = P(66 + len, d);
          if (k < lit) on += line(x1, y1, x2, y2, `stroke="${ctx.o.color}" stroke-width="2.6" stroke-linecap="round"`);
          else off += line(x1, y1, x2, y2, `${ctx.track} stroke-width="2.6" stroke-linecap="round"`);
        }
        const i = ctx.i;
        return `<g data-ring="outer" class="tap">${off}<g filter="${ctx.glow}">${on}</g></g>
          <g data-ring="inner" class="tap"><circle cx="100" cy="100" r="56" fill="none" ${ctx.track} stroke-width="3"/>
          ${i.na || i.t < 0.005 ? "" : `<path d="${arcAt(56, 0, i.t * 360)}" fill="none" stroke="${i.color}" stroke-width="3" stroke-linecap="round" filter="${ctx.glow}"/>`}</g>`;
      },
    },

    needles: {
      label: "Needles",
      desc: "Classic dial, two hands",
      draw(ctx) {
        let o = `<circle cx="100" cy="94" r="86" fill="rgba(var(--g-fg-rgb),.03)" ${ctx.track} stroke-width="1.2"/>`;
        for (let k = 0; k <= 40; k++) {
          const d = -120 + k * 6;
          const major = k % 10 === 0;
          const [x1, y1] = P(major ? 66 : 71, d, 100, 94);
          const [x2, y2] = P(77, d, 100, 94);
          o += line(x1, y1, x2, y2, `stroke="${major ? "var(--g-tick-major)" : "var(--g-tick)"}" stroke-width="${major ? 1.6 : 0.8}" stroke-linecap="round"`);
        }
        if (!ctx.o.na && ctx.o.t > 0.005) o += `<path d="${arcAt(58, -120, -120 + ctx.o.t * 240, 100, 94)}" fill="none" stroke="${ctx.o.color}" stroke-width="4" stroke-linecap="round" opacity=".5"/>`;
        if (!ctx.i.na && ctx.i.t > 0.005) o += `<path d="${arcAt(50, -120, -120 + ctx.i.t * 240, 100, 94)}" fill="none" stroke="${ctx.i.color}" stroke-width="3" stroke-linecap="round" opacity=".45"/>`;
        for (const [v, len, w] of [[ctx.i, 60, 2.6], [ctx.o, 76, 3.4]]) {
          if (v.na) continue;
          const d = -120 + v.t * 240;
          const [x, y] = P(len, d, 100, 94);
          const [bx, by] = P(-12, d, 100, 94);
          o += `<g data-ring="${v.ring}" class="tap">${line(bx, by, x, y, `stroke="${v.color}" stroke-width="${w}" stroke-linecap="round" filter="${ctx.glow}"`)}</g>`;
        }
        return `${o}<circle cx="100" cy="94" r="6.5" fill="var(--g-fg)"/><circle cx="100" cy="94" r="2.5" fill="var(--g-track)"/>${footer(ctx, 172, 12)}`;
      },
      h: 196,
    },

    spiral: {
      label: "Spiral",
      desc: "Keeps going past 100%",
      center: true,
      scale: 0.7,
      draw(ctx) {
        const rAt = (t) => 88 - 13 * t;
        const path = (t1, t2) => {
          let d = "";
          for (let t = t1; t <= t2 + 1e-6; t += 0.008) {
            const tt = Math.min(t, t2);
            const [x, y] = P(rAt(tt), tt * 360);
            d += `${d ? " L" : "M"}${f1(x)} ${f1(y)}`;
          }
          return d;
        };
        const o = ctx.o;
        const i = ctx.i;
        return `<g data-ring="outer" class="tap"><path d="${path(0, 2)}" fill="none" ${ctx.track} stroke-width="8" stroke-linecap="round"/>
          ${o.na || o.t2 < 0.005 ? "" : `<path d="${path(0, o.t2)}" fill="none" stroke="${o.color}" stroke-width="8" stroke-linecap="round" filter="${ctx.glow}"/>`}</g>
          <g data-ring="inner" class="tap"><circle cx="100" cy="100" r="50" fill="none" ${ctx.track} stroke-width="3"/>
          ${i.na || i.t < 0.005 ? "" : `<path d="${arcAt(50, 0, i.t * 360)}" fill="none" stroke="${i.color}" stroke-width="3" stroke-linecap="round"/>`}</g>`;
      },
    },

    moon: {
      label: "Moon",
      desc: "A phase that waxes",
      draw(ctx) {
        const r = 46;
        const cy = 86;
        const i = ctx.i;
        const k = i.t * 2 - 1;
        const rx = Math.abs(k) * r;
        let lit = "";
        if (!i.na && i.t >= 0.995) lit = `<circle cx="100" cy="${cy}" r="${r}" fill="${i.color}"/>`;
        else if (!i.na && i.t > 0.005)
          lit = `<path d="M100 ${cy - r} A${r} ${r} 0 0 1 100 ${cy + r} A${f1(rx)} ${r} 0 0 ${k < 0 ? 0 : 1} 100 ${cy - r} Z" fill="${i.color}"/>`;
        const o = ctx.o;
        return `<g data-ring="inner" class="tap"><circle cx="100" cy="${cy}" r="${r}" fill="rgba(var(--g-fg-rgb),.05)" ${ctx.track} stroke-width="1.4"/><g filter="${ctx.glow}">${lit}</g></g>
          <g data-ring="outer" class="tap"><circle cx="100" cy="${cy}" r="66" fill="none" ${ctx.track} stroke-width="3.4"/>
          ${o.na || o.t < 0.005 ? "" : `<path d="${arcAt(66, 0, o.t * 360, 100, cy)}" fill="none" stroke="${o.color}" stroke-width="3.4" stroke-linecap="round" filter="${ctx.glow}"/>`}</g>
          ${footer(ctx, 176, 12)}`;
      },
      h: 198,
    },

    dots: {
      label: "Dot grid",
      desc: "Dots that fill in",
      draw(ctx) {
        const cy = 84;
        const inner = [];
        const edge = [];
        for (let y = -6; y <= 6; y++)
          for (let x = -6; x <= 6; x++) {
            const d = x * x + y * y;
            if (d > 42) continue;
            (d >= 26 ? edge : inner).push([x, y]);
          }
        inner.sort((p, q) => q[1] - p[1] || p[0] - q[0]);
        const clockwise = ([x, y]) => (Math.atan2(x, -y) + 2 * Math.PI) % (2 * Math.PI); // 0 at the top
        edge.sort((p, q) => clockwise(p) - clockwise(q));
        const dot = ([x, y], fill) => `<circle cx="${100 + x * 11}" cy="${cy + y * 11}" r="4.1" fill="${fill}"/>`;
        const draw = (list, v) => {
          const lit = v.na ? 0 : Math.round(v.t * list.length);
          const on = list.slice(0, lit).map((p) => dot(p, v.color)).join("");
          const off = list.slice(lit).map((p) => dot(p, "var(--g-track)")).join("");
          return `<g data-ring="${v.ring}" class="tap">${off}<g filter="${ctx.glow}">${on}</g></g>`;
        };
        return `${draw(inner, ctx.i)}${draw(edge, ctx.o)}${footer(ctx, 176, 12)}`;
      },
      h: 198,
    },

    bloom: {
      label: "Bloom",
      desc: "Petals that open",
      draw(ctx) {
        const cy = 86;
        const n = 12;
        const i = ctx.i;
        const o = ctx.o;
        const lit = o.na ? 0 : Math.round(o.t * n);
        const len = 22 + (i.na ? 0 : i.t) * 36;
        const wid = 7 + (i.na ? 0 : i.t) * 8;
        let on = "";
        let off = "";
        for (let k = 0; k < n; k++) {
          const petal = `<ellipse cx="100" cy="${f1(cy - 20 - len / 2)}" rx="${f1(wid)}" ry="${f1(len / 2)}" transform="rotate(${k * 30} 100 ${cy})"`;
          if (k < lit) on += `${petal} fill="${o.color}" opacity="${f1(0.55 + 0.4 * ((k % 3) / 2))}"/>`;
          else off += `${petal} fill="none" ${ctx.track} stroke-width="1.2"/>`;
        }
        return `<g data-ring="outer" class="tap">${off}<g filter="${ctx.glow}">${on}</g></g>
          <g data-ring="inner" class="tap"><circle cx="100" cy="${cy}" r="18" fill="${i.na ? "var(--g-track)" : i.color}" filter="${ctx.glow}"/>
          ${T(100, cy + 4.5, 12, esc(i.na ? "–" : Math.round(i.t * 100) + "%"), "on")}</g>
          ${footer(ctx, 176, 12)}`;
      },
      h: 198,
    },

    capsules: {
      label: "Capsules",
      desc: "Two tubes, side by side",
      draw(ctx) {
        const tube = (x, v) => {
          const top = 16;
          const h = 128;
          const fh = v.na ? 0 : v.t * (h - 10);
          return `<g data-ring="${v.ring}" class="tap"><rect x="${x}" y="${top}" width="34" height="${h}" rx="17" fill="rgba(var(--g-fg-rgb),.04)" ${ctx.track} stroke-width="1.6"/>
            ${fh > 0.5 ? `<rect x="${x + 5}" y="${f1(top + h - 5 - fh)}" width="24" height="${f1(fh)}" rx="12" fill="${v.color}" filter="${ctx.glow}"/>` : ""}
            ${T(x + 17, top + h + 20, 15, valueText(v, 15, 9))}${T(x + 17, top + h + 32, 8.5, esc(v.name), "sd", "middle", 400)}</g>`;
        };
        let ticks = "";
        for (let k = 0; k <= 4; k++) ticks += line(97, 21 + k * 29.5, 103, 21 + k * 29.5, `stroke="var(--g-tick-major)" stroke-width="1"`);
        return tube(46, ctx.i) + ticks + tube(120, ctx.o);
      },
      h: 184,
    },

    tape: {
      label: "Tape",
      desc: "A scrolling scale",
      draw(ctx) {
        const g = ctx.oGauge;
        const v = ctx.o;
        const span = g.max - g.min;
        const value = g.min + v.t * span;
        const window = span * 0.42;
        const per = 164 / window;
        const raw = span / 24;
        const mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw;
        let ticks = "";
        const first = Math.ceil((value - window / 2) / step) * step;
        for (let x = first; x <= value + window / 2 + 1e-9; x += step) {
          if (x < g.min - 1e-9 || x > g.max + 1e-9) continue;
          const px = 100 + (x - value) * per;
          const n = Math.round(x / step);
          const major = n % 5 === 0;
          ticks += line(px, major ? 50 : 58, px, 76, `stroke="${major ? "var(--g-tick-major)" : "var(--g-tick)"}" stroke-width="${major ? 1.5 : 0.9}"`);
          if (major) ticks += T(px, 88, 8, esc(f1(x)), "sd", "middle", 500);
        }
        const i = ctx.i;
        return `<defs><clipPath id="tapewin"><rect x="18" y="38" width="164" height="58" rx="10"/></clipPath></defs>
          <g data-ring="outer" class="tap">${T(100, 26, 22, valueText(v, 22, 11))}
          <rect x="18" y="38" width="164" height="58" rx="10" fill="rgba(var(--g-fg-rgb),.04)" ${ctx.track} stroke-width="1.4"/>
          <g clip-path="url(#tapewin)">${v.na ? "" : ticks}</g>
          <path d="M93 38 L107 38 L100 47 Z" fill="${v.na ? "var(--g-track)" : v.color}" filter="${ctx.glow}"/>${line(100, 44, 100, 80, `stroke="${v.na ? "var(--g-track)" : v.color}" stroke-width="2"`)}</g>
          ${T(100, 108, 8.5, esc(v.name), "sd", "middle", 400)}
          <g data-ring="inner" class="tap"><rect x="18" y="120" width="164" height="10" rx="5" fill="none" ${ctx.track} stroke-width="1.2"/>
          ${i.na || i.t < 0.005 ? "" : `<rect x="20" y="122" width="${f1(160 * i.t)}" height="6" rx="3" fill="${i.color}" filter="${ctx.glow}"/>`}
          ${T(18, 148, 9, esc(i.name), "sd", "start", 400)}${T(182, 148, 11, valueText(i, 11, 8), "st", "end")}</g>`;
      },
      h: 156,
    },
  };
  const METER_KEYS = Object.keys(METERS);

  // ------------------------------------------------------------------ the card
  class GlassDualGauge extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._shown = { inner: null, outer: null };
      this._anim = {};
    }

    static getConfigElement() {
      return document.createElement(EDITOR_TAG);
    }

    static getStubConfig(hass) {
      const sensors = Object.keys((hass && hass.states) || {}).filter((id) => {
        if (!id.startsWith("sensor.")) return false;
        const s = hass.states[id];
        return !Number.isNaN(Number(s.state)) && s.attributes.unit_of_measurement;
      });
      const pick = (cls) => sensors.find((id) => hass.states[id].attributes.device_class === cls);
      const a = pick("temperature") || sensors[0] || "sensor.inside_temperature";
      const b = pick("humidity") || sensors.find((id) => id !== a) || "sensor.inside_humidity";
      return {
        name: "Climate",
        gauges: [
          { entity: a, min: 0, max: 40, colors: [{ from: 0, color: "#6cb6ff" }, { from: 18, color: "#38d6a0" }, { from: 26, color: "#ffc857" }, { from: 30, color: "#ff5c7a" }], color_mode: "gradient" },
          { entity: b, min: 0, max: 100, colors: [{ from: 0, color: "#ffc857" }, { from: 35, color: "#38d6a0" }, { from: 65, color: "#6cb6ff" }] },
        ],
      };
    }

    setConfig(config) {
      this._raw = config;
      try {
        this._config = normalise(config);
        this._error = null;
      } catch (err) {
        this._config = null;
        this._error = err.message;
      }
      this._shown = { inner: null, outer: null };
      this._render();
      if (this._hass) this._update(false);
    }

    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      if (!this._config) return;
      const dark = hass.themes && typeof hass.themes.darkMode === "boolean" ? hass.themes.darkMode : true;
      if (dark !== this._dark) {
        this._dark = dark;
        this._applyTheme();
      }
      this._update(!first);
    }

    /** Height of the drawing for the current style, in the 200-wide drawing units. */
    _drawingHeight() {
      const cfg = this._config;
      if (!cfg) return 200;
      if (cfg.style !== "rings") return METERS[cfg.style].h || 200;
      // Crop the empty space below arcs that don't close at the bottom.
      const below = cfg.arc >= 360 ? 100 : Math.max(0, -Math.cos(((cfg.arc / 2) * Math.PI) / 180)) * 92 + 24;
      return Math.round(Math.min(200, 100 + below));
    }

    // Masonry dashboards: about 50 px per unit.
    getCardSize() {
      return Math.max(3, Math.ceil((60 + 300 * (this._drawingHeight() / 200)) / 50));
    }

    // Sections dashboards: half a section wide, and tall enough for the gauge at that width
    // (a row is 56 px plus an 8 px gap; a half-width card is about 240 px wide).
    getGridOptions() {
      const rows = Math.ceil((60 + 240 * (this._drawingHeight() / 200) + 8) / 64);
      return { columns: 6, rows: Math.max(3, rows), min_columns: 3, min_rows: 2 };
    }

    /**
     * When the dashboard gives the card a fixed height (sections view, grids, panel),
     * shrink the gauge until it fits instead of clipping it. With a free height (masonry)
     * nothing overflows, so nothing changes.
     */
    _fit() {
      const card = this.shadowRoot.querySelector(".card");
      const gauge = this.shadowRoot.querySelector(".gauge");
      if (!card || !gauge) return;
      gauge.style.maxWidth = "";
      const over = card.scrollHeight - card.clientHeight;
      if (over > 1) {
        const width = gauge.getBoundingClientRect().width;
        const fitted = Math.max(90, width - (over * 200) / this._drawingHeight());
        gauge.style.maxWidth = `${Math.floor(fitted)}px`;
      }
    }

    _observeSize() {
      if (this._resize || typeof ResizeObserver === "undefined") return;
      this._resize = new ResizeObserver(() => requestAnimationFrame(() => this._fit()));
      this._resize.observe(this);
    }

    connectedCallback() {
      if (this._config && this._hass) this._motion();
      if (this.shadowRoot.querySelector(".card")) {
        this._observeSize();
        requestAnimationFrame(() => this._fit());
      }
    }

    disconnectedCallback() {
      Object.values(this._anim).forEach((id) => cancelAnimationFrame(id));
      this._anim = {};
      cancelAnimationFrame(this._motionId);
      this._motionId = null;
      if (this._resize) this._resize.disconnect();
      this._resize = null;
    }

    // ---------------------------------------------------------------- state
    _read(g) {
      const st = this._hass && this._hass.states[g.entity];
      const name = g.name || (st && st.attributes.friendly_name) || g.entity;
      const unit = g.unit !== undefined ? g.unit : (st && st.attributes.unit_of_measurement) || "";
      const value = st ? Number(st.state) : NaN;
      return { st, name, unit, value: Number.isFinite(value) ? value : null };
    }

    _format(g, value) {
      if (value === null) return "–";
      const st = this._hass && this._hass.states[g.entity];
      let decimals = g.decimals;
      if (decimals === null) {
        const precision = st && st.attributes && this._hass.entities && this._hass.entities[g.entity] && this._hass.entities[g.entity].display_precision;
        decimals = Number.isInteger(precision) ? precision : Math.abs(value) >= 100 ? 0 : 1;
      }
      const lang = (this._hass && this._hass.locale && this._hass.locale.language) || navigator.language;
      return value.toLocaleString(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }

    // ---------------------------------------------------------------- geometry helpers
    _angle(g, value) {
      const a = this._config.arc;
      const t = (clamp(value, g.min, g.max) - g.min) / (g.max - g.min);
      return -a / 2 + t * a;
    }

    _origin(g) {
      // Bidirectional gauges fill from zero (or the nearest end of the range).
      return g.bidirectional ? clamp(0, g.min, g.max) : g.min;
    }

    // ---------------------------------------------------------------- render
    _applyTheme() {
      const card = this.shadowRoot.querySelector(".card");
      if (!card || !this._config) return;
      const theme = this._config.theme === "auto" ? (this._dark === false ? "light" : "dark") : this._config.theme;
      card.classList.toggle("light", theme === "light");
    }

    _render() {
      if (this._error || !this._config) {
        this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="card plain"><div class="error">${esc(this._error || "Configuration missing")}</div></div>`;
        return;
      }
      const cfg = this._config;
      if (cfg.style !== "rings") return this._renderMeter();
      const half = cfg.arc <= 180;
      const max = num(this._raw.size, 0);
      // Crop the empty space below arcs that don't close at the bottom.
      const height = this._drawingHeight();
      this.shadowRoot.innerHTML = `
        <style>${STYLE}</style>
        <div class="card ${cfg.glass ? "glass" : "plain"}" ${max ? `style="--g-max:${max}px"` : ""}>
          <div class="head"><div class="title"></div></div>
          <div class="gauge ${half ? "half" : ""}" style="aspect-ratio: 200 / ${height}; --h: ${height}; --s: ${this._textScale().toFixed(3)}">
            <svg viewBox="0 0 200 ${height}" role="img" aria-label="${esc(cfg.name || "Dual gauge")}">
              <defs>
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.6" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              ${this._staticRing(cfg.outer)}
              ${this._staticRing(cfg.inner)}
              ${cfg.show_scale ? this._ticks() : ""}
              <g class="dyn"></g>
              <path class="hit" data-ring="outer" tabindex="0" role="button" aria-label="Show history" stroke-width="${this._config.geo.outer.w + 8}" d="${arcPath(this._config.geo.outer.r, -cfg.arc / 2, cfg.arc / 2)}"/>
              <path class="hit" data-ring="inner" tabindex="0" role="button" aria-label="Show history" stroke-width="${this._config.geo.inner.w + 8}" d="${arcPath(this._config.geo.inner.r, -cfg.arc / 2, cfg.arc / 2)}"/>
            </svg>
            <div class="center"></div>
          </div>
          <div class="legend"></div>
        </div>`;
      this._wire();
    }

    _renderMeter() {
      const cfg = this._config;
      const m = METERS[cfg.style];
      const h = m.h || 200;
      const max = num(this._raw.size, 0);
      this.shadowRoot.innerHTML = `
        <style>${STYLE}</style>
        <div class="card ${cfg.glass ? "glass" : "plain"}" ${max ? `style="--g-max:${max}px"` : ""}>
          <div class="head"><div class="title"></div></div>
          <div class="gauge meter-${cfg.style}" style="aspect-ratio: 200 / ${h}; --h: ${h}; --s: ${m.scale || 1}">
            <svg viewBox="0 0 200 ${h}" role="img" aria-label="${esc(cfg.name || "Dual gauge")}">
              <defs>
                <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="2.4" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <g class="dyn"></g>
            </svg>
            ${m.center ? `<div class="center"></div>` : ""}
          </div>
        </div>`;
      this._wire();
    }

    _wire() {
      this._observeSize();
      requestAnimationFrame(() => this._fit());
      const root = this.shadowRoot.querySelector(".card");
      root.addEventListener("click", (e) => {
        const t = e.target.closest("[data-ring]");
        if (t) this._moreInfo(t.dataset.ring);
      });
      root.addEventListener("keydown", (e) => {
        const t = e.target.closest && e.target.closest("[data-ring]");
        if (t && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          this._moreInfo(t.dataset.ring);
        }
      });
      this._applyTheme();
    }

    _textScale() {
      // Shrink the centre text when thick rings leave a smaller hole (62 is the default hole).
      const i = this._config.geo.inner;
      return clamp((i.r - i.w / 2) / 62, 0.62, 1.1);
    }

    _staticRing(g) {
      const { r, w } = this._config.geo[g.ring];
      const a = this._config.arc;
      const zones = g.zones
        .map((z) => {
          const from = num(z.from, g.min);
          const to = num(z.to, g.max);
          if (to <= from) return "";
          const op = clamp(num(z.opacity, 0.28), 0, 1);
          return `<path class="zone" stroke="${esc(z.color || "#ffffff")}" stroke-opacity="${op}" stroke-width="${w}" d="${arcPath(r, this._angle(g, from), this._angle(g, to))}"/>`;
        })
        .join("");
      let zero = "";
      if (g.bidirectional && g.min < 0 && g.max > 0) {
        const [x1, y1] = polar(r - w / 2 - 1, this._angle(g, 0));
        const [x2, y2] = polar(r + w / 2 + 1, this._angle(g, 0));
        zero = `<line class="zero" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
      }
      const track = this._config.track_color ? ` style="stroke:${esc(this._config.track_color)};stroke-opacity:.22"` : "";
      return `<path class="track"${track} stroke-width="${w}" d="${arcPath(r, -a / 2, a / 2)}"/>${zones}${zero}`;
    }

    _ticks() {
      const cfg = this._config;
      const a = cfg.arc;
      const g = cfg.outer;
      const r0 = this._config.geo.outer.r + this._config.geo.outer.w / 2 + 3;
      const steps = 40;
      let out = "";
      const n = steps;
      for (let i = 0; i <= n; i++) {
        if (a === 360 && i === n) break; // the last tick would sit on top of the first
        const major = i % 10 === 0;
        const deg = -a / 2 + (a * i) / n;
        const [x1, y1] = polar(r0, deg);
        const [x2, y2] = polar(r0 + (major ? 5 : 2.6), deg);
        out += `<line class="tick ${major ? "major" : ""}" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
      }
      if (a < 360) {
        const lab = (v, deg, anchor) => {
          // Half gauges: put min/max under the ends of the arc so they stay inside the card.
          const [x, y] = a <= 180 ? polar(this._config.geo.outer.r, deg).map((c, k) => (k ? c + 14 : c)) : polar(r0 + 11, deg);
          return `<text class="scale" x="${x.toFixed(1)}" y="${(y + 2.2).toFixed(1)}" text-anchor="${anchor}">${esc(this._format({ ...g, decimals: Number.isInteger(g.min) && Number.isInteger(g.max) ? 0 : g.decimals }, v))}</text>`;
        };
        out += lab(g.min, -a / 2, "middle") + lab(g.max, a / 2, "middle");
      }
      return out;
    }

    _markers(g) {
      const { r, w } = this._config.geo[g.ring];
      return g.markers
        .map((m) => {
          const v = num(m.value, null);
          if (v === null) return "";
          const deg = this._angle(g, v);
          const [x1, y1] = polar(r - w / 2 - 1.5, deg);
          const [x2, y2] = polar(r + w / 2 + 1.5, deg);
          const color = m.color ? esc(m.color) : "var(--g-fg)";
          let label = "";
          if (m.label && g.ring === "outer") {
            const [lx, ly] = polar(r + w / 2 + (this._config.show_scale ? 15 : 7), deg);
            label = `<text class="marker-label" fill="${color}" x="${lx.toFixed(1)}" y="${(ly + 2).toFixed(1)}" text-anchor="middle">${esc(m.label)}</text>`;
          }
          return `<line class="marker" stroke="${color}" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"><title>${esc(m.label || v)}</title></line>${label}`;
        })
        .join("");
    }

    _ringHTML(g, value) {
      const { r, w } = this._config.geo[g.ring];
      const color = value === null ? "transparent" : colorAt(g, value);
      const o = this._origin(g);
      const empty = value === null || Math.abs(this._angle(g, value) - this._angle(g, o)) < 0.3;
      const a1 = this._angle(g, o);
      const a2 = value === null ? a1 : this._angle(g, value);
      const [kx, ky] = polar(r, a2);
      return `
        <path class="fill ${empty ? "off" : ""}" filter="url(#glow)" stroke="${color}" stroke-width="${w}" d="${arcPath(r, a1, a2 === a1 ? a1 + 0.01 : a2)}"/>
        <circle class="knob ${value === null ? "off" : ""}" cx="${kx.toFixed(2)}" cy="${ky.toFixed(2)}" r="${clamp(w / 2 - 1.6, 0.9, 5.2).toFixed(2)}"/>
        ${this._markers(g)}`;
    }

    _paint() {
      const cfg = this._config;
      const dyn = this.shadowRoot.querySelector(".dyn");
      if (!dyn) return;
      if (cfg.style !== "rings") {
        dyn.innerHTML = METERS[cfg.style].draw(this._ctx());
        return;
      }
      dyn.innerHTML = this._ringHTML(cfg.outer, this._shown.outer) + this._ringHTML(cfg.inner, this._shown.inner);
    }

    /** What the meter styles draw from: each value as a fraction, its colour, text and name. */
    _ctx() {
      const cfg = this._config;
      const side = (ring) => {
        const g = cfg[ring];
        const r = this._read(g);
        const v = this._shown[ring];
        const na = v === null;
        const frac = na ? 0 : (v - g.min) / (g.max - g.min);
        return {
          ring,
          na,
          t: clamp(frac, 0, 1),
          t2: clamp(frac, 0, 2),
          color: na ? "transparent" : colorAt(g, v),
          text: this._format(g, na ? null : v),
          unit: r.unit,
          name: r.name,
        };
      };
      return {
        arc: cfg.arc,
        glow: "url(#glow)",
        track: cfg.track_color ? `style="stroke:${esc(cfg.track_color)};stroke-opacity:.22"` : `stroke="var(--g-track)"`,
        phase: this._phase || 0,
        i: side("inner"),
        o: side("outer"),
        iGauge: cfg.inner,
        oGauge: cfg.outer,
      };
    }

    _motion() {
      // Liquid and Pulse move gently. Kept to ~30 fps, and off for reduced motion.
      const moving = this._config && (this._config.style === "liquid" || this._config.style === "pulse");
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!moving || reduce || !this.isConnected) {
        cancelAnimationFrame(this._motionId);
        this._motionId = null;
        return;
      }
      if (this._motionId) return;
      let last = 0;
      const tick = (now) => {
        this._motionId = requestAnimationFrame(tick);
        if (now - last < 33) return;
        last = now;
        this._phase = (this._phase || 0) + 0.09;
        this._paint();
      };
      this._motionId = requestAnimationFrame(tick);
    }

    _update(animate) {
      const cfg = this._config;
      if (!cfg || !this.shadowRoot.querySelector(".dyn")) return;
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      for (const ring of ["inner", "outer"]) {
        const target = this._read(cfg[ring]).value;
        const from = this._shown[ring];
        if (target === from) continue;
        cancelAnimationFrame(this._anim[ring]);
        if (!animate && from === null && target !== null && !reduce) {
          // First paint: sweep up from the origin.
          this._tween(ring, this._origin(cfg[ring]), target);
        } else if (animate && from !== null && target !== null && !reduce) {
          this._tween(ring, from, target);
        } else {
          this._shown[ring] = target;
        }
      }
      this._paint();
      this._renderText();
      this._motion();
    }

    _tween(ring, from, to) {
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = Math.min(1, (now - start) / ANIM_MS);
        this._shown[ring] = from + (to - from) * ease(t);
        this._paint();
        if (t < 1) this._anim[ring] = requestAnimationFrame(step);
        else this._shown[ring] = to;
      };
      this._shown[ring] = from;
      this._anim[ring] = requestAnimationFrame(step);
    }

    _renderText() {
      const cfg = this._config;
      const p = cfg[cfg.primary];
      const s = cfg[cfg.primary === "inner" ? "outer" : "inner"];
      const pr = this._read(p);
      const sr = this._read(s);
      const sColor = sr.value === null ? "transparent" : colorAt(s, sr.value);
      this.shadowRoot.querySelector(".title").textContent = cfg.name;
      const center = this.shadowRoot.querySelector(".center");
      if (!center) return;
      center.innerHTML = `
        <div class="label">${esc(pr.name)}</div>
        <button class="big ${pr.value === null ? "na" : ""}" data-ring="${p.ring}" aria-label="${esc(pr.name)}: ${esc(this._format(p, pr.value))} ${esc(pr.unit)}">
          <span class="v">${esc(this._format(p, pr.value))}</span>${pr.unit && pr.value !== null ? `<span class="u">${esc(pr.unit)}</span>` : ""}
        </button>
        ${pr.value === null ? `<div class="small-label unavail">Unavailable</div>` : ""}
        <div class="divider"></div>
        <button class="small ${sr.value === null ? "na" : ""}" data-ring="${s.ring}" aria-label="${esc(sr.name)}: ${esc(this._format(s, sr.value))} ${esc(sr.unit)}">
          <i style="--c:${sColor}"></i><span>${esc(this._format(s, sr.value))}</span>${sr.unit && sr.value !== null ? `<span class="u">${esc(sr.unit)}</span>` : ""}
        </button>
        <div class="small-label">${esc(sr.name)}</div>`;
      this.shadowRoot.querySelector(".title").textContent = cfg.name;
      const pColor = pr.value === null ? "transparent" : colorAt(p, pr.value);
      const half = cfg.style === "rings" && cfg.arc <= 180;
      // On a half gauge there's no room for the second name in the centre, so a small key goes under it.
      const legend = this.shadowRoot.querySelector(".legend");
      if (legend) legend.innerHTML = half
        ? `<span><i style="--c:${pColor}"></i>${esc(pr.name)}</span><span><i style="--c:${sColor}"></i>${esc(sr.name)}</span>`
        : "";
    }

    _moreInfo(ring) {
      const g = this._config && this._config[ring];
      if (!g) return;
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: g.entity }, bubbles: true, composed: true }));
    }
  }

  // ------------------------------------------------------------------ visual editor
  const RING_FORM_KEYS = ["entity", "name", "unit", "min", "max", "decimals", "thickness", "bidirectional"];

  // What each of the two values is called in each style, for the editor's section titles.
  const ROLES = {
    rings: ["Inner ring", "Outer ring"],
    orbit: ["Inner orbit", "Outer orbit"],
    liquid: ["Liquid level", "Outer arc"],
    butterfly: ["Left wing", "Right wing"],
    segments: ["Inner ring", "Outer ring"],
    pulse: ["Inner ring", "Spokes"],
    needles: ["Short needle", "Long needle"],
    spiral: ["Inner ring", "Spiral (can pass 100%)"],
    moon: ["Moon phase", "Halo"],
    dots: ["Centre dots", "Edge dots"],
    bloom: ["Petal size", "Lit petals"],
    capsules: ["Left tube", "Right tube"],
    tape: ["Bar", "Scrolling tape"],
  };
  const CENTRE_STYLES = ["rings", "orbit", "liquid", "segments", "pulse", "spiral"];

  const RING_FIELDS = (title, isRings) => ({
    type: "expandable",
    title,
    schema: [
      { name: "entity", required: true, selector: { entity: { domain: ["sensor", "number", "input_number", "counter"] } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "unit", selector: { text: {} } },
          { name: "min", selector: { number: { mode: "box", step: "any" } } },
          { name: "max", selector: { number: { mode: "box", step: "any" } } },
          { name: "decimals", selector: { number: { mode: "box", min: 0, max: 6 } } },
        ],
      },
      ...(isRings
        ? [
            { name: "thickness", selector: { number: { mode: "slider", min: THICKNESS.min, max: THICKNESS.max, step: 1 } } },
            { name: "bidirectional", selector: { boolean: {} } },
          ]
        : []),
    ],
  });

  const editorSchema = (swapped, style) => {
    const rings = style === "rings";
    const roles = ROLES[style] || ROLES.rings;
    const [first, second] = swapped ? [roles[1], roles[0]] : roles;
    const top = [
      CENTRE_STYLES.includes(style) && {
        name: "primary", selector: { select: { mode: "dropdown", options: [{ value: "inner", label: roles[0] }, { value: "outer", label: roles[1] }] } },
      },
      (rings || (METERS[style] && METERS[style].usesArc)) && { name: "arc", selector: { select: { mode: "dropdown", options: ARCS.map((a) => ({ value: String(a), label: a === 360 ? "Full circle" : a === 180 ? "Half circle" : `${a}°` })) } } },
      { name: "theme", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Follow Home Assistant" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }] } } },
      { name: "size", selector: { number: { mode: "box", min: 160, max: 800, unit_of_measurement: "px" } } },
    ].filter(Boolean);
    return [
      { name: "name", selector: { text: {} } },
      { type: "grid", name: "", schema: top },
      ...(rings ? [{ name: "ring_gap", selector: { number: { mode: "slider", min: GAP.min, max: GAP.max, step: 1 } } }] : []),
      {
        type: "grid",
        name: "",
        schema: [{ name: "glass", selector: { boolean: {} } }, ...(rings ? [{ name: "show_scale", selector: { boolean: {} } }] : [])],
      },
      { name: "g0", ...RING_FIELDS(`${first} · first value`, rings) },
      { name: "g1", ...RING_FIELDS(`${second} · second value`, rings) },
    ];
  };

  const LABELS = {
    name: "Title",
    primary: "Big number shows",
    arc: "Gauge shape",
    theme: "Theme",
    size: "Maximum size",
    ring_gap: "Space between the rings",
    glass: "Frosted glass background",
    show_scale: "Show tick marks and min/max",
    entity: "Entity",
    unit: "Unit (optional, taken from the entity)",
    min: "Minimum",
    max: "Maximum",
    decimals: "Decimals",
    thickness: "Ring thickness",
    bidirectional: "Fill from zero (for values that go negative)",
  };

  // Ready-made colour sets, spread evenly across a ring's range.
  const PALETTES = [
    { name: "Cool → hot", colors: ["#6cb6ff", "#38d6a0", "#ffc857", "#ff5c7a"] },
    { name: "Good → bad", colors: ["#38d6a0", "#ffc857", "#ff5c7a"] },
    { name: "Bad → good", colors: ["#ff5c7a", "#ffc857", "#38d6a0"] },
    { name: "Ocean", colors: ["#22d3c5", "#6cb6ff", "#7b8cff"] },
    { name: "Sunset", colors: ["#ffc857", "#ff9f5c", "#ff5c7a", "#c86bff"] },
    { name: "Aurora", colors: ["#7b8cff", "#c86bff", "#ff5fa2"] },
  ];
  const SWATCHES = ["#38d6a0", "#22d3c5", "#6cb6ff", "#7b8cff", "#c86bff", "#ff5fa2", "#ff5c7a", "#ff9f5c", "#ffc857", "#f4f7ff"];

  const toHex = (c) => {
    const rgb = parseHex(c);
    if (!rgb) return "#ffffff";
    return `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  };
  const niceNumber = (v) => {
    const r = Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
    return Object.is(r, -0) ? 0 : r;
  };

  const EDITOR_STYLE = `
    .gdg-colors { margin-top: 20px; display:flex; flex-direction:column; gap:14px; }
    .gdg-sec { border: 1px solid var(--divider-color, rgba(127,127,127,.3)); border-radius: 12px; padding: 14px 16px 16px; }
    .gdg-h { font-weight: 500; font-size: 15px; margin: 0 0 10px; display:flex; align-items:center; gap:10px; }
    .gdg-h .bar { flex:1; height: 10px; border-radius: 6px; max-width: 220px; margin-left:auto; box-shadow: inset 0 0 0 1px rgba(127,127,127,.25); }
    .gdg-seg { display:inline-flex; padding:3px; border-radius: 10px; background: var(--secondary-background-color, rgba(127,127,127,.12)); margin-bottom: 12px; }
    .gdg-seg button { border:0; background:none; color: var(--secondary-text-color); font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 8px; cursor:pointer; }
    .gdg-seg button.on { background: var(--card-background-color, #fff); color: var(--primary-text-color); box-shadow: 0 1px 3px rgba(0,0,0,.18); }
    .gdg-row { display:flex; align-items:center; gap:10px; margin: 8px 0; }
    .gdg-row input[type=color] { width: 44px; height: 36px; padding: 2px; border-radius: 8px; border: 1px solid var(--divider-color, rgba(127,127,127,.35)); background: none; cursor:pointer; flex:none; }
    .gdg-row input[type=number] { width: 110px; height: 36px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--divider-color, rgba(127,127,127,.35)); background: var(--secondary-background-color, transparent); color: var(--primary-text-color); font: inherit; }
    .gdg-row .lbl { font-size: 13px; color: var(--secondary-text-color); min-width: 40px; }
    .gdg-row code { font-size: 13px; color: var(--secondary-text-color); }
    .gdg-icon { border:0; background:none; color: var(--secondary-text-color); font-size: 18px; width: 36px; height: 36px; border-radius: 50%; cursor:pointer; }
    .gdg-icon:hover { background: var(--secondary-background-color, rgba(127,127,127,.12)); }
    .gdg-btn { border: 1px solid var(--divider-color, rgba(127,127,127,.35)); background: none; color: var(--primary-color, #03a9f4); font: inherit; font-size: 14px; padding: 7px 14px; border-radius: 18px; cursor:pointer; }
    .gdg-swatches { display:flex; flex-wrap:wrap; gap:8px; margin: 6px 0 2px; }
    .gdg-swatches button { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor:pointer; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
    .gdg-swatches button.on { border-color: var(--primary-text-color); }
    .gdg-pal-label { font-size: 13px; color: var(--secondary-text-color); margin: 14px 0 6px; }
    .gdg-pals { display:flex; flex-wrap:wrap; gap:8px; }
    .gdg-pals button { display:flex; flex-direction:column; gap:4px; align-items:stretch; border: 1px solid var(--divider-color, rgba(127,127,127,.35)); background:none; color: var(--primary-text-color); font: inherit; font-size: 12px; padding: 6px 8px; border-radius: 10px; cursor:pointer; min-width: 92px; }
    .gdg-pals i { display:block; height: 8px; border-radius: 4px; }
    .gdg-check { display:flex; align-items:center; gap:8px; font-size: 14px; margin-top: 10px; cursor:pointer; }
    .gdg-hint { font-size: 12px; color: var(--secondary-text-color); margin: 4px 0 0; line-height: 1.4; }
    .gdg-pick-label { font-size: 14px; font-weight: 500; margin: 0 0 8px; }
    .gdg-styles { display:grid; grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)); gap: 8px; margin: 0 0 18px;
      --g-fg: var(--primary-text-color); --g-fg-rgb: 127,127,127; --g-dim: var(--secondary-text-color);
      --g-track: rgba(127,127,127,.25); --g-tick: rgba(127,127,127,.4); --g-tick-major: rgba(127,127,127,.7); }
    .gdg-styles button { display:flex; flex-direction:column; align-items:center; gap:4px; padding: 8px 6px 7px; border-radius: 12px; cursor:pointer;
      border: 1px solid var(--divider-color, rgba(127,127,127,.3)); background: none; color: var(--primary-text-color); font: inherit; font-size: 12px; }
    .gdg-styles button:hover { background: var(--secondary-background-color, rgba(127,127,127,.08)); }
    .gdg-styles button.on { border: 2px solid var(--primary-color, #03a9f4); padding: 7px 5px 6px; background: var(--secondary-background-color, rgba(127,127,127,.08)); }
    .gdg-styles svg { width: 100%; max-width: 72px; height: 60px; }
    .gdg-styles text { display:none; }
    .gdg-note { margin: 14px 0 0; opacity:.75; font-size: 13px; line-height: 1.45; }
  `;

  class GlassDualGaugeEditor extends HTMLElement {
    setConfig(config) {
      this._config = config;
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      if (this._form) this._form.hass = hass;
    }

    _style() {
      const st = this._config && this._config.style;
      return METER_KEYS.includes(st) ? st : "rings";
    }

    _gauges() {
      const c = this._config || {};
      const list = Array.isArray(c.gauges) ? c.gauges : [];
      return [list[0] || {}, list[1] || {}];
    }

    _data() {
      const c = this._config || {};
      const [a, b] = this._gauges();
      const swapped = !!c.flip;
      const ringOf = (i) => (i === 0) !== swapped ? "inner" : "outer";
      const pick = (g, i) => {
        const d = {};
        for (const k of RING_FORM_KEYS) if (g[k] !== undefined) d[k] = g[k];
        if (d.thickness === undefined) d.thickness = THICKNESS[ringOf(i)];
        return d;
      };
      return {
        name: c.name || "",
        primary: c.primary || "inner",
        arc: String(c.arc || DEFAULT_ARC),
        theme: c.theme || "auto",
        size: c.size,
        ring_gap: c.ring_gap !== undefined ? c.ring_gap : GAP.def,
        glass: c.glass !== false,
        show_scale: c.show_scale !== false,
        g0: pick(a, 0),
        g1: pick(b, 1),
      };
    }

    async _render() {
      if (!this._config) return;
      if (!customElements.get("ha-form")) {
        if (!this._waiting) {
          this._waiting = true;
          this.innerHTML = `<p style="padding:8px 0;opacity:.7">Loading editor…</p>`;
          const timer = setTimeout(() => {
            if (!customElements.get("ha-form")) this.innerHTML = `<p style="padding:8px 0">The visual editor isn't available here. Switch to the code editor to change this card.</p>`;
          }, 4000);
          await customElements.whenDefined("ha-form");
          clearTimeout(timer);
          this._waiting = false;
        } else {
          return;
        }
      }
      if (!this._form) {
        this.innerHTML = `<style>${EDITOR_STYLE}</style>`;
        this._form = document.createElement("ha-form");
        this._form.computeLabel = (s) => LABELS[s.name] || s.name;
        this._form.computeHelper = (s) =>
          s.name === "thickness" ? "Thicker rings leave less room in the middle." : s.name === "ring_gap" ? "Set to 0 for rings that touch." : undefined;
        this._form.addEventListener("value-changed", (e) => this._formChanged(e.detail.value));
        this._colors = document.createElement("div");
        this._colors.className = "gdg-colors";
        this._colors.addEventListener("click", (e) => this._colorClick(e));
        this._colors.addEventListener("input", (e) => this._colorInput(e, false));
        this._colors.addEventListener("change", (e) => this._colorInput(e, true));
        const note = document.createElement("p");
        note.className = "gdg-note";
        note.textContent = "Zones and markers are set in the code editor (see the README).";
        this._picker = document.createElement("div");
        this._picker.className = "gdg-styles";
        this._picker.addEventListener("click", (e) => {
          const b = e.target.closest("[data-style]");
          if (!b) return;
          const config = { ...this._config, style: b.dataset.style };
          if (config.style === "rings") delete config.style;
          this._emit(config);
          this._render();
        });
        const pickLabel = document.createElement("div");
        pickLabel.className = "gdg-pick-label";
        pickLabel.textContent = "Style";
        this.append(pickLabel, this._picker, this._form, this._colors, note);
      }
      this._form.hass = this._hass;
      this._form.schema = editorSchema(!!this._config.flip, this._style());
      this._form.data = this._data();
      this._renderPicker();
      if (this._keepColors) this._keepColors = false;
      else this._renderColors();
    }

    // ------------------------------------------------------------ style picker
    _thumbCtx() {
      let inner = { t: 0.62, color: "#38d6a0" };
      let outer = { t: 0.4, color: "#7b8cff" };
      try {
        const n = normalise(this._config);
        const at = (g, t) => colorAt(g, g.min + t * (g.max - g.min));
        inner = { t: 0.62, color: at(n.inner, 0.62) };
        outer = { t: 0.4, color: at(n.outer, 0.4) };
      } catch (err) {
        /* not a complete config yet: use the sample colours */
      }
      const side = (ring, v, t2) => ({ ring, na: false, t: v.t, t2, color: v.color, text: "", unit: "", name: "" });
      return {
        arc: DEFAULT_ARC,
        glow: "none",
        track: `stroke="var(--g-track)"`,
        phase: 0,
        i: side("inner", inner, inner.t),
        o: side("outer", outer, 1.3),
        iGauge: { min: 0, max: 100 },
        oGauge: { min: 0, max: 100 },
      };
    }

    _renderPicker() {
      const ctx = this._thumbCtx();
      const current = this._style();
      const ringsThumb = () => {
        const a = DEFAULT_ARC;
        return `<path d="${arcAt(84, -a / 2, a / 2)}" fill="none" stroke="var(--g-track)" stroke-width="10" stroke-linecap="round"/>
          <path d="${arcAt(84, -a / 2, -a / 2 + ctx.o.t * a)}" fill="none" stroke="${ctx.o.color}" stroke-width="10" stroke-linecap="round"/>
          <path d="${arcAt(66, -a / 2, a / 2)}" fill="none" stroke="var(--g-track)" stroke-width="8" stroke-linecap="round"/>
          <path d="${arcAt(66, -a / 2, -a / 2 + ctx.i.t * a)}" fill="none" stroke="${ctx.i.color}" stroke-width="8" stroke-linecap="round"/>`;
      };
      this._picker.innerHTML = METER_KEYS.map((k) => {
        const m = METERS[k];
        let art = "";
        try {
          art = k === "rings" ? ringsThumb() : m.draw(ctx);
        } catch (err) {
          art = "";
        }
        return `<button data-style="${k}" class="${k === current ? "on" : ""}" aria-pressed="${k === current}" title="${esc(m.desc)}">
          <svg viewBox="0 0 200 ${m.h || 200}" aria-hidden="true">${art}</svg><span>${esc(m.label)}</span></button>`;
      }).join("");
    }

    // ------------------------------------------------------------ colour panel
    _stops(g) {
      const min = num(g.min, 0);
      const max = num(g.max, 100);
      return colorStops({ ...g, min, max: max > min ? max : min + 100 }).map((s) => ({ from: niceNumber(s.from), color: s.color }));
    }

    _renderColors() {
      const c = this._config;
      const swapped = !!c.flip;
      const [a, b] = this._gauges();
      const section = (g, i) => {
        const roles = ROLES[this._style()] || ROLES.rings;
        const ring = (i === 0) !== swapped ? roles[0] : roles[1];
        const single = !!g.color && !(Array.isArray(g.colors) && g.colors.length);
        const stops = this._stops(g);
        const blend = g.color_mode === "gradient";
        const bar = single
          ? esc(g.color)
          : stops.length > 1
            ? `linear-gradient(90deg, ${stops.map((s, k) => (blend ? s.color : `${s.color} ${(k / stops.length) * 100}% ${((k + 1) / stops.length) * 100}%`)).join(", ")})`
            : esc(stops[0].color);
        const singleUI = `
          <div class="gdg-row"><input type="color" data-act="single" value="${toHex(g.color || stops[0].color)}" aria-label="${esc(ring)} colour"><code>${esc(toHex(g.color || stops[0].color))}</code></div>
          <div class="gdg-swatches">${SWATCHES.map((h) => `<button data-act="swatch" data-v="${h}" class="${toHex(g.color) === h ? "on" : ""}" style="background:${h}" aria-label="Use ${h}"></button>`).join("")}</div>`;
        const rangesUI = `
          ${stops
            .map(
              (st, k) => `<div class="gdg-row">
              <input type="color" data-act="stop-color" data-k="${k}" value="${toHex(st.color)}" aria-label="Colour ${k + 1}">
              <span class="lbl">from</span>
              <input type="number" step="any" data-act="stop-from" data-k="${k}" value="${esc(st.from)}" aria-label="Colour ${k + 1} starts at">
              ${stops.length > 1 ? `<button class="gdg-icon" data-act="stop-del" data-k="${k}" aria-label="Remove colour ${k + 1}" title="Remove">✕</button>` : ""}
            </div>`
            )
            .join("")}
          <button class="gdg-btn" data-act="stop-add">+ Add colour</button>
          <p class="gdg-hint">Each colour applies from its value upwards.</p>
          <label class="gdg-check"><input type="checkbox" data-act="blend" ${blend ? "checked" : ""}> Blend smoothly between colours</label>`;
        return `
          <section class="gdg-sec" data-i="${i}">
            <div class="gdg-h">${esc(ring)} colours<span class="bar" style="background:${bar}"></span></div>
            <div class="gdg-seg" role="tablist">
              <button data-act="mode" data-v="single" class="${single ? "on" : ""}" role="tab" aria-selected="${single}">One colour</button>
              <button data-act="mode" data-v="ranges" class="${single ? "" : "on"}" role="tab" aria-selected="${!single}">Changes with value</button>
            </div>
            ${single ? singleUI : rangesUI}
            ${single ? "" : `<div class="gdg-pal-label">Quick palettes</div>
            <div class="gdg-pals">${PALETTES.map((p, k) => `<button data-act="palette" data-k="${k}"><i style="background:linear-gradient(90deg, ${p.colors.join(", ")})"></i>${esc(p.name)}</button>`).join("")}</div>`}
          </section>`;
      };
      const track = c.track_color ? toHex(c.track_color) : "#ffffff";
      this._colors.innerHTML =
        section(a, 0) +
        section(b, 1) +
        `<section class="gdg-sec" data-i="track">
          <div class="gdg-h">Ring background</div>
          <div class="gdg-row"><input type="color" data-act="track" value="${track}" aria-label="Ring background colour">
            <span class="lbl">${c.track_color ? "Custom (shown faintly behind the colour)" : "Automatic"}</span>
            ${c.track_color ? `<button class="gdg-btn" data-act="track-reset">Use automatic</button>` : ""}</div>
        </section>`;
    }

    _editGauge(i, fn, keep = false) {
      const gauges = this._gauges().map((g) => ({ ...g }));
      const g = gauges[i];
      fn(g);
      this._emit({ ...this._config, gauges }, keep);
    }

    _colorClick(e) {
      const el = e.target.closest("[data-act]");
      if (!el || el.tagName === "INPUT") return;
      const sec = el.closest("[data-i]");
      const i = sec && sec.dataset.i;
      const act = el.dataset.act;
      if (i === "track") {
        if (act === "track-reset") {
          const config = { ...this._config };
          delete config.track_color;
          this._emit(config);
        }
        return;
      }
      const idx = Number(i);
      const g = this._gauges()[idx];
      const stops = this._stops(g);
      const min = num(g.min, 0);
      const max = num(g.max, 100);
      switch (act) {
        case "mode":
          this._editGauge(idx, (x) => {
            if (el.dataset.v === "single") {
              x.color = x.color || stops[stops.length > 1 ? 1 : 0].color;
              delete x.colors;
            } else {
              const base = x.color;
              delete x.color;
              // Start from the single colour, with amber and red near the top of the range.
              x.colors = base
                ? [
                    { from: niceNumber(min), color: base },
                    { from: niceNumber(min + (max - min) * 0.7), color: "#ffc857" },
                    { from: niceNumber(min + (max - min) * 0.88), color: "#ff5c7a" },
                  ]
                : stops;
            }
          });
          break;
        case "swatch":
          this._editGauge(idx, (x) => {
            x.color = el.dataset.v;
            delete x.colors;
          });
          break;
        case "stop-add":
          this._editGauge(idx, (x) => {
            const last = stops[stops.length - 1];
            const from = niceNumber(stops.length > 1 ? Math.min(max, last.from + (max - last.from) / 2) : min + (max - min) / 2);
            x.colors = [...stops, { from, color: SWATCHES[(stops.length * 3) % SWATCHES.length] }];
          });
          break;
        case "stop-del":
          this._editGauge(idx, (x) => {
            x.colors = stops.filter((_, k) => k !== Number(el.dataset.k));
          });
          break;
        case "palette": {
          const p = PALETTES[Number(el.dataset.k)];
          this._editGauge(idx, (x) => {
            delete x.color;
            x.colors = p.colors.map((color, k) => ({ from: niceNumber(min + ((max - min) * k) / p.colors.length), color }));
          });
          break;
        }
      }
    }

    _colorInput(e, final) {
      const el = e.target;
      const act = el.dataset && el.dataset.act;
      if (!act) return;
      const sec = el.closest("[data-i]");
      const i = sec && sec.dataset.i;
      // While a colour picker is open, update the preview without rebuilding the panel
      // (rebuilding would close the picker); rebuild once the picker closes.
      const keep = !final && el.type === "color";
      if (!final && el.type !== "color") return;
      if (i === "track") {
        if (act === "track") this._emit({ ...this._config, track_color: el.value }, keep);
        return;
      }
      const idx = Number(i);
      const stops = this._stops(this._gauges()[idx]);
      switch (act) {
        case "single":
          return this._editGaugeKeep(idx, keep, (x) => {
            x.color = el.value;
            delete x.colors;
          });
        case "stop-color":
          return this._editGaugeKeep(idx, keep, (x) => {
            stops[Number(el.dataset.k)].color = el.value;
            x.colors = stops;
          });
        case "stop-from": {
          const v = Number(el.value);
          if (el.value === "" || Number.isNaN(v)) return this._renderColors();
          return this._editGaugeKeep(idx, false, (x) => {
            stops[Number(el.dataset.k)].from = v;
            x.colors = stops.sort((p, q) => p.from - q.from);
          });
        }
        case "blend":
          return this._editGaugeKeep(idx, false, (x) => {
            if (el.checked) x.color_mode = "gradient";
            else delete x.color_mode;
            if (!x.colors && !x.color) x.colors = stops;
          });
      }
    }

    _editGaugeKeep(i, keep, fn) {
      this._editGauge(i, fn, keep);
    }

    // ------------------------------------------------------------ form panel
    _formChanged(v) {
      const old = this._config || {};
      const [a, b] = this._gauges();
      const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, x]) => x !== "" && x !== undefined && x !== null));
      const swapped = !!old.flip;
      const ring = (prev, next, i) => {
        const ringName = (i === 0) !== swapped ? "inner" : "outer";
        const merged = { ...(prev || {}) };
        // Take every form field from the form, so clearing a field removes it.
        for (const k of RING_FORM_KEYS) merged[k] = (next || {})[k];
        if (merged.thickness === THICKNESS[ringName]) delete merged.thickness;
        if (!merged.bidirectional) delete merged.bidirectional;
        return clean(merged);
      };
      const config = clean({
        ...old,
        type: old.type || `custom:${TAG}`,
        name: v.name,
        primary: v.primary === "inner" ? undefined : v.primary,
        arc: Number(v.arc) === DEFAULT_ARC ? undefined : Number(v.arc),
        theme: v.theme === "auto" ? undefined : v.theme,
        size: v.size,
        ring_gap: v.ring_gap === GAP.def ? undefined : v.ring_gap,
        glass: v.glass === false ? false : undefined,
        show_scale: v.show_scale === false ? false : undefined,
        gauges: [ring(a, v.g0, 0), ring(b, v.g1, 1)],
      });
      // The colour panel only needs rebuilding when a range changed (its default colours depend on it).
      const sameRange = a.min === config.gauges[0].min && a.max === config.gauges[0].max && b.min === config.gauges[1].min && b.max === config.gauges[1].max;
      this._emit(config, sameRange);
    }

    _emit(config, keep = false) {
      this._config = config;
      this._keepColors = keep;
      if (!keep) this._renderColors();
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    }
  }

  customElements.define(TAG, GlassDualGauge);
  if (!customElements.get(EDITOR_TAG)) customElements.define(EDITOR_TAG, GlassDualGaugeEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: TAG,
    name: "Glass Dual Gauge",
    description: "Two values on one frosted-glass gauge: an inner and an outer ring with a clear centre readout.",
    preview: true,
  });
  console.info(`%c GLASS DUAL GAUGE %c ${VERSION} `, "background:#5b6cff;color:#fff;border-radius:4px 0 0 4px;padding:2px 6px", "background:#22d3c5;color:#062a28;border-radius:0 4px 4px 0;padding:2px 6px");
})();
