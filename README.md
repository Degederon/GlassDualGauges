<div align="center">

# Glass Dual Gauge

**Two values on one gauge, on a frosted-glass card for Home Assistant.**

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1%2B-18BCF2.svg?logo=homeassistant&logoColor=white)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/badge/version-1.3.1-6E56CF.svg)](https://github.com/Degederon/GlassDualGauges/blob/main/CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Degederon/GlassDualGauges/blob/main/LICENSE)

</div>

Beautiful design and ease of use. https://github.com/Degederon/GlassDualGauges

Glass Dual Gauge shows two sensors on one card: temperature and humidity, CO₂ and air quality, battery and grid power, tank level and water temperature. Pick from 13 designs, from classic glowing rings to a filling bowl of liquid, a dial with two needles or a flower that blooms. Everything is set up in the dashboard editor with colour pickers and sliders, so no YAML is needed.

<p align="center">
  <img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/hero.jpg" alt="Four Glass Dual Gauge cards: Rings, Liquid, Segments and Spiral" width="100%">
</p>

## Contents

- [Features](#features)
- [Take a tour](#take-a-tour)
- [Requirements](#requirements)
- [Step-by-step setup](#step-by-step-setup)
- [Styles](#styles)
- [Card configuration](#card-configuration)
- [Colours, zones and markers](#colours-zones-and-markers)
- [Dashboard layouts](#dashboard-layouts)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

| Feature | Description |
|---|---|
| **13 styles** | Rings, Orbit, Liquid, Butterfly, Segments, Pulse, Needles, Spiral, Moon, Dot grid, Bloom, Capsules and Tape. Switch with one tap in the editor. |
| **Two values, one card** | Each style shows both sensors, with one value large and the other alongside it in its own colour. |
| **Frosted glass** | A soft glass card with glowing colours. Turn the glass off for a plain card that matches any theme. |
| **Light and dark** | Follows Home Assistant's light or dark mode automatically, or pick one. |
| **Colour that means something** | One colour per ring, or colours that change with the value, stepped or blended. Six ready-made palettes to start from. |
| **Visual editor** | A thumbnail picker for the style, colour pickers and swatches, and sliders for ring thickness and spacing. |
| **Zones and markers** | Shade parts of a ring and mark important values, such as a CO₂ limit or a tank's halfway point. |
| **Negative values** | Rings can fill from zero, for battery charge and discharge or grid import and export. |
| **Goals you can beat** | The Spiral style keeps winding past 100%, up to twice the range. |
| **Tap for history** | Tap any value to open that sensor's history. |
| **Fits every dashboard** | Works in Sections, Masonry and Panel dashboards, on tablets and phones. |
| **Lightweight** | One small file with no dependencies. |

## Take a tour

All pictures are of the card itself, with example sensors.

<table>
<tr>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/01-rings.jpg" alt="Rings style" width="100%"><br><sub><b>Rings.</b> Two glowing arcs with tick marks. The most adjustable style.</sub></td>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/02-orbit.jpg" alt="Orbit style" width="100%"><br><sub><b>Orbit.</b> Each value is a moon travelling round its track, with a fading tail.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/03-liquid.jpg" alt="Liquid style" width="100%"><br><sub><b>Liquid.</b> A bowl that fills with a gently moving surface. Great for tanks and humidity.</sub></td>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/04-butterfly.jpg" alt="Butterfly style" width="100%"><br><sub><b>Butterfly.</b> Two wings side by side, for comparing inside and outside.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/05-segments.jpg" alt="Segments style" width="100%"><br><sub><b>Segments.</b> Pills that light up one by one. Easy to read from across the room.</sub></td>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/06-pulse.jpg" alt="Pulse style" width="100%"><br><sub><b>Pulse.</b> Spokes that ripple like an equaliser. Made for power and energy.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/07-needles.jpg" alt="Needles style" width="100%"><br><sub><b>Needles.</b> A classic dial with two hands, for precise readings on one scale.</sub></td>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/08-spiral.jpg" alt="Spiral style" width="100%"><br><sub><b>Spiral.</b> Keeps winding past 100%, so beating a goal is visible.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/09-moon.jpg" alt="Moon style" width="100%"><br><sub><b>Moon.</b> A phase that waxes with one value, with a halo for the other.</sub></td>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/10-dots.jpg" alt="Dot grid style" width="100%"><br><sub><b>Dot grid.</b> Dots that fill in, from the bottom in the centre and clockwise round the edge.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/11-bloom.jpg" alt="Bloom style" width="100%"><br><sub><b>Bloom.</b> Petals grow with one value and light up with the other.</sub></td>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/12-capsules.jpg" alt="Capsules style" width="100%"><br><sub><b>Capsules.</b> Two glass tubes, clear even when the units differ.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/13-tape.jpg" alt="Tape style" width="100%"><br><sub><b>Tape.</b> A scale that scrolls under a pointer, with a bar below. Fits wide, short spaces.</sub></td>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/14-rings-from-zero.jpg" alt="Rings filling from zero" width="100%"><br><sub><b>Fill from zero.</b> Battery and grid power going both ways, on a 240° arc.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/15-light-rings.jpg" alt="Rings in light mode" width="100%"><br><sub><b>Light mode.</b> Every style follows Home Assistant's light theme.</sub></td>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/16-light-liquid.jpg" alt="Liquid in light mode" width="100%"><br><sub>Liquid in light mode.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/style-picker.jpg" alt="The style picker in the card editor" width="100%"><br><sub><b>Style picker.</b> Every design as a thumbnail, drawn in your own colours.</sub></td>
<td width="50%" valign="top"><img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/tour/17-colour-panel.jpg" alt="The colour panel in the card editor" width="100%"><br><sub><b>Colour panel.</b> Colour pickers, ranges, blending and quick palettes.</sub></td>
</tr>
</table>

## Requirements

- Home Assistant **2024.1** or later. On **2026.11** and later, install through the built-in **Marketplace**; on earlier versions, use **HACS**.
- Resizing the card in **Sections** dashboards needs Home Assistant **2024.11** or later.
- Two numeric sensors (or `number`, `input_number` or `counter` entities).

## Step-by-step setup

Follow these parts in order. Each one only needs to be done once.

### Part 1: Install the card

**Using the Marketplace (Home Assistant 2026.11 and later)**

1. Go to **Settings → Marketplace**.
2. The first time, read the community-content warning and confirm.
3. Choose **Add via link**, paste `https://github.com/Degederon/GlassDualGauges`, and choose **Dashboard** as the type.
4. Open **Glass Dual Gauge** and select **Install**. It's added to your dashboard resources automatically.

**Using HACS (earlier versions)**

1. In HACS, open the menu (⋮) and select **Custom repositories**.
2. Paste `https://github.com/Degederon/GlassDualGauges`, choose the category **Dashboard**, and select **Add**.
3. Search for **Glass Dual Gauge** and install it.

**Manual installation**

1. Copy `glass-dual-gauge.js` into your `config/www/` folder.
2. Go to **Settings → Dashboards → ⋮ → Resources** (turn on **Advanced mode** in your profile if you don't see it), select **+ Add resource**, enter `/local/glass-dual-gauge.js` and choose **JavaScript module**.

### Part 2: Refresh the page

After installing or updating, refresh once so your browser loads the card:

- **Computer:** press **Ctrl + Shift + R** (Mac: **Cmd + Shift + R**).
- **Companion app:** go to **Settings → Companion app → Debugging → Reset frontend cache**, then reopen the app.

### Part 3: Add the card

1. Open a dashboard and select the pencil (**Edit dashboard**).
2. Select **+ Add card**, search for **Glass Dual Gauge**, and select it.
3. The card starts with two of your sensors already filled in. Change them in the two sections marked **first value** and **second value**.

### Part 4: Choose a style and colours

1. Tap a thumbnail under **Style**. The preview changes straight away.
2. For each value, choose **One colour** or **Changes with value**, or tap a quick palette such as **Cool → hot**.
3. Select **Save**.

## Styles

All styles use the same two sensors, colours and glass card. The editor names each section after what it controls, so you always know which sensor goes where.

| Style | `style:` | First value | Second value | Good for |
|---|---|---|---|---|
| Rings | `rings` (default) | Inner ring | Outer ring | Anything; the most adjustable |
| Orbit | `orbit` | Inner moon | Outer moon | A playful look that's never "empty" |
| Liquid | `liquid` | Liquid level in the bowl | Arc around it | Tanks, humidity, battery |
| Butterfly | `butterfly` | Left wing | Right wing | Comparing inside and outside |
| Segments | `segments` | Inner pills | Outer pills | Wall tablets; readable from across the room |
| Pulse | `pulse` | Thin inner ring | Spokes | Power, energy, anything lively |
| Needles | `needles` | Short needle | Long needle | Precise readings on one scale |
| Spiral | `spiral` | Inner ring | Spiral, up to 200% | Goals you can beat: steps, solar output |
| Moon | `moon` | Moon phase | Halo | A distinctive, calm look |
| Dot grid | `dots` | Centre dots | Edge dots | Percentages at a glance |
| Bloom | `bloom` | Petal size | Number of lit petals | Something decorative |
| Capsules | `capsules` | Left tube | Right tube | Two values with different units |
| Tape | `tape` | Bar | Scrolling scale | Wide, short spaces |

- Liquid and Pulse move gently. The motion stops if your device is set to reduce motion.
- `arc` applies to Rings, Liquid and Segments. Ring thickness, spacing, tick marks, zones, markers and fill-from-zero apply to Rings only.

<p align="center">
  <img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/styles-dark.jpg" alt="All 13 styles side by side" width="100%">
</p>

## Card configuration

Everything below can be set in the visual editor. If you prefer YAML, this is the shortest working card:

```yaml
type: custom:glass-dual-gauge
name: Office
gauges:
  - entity: sensor.office_temperature   # first value (inner ring)
    min: 0
    max: 40
  - entity: sensor.office_humidity      # second value (outer ring)
    min: 0
    max: 100
```

More examples, including Liquid, Butterfly, Spiral and Capsules, are in [examples.yaml](https://github.com/Degederon/GlassDualGauges/blob/main/examples.yaml).

### Card options

| Option | Default | Description |
|---|---|---|
| `gauges` | required | Exactly two sensors: the first value, then the second. |
| `name` | — | Title at the top of the card. |
| `style` | `rings` | Which design to use. See [Styles](#styles). |
| `primary` | `inner` | Which value is shown large: `inner` (first) or `outer` (second). |
| `arc` | `270` | Gauge shape in degrees: `360`, `300`, `270`, `240` or `180`. |
| `theme` | `auto` | `auto` follows Home Assistant; or `dark` / `light`. |
| `glass` | `true` | Frosted-glass background. `false` uses your theme's normal card style. |
| `show_scale` | `true` | Tick marks around the outer ring, plus min and max at the ends. |
| `size` | `340` | Maximum gauge width in pixels. The gauge shrinks to fit smaller cards. |
| `ring_gap` | `9` | Space between the two rings, from `0` (touching) to `30`. |
| `track_color` | automatic | Colour of the empty part of the rings, shown faintly, like `"#ff5fa2"`. |
| `flip` | `false` | Put the first sensor on the outside and the second on the inside. |

### Gauge options

| Option | Default | Description |
|---|---|---|
| `entity` | required | A sensor, number, input_number or counter. |
| `name` | entity name | Label shown on the card. |
| `unit` | entity unit | Overrides the unit. |
| `min` / `max` | `0` / `100` | Range of the gauge. |
| `decimals` | automatic | Decimal places. Uses the entity's display precision if set. |
| `thickness` | `8` inner, `10` outer | Ring thickness, from `2` to `24`. Very thick rings shrink the gap and the centre text so everything still fits. |
| `color` | — | One colour for the whole gauge, like `"#38d6a0"`. |
| `colors` | green / amber / red | Colour ranges (see below). |
| `color_mode` | `steps` | `steps` changes colour at each range; `gradient` blends between them. |
| `bidirectional` | `false` | Fill from zero instead of from `min`, for values that go negative. A small line marks zero. |
| `zones` | — | Shaded parts of the ring (see below). |
| `markers` | — | Lines across the ring at important values (see below). |

## Colours, zones and markers

### Colour ranges

Each colour applies from its `from` value upwards:

```yaml
colors:
  - from: 0
    color: "#6cb6ff"   # cold
  - from: 18
    color: "#38d6a0"   # comfortable
  - from: 26
    color: "#ffc857"   # warm
  - from: 30
    color: "#ff5c7a"   # hot
color_mode: gradient
```

Without `colors` or `color`, the gauge is green up to 60% of its range, amber up to 85%, and red above that.

### Zones

Shade part of a ring (Rings style):

```yaml
zones:
  - from: 400
    to: 1000
    color: "#38d6a0"
    opacity: 0.3     # optional, 0 to 1
```

### Markers

Mark an important value with a line (Rings style):

```yaml
markers:
  - value: 1000
    label: "1000"    # labels are shown on the outer ring
    color: "#ffc857" # optional, defaults to the text colour
```

## Dashboard layouts

| Layout | How the card behaves |
|---|---|
| **Sections** | Starts at half a section wide. Resize it freely; the gauge shrinks to fit the cell instead of being cut off. |
| **Masonry** | Sizes itself to the column width. |
| **Panel** | Fills the width, up to the `size` you set (340 px by default). Raise `size` for a big wall display. |
| **Phones** | Fills the screen width and stays readable. |

## Troubleshooting

| Problem | Solution |
|---|---|
| **Glass Dual Gauge** isn't in the card list | Refresh the page as in [Part 2](#part-2-refresh-the-page). If it's still missing, check **Settings → Dashboards → ⋮ → Resources** for a `glass-dual-gauge.js` entry of type **JavaScript module**. |
| A red box says **Custom element doesn't exist: glass-dual-gauge** | The browser hasn't loaded the card yet. Refresh as in [Part 2](#part-2-refresh-the-page), and check the resource as above. |
| The pictures or text on the Marketplace page are out of date | Open **Glass Dual Gauge** in the Marketplace, open the **⋮** menu and choose **Update information**. |
| The card still looks like the old version after an update | Refresh as in [Part 2](#part-2-refresh-the-page). |
| A value shows **–** and **Unavailable** | The sensor itself is unavailable or not a number. Check it under **Settings → Devices & services → Entities**. |
| The colour doesn't change with the value | That gauge is set to a single colour. Choose **Changes with value** in the editor, or use `colors` instead of `color` in YAML. |
| The card is small | In a Sections dashboard, drag the card's corner to make it bigger. In other layouts, raise `size`. |
| The visual editor says it isn't available | Use the code editor for now, and update Home Assistant to a recent version. |

## Contributing

Bug reports and ideas are welcome. When reporting a problem, include your Home Assistant version, your browser or app, and the card's YAML (from the code editor).

## License

Released under the [MIT License](https://github.com/Degederon/GlassDualGauges/blob/main/LICENSE).
