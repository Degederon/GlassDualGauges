# Changelog

## 1.4.1
- `examples.yaml` is now a complete dashboard that works when pasted into the raw configuration editor. Every example runs in demo mode until you connect your own sensors.
- Demo mode uses a real sensor's name and unit when the entity exists.

## 1.4.0
- Demo mode: `demo: true` shows moving sample values, so gauges work without sensors.
- A ready-made demo dashboard (`demo-dashboard.yaml`) with all 13 styles in four groups on an aurora background.
- Every style now takes the same default size in Sections dashboards, so cards line up in neat rows.
- Much fuller step-by-step setup in the README, from installing to building your own dashboard.

## 1.3.1
- Fits Home Assistant's Sections dashboards: the card reports a sensible default size and shrinks the gauge to fit smaller cells instead of clipping.
- The colour key on half-circle gauges moved below the gauge, so the title is never cut short.

## 1.3.0
- `swap_gauges` is now `flip`.
- Removed leftover colour and layout aliases. Use `colors`, `color_mode` and `primary`.
- License is MIT under Degederon.

## 1.2.0
- 12 new styles alongside the rings: Orbit, Liquid, Butterfly, Segments, Pulse, Needles, Spiral, Moon, Dot grid, Bloom, Capsules and Tape (`style:`).
- Style picker in the visual editor, with a live thumbnail of each design in your colours.
- The editor only shows options that apply to the chosen style, and names each section after what it controls.
- Liquid and Pulse animate gently, and stop when reduced motion is on.

## 1.1.0
- Ring thickness for each ring (`thickness`) and the space between them (`ring_gap`), with sliders in the visual editor.
- New colour panel in the visual editor: one colour or colours that change with the value, colour pickers, swatches, add/remove colours, blending, and quick palettes, with a live preview strip.
- Ring background colour (`track_color`).
- The centre readout scales down when thick rings leave less room.

## 1.0.0
- New card: two values on one frosted-glass gauge, drawn as crisp SVG rings.
- Smooth animated arcs with a soft glow and a knob at the current value.
- Clear centre readout: one value large, the other below it with a colour dot.
- Gauge shapes: full circle, 300°, 270°, 240° or half circle.
- Colour ranges (stepped or blended), zones, markers with labels, and fill-from-zero for values that go negative.
- Follows Home Assistant's light or dark mode, or set it yourself. Plain style available for non-glass dashboards.
- Visual editor in the dashboard.
- Tap a ring or a value to open its history.
