<div align="center">

# Glass Dual Gauge

**Two values on one gauge, on a frosted-glass card for Home Assistant.**

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1%2B-18BCF2.svg?logo=homeassistant&logoColor=white)](https://www.home-assistant.io/)
[![Version](https://img.shields.io/badge/version-1.5.0-6E56CF.svg)](https://github.com/Degederon/GlassDualGauges/blob/main/CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Degederon/GlassDualGauges/blob/main/LICENSE)

</div>

Beautiful design and ease of use. https://github.com/Degederon/GlassDualGauges

Glass Dual Gauge shows two sensors on one card: temperature and humidity, CO₂ and air quality, battery and grid power, tank level and water temperature. Pick from 13 designs, from classic glowing rings to a filling bowl of liquid, a dial with two needles or a flower that blooms. Everything is set up in the dashboard editor with colour pickers and sliders, so no YAML is needed.

<p align="center">
  <img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/demo-dashboard.jpg" alt="The Glass Dual Gauge demo dashboard: 14 frosted-glass gauges in four groups on an aurora wallpaper" width="100%">
</p>

> **Tip:** want to see it before connecting any sensors? The [demo dashboard](#part-3-try-the-demo-dashboard) above takes two minutes to set up and runs on moving sample values.

## Contents

- [Features](#features)
- [Take a tour](#take-a-tour)
- [Requirements](#requirements)
- [Step-by-step setup](#step-by-step-setup)
- [The demo dashboard](#the-demo-dashboard)
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
| **Glass headings** | A matching section title card with a glowing icon and subtitle, readable on dark backgrounds even when Home Assistant is in light mode. |
| **Aurora wallpaper** | A colourful wallpaper made for the glass, used by both ready-made dashboards. |
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
- Resizing the card in **Sections** dashboards needs Home Assistant **2024.11** or later. The demo dashboard uses heading cards, which need **2024.10** or later.
- For your own gauges: two numeric sensors per card (or `number`, `input_number` or `counter` entities). The demo needs none.

## Step-by-step setup

Follow these parts in order. Parts 1 and 2 only need doing once. Part 3 is optional but is the quickest way to see what the card can do.

### Part 1: Install the card

**Using the Marketplace (Home Assistant 2026.11 and later)**

1. Go to **Settings → Marketplace**.
2. The first time, read the community-content warning and confirm.
3. Choose **Add via link**.
4. Paste `https://github.com/Degederon/GlassDualGauges` into **GitHub link**.
5. Set **Type** to **Dashboard**, then select **Add**.
6. Open **Glass Dual Gauge** and select **Install**.

To check it worked: the Glass Dual Gauge page shows a green tick and **installed**, and says it was added to your dashboard resources.

**Using HACS (earlier versions)**

1. Open **HACS**, select the menu (⋮) in the top right, and choose **Custom repositories**.
2. Paste `https://github.com/Degederon/GlassDualGauges` into **Repository**.
3. Set **Type** (or **Category**) to **Dashboard**, then select **Add**.
4. Close the dialog, search HACS for **Glass Dual Gauge**, open it and select **Download**.

**Manual installation**

1. Download [`glass-dual-gauge.js`](https://github.com/Degederon/GlassDualGauges/blob/main/glass-dual-gauge.js) (select **Download raw file** on that page).
2. Copy it into the `www` folder inside your Home Assistant `config` folder. Create `www` if it doesn't exist.
3. Go to your profile (bottom left) and turn on **Advanced mode**.
4. Go to **Settings → Dashboards**, open the menu (⋮) in the top right, and choose **Resources**.
5. Select **+ Add resource**, enter `/local/glass-dual-gauge.js`, choose **JavaScript module**, and select **Create**.

### Part 2: Refresh the page

Your browser has to load the new card once. After installing, and after every update:

- **Computer:** press **Ctrl + Shift + R** (Mac: **Cmd + Shift + R**) on any Home Assistant page.
- **Companion app (phone or tablet):** go to **Settings → Companion app → Debugging → Reset frontend cache**, then close and reopen the app.

To check it worked: edit any dashboard, select **+ Add card**, and type **glass** in the search box. **Glass Dual Gauge** appears, with a live preview.

### Part 3: Try the demo dashboard

The demo dashboard shows all 13 styles in four groups (Climate, Energy, Water and garden, Me and the sky) on a dark aurora background. Every gauge moves on its own with sample values, so it works straight away without any sensors.

1. Open [demo-dashboard.yaml](https://github.com/Degederon/GlassDualGauges/blob/main/demo-dashboard.yaml) on GitHub and select **Copy raw file** (the copy icon at the top right of the file).
2. In Home Assistant, go to **Settings → Dashboards** and select **+ Add dashboard** (bottom right).
3. Choose **New dashboard from scratch** and select **Next**.
4. Enter the title **Gauge demo**, choose an icon if you like (for example `mdi:gauge`), and select **Create**.
5. Open **Gauge demo** from the sidebar.
6. Select the pencil (**Edit dashboard**) in the top right. If you're asked how to start, choose **Start with an empty dashboard**.
7. Open the menu (⋮) in the top right and choose **Raw configuration editor**.
8. Select everything in the editor (**Ctrl + A**, Mac: **Cmd + A**), paste the demo (**Ctrl + V**, Mac: **Cmd + V**), and select **Save**.
9. Close the editor (✕), then select **Done**.

You should now see 14 frosted-glass gauges on a colourful aurora wallpaper, gently changing every few seconds. Every value shows a number; if you see **Unavailable** everywhere, your card is older than version 1.4.0, so update it (see [Troubleshooting](#troubleshooting)).

The wallpaper loads from GitHub, so the dashboard needs an internet connection the first time. To keep it on your own system, download [aurora.jpg](https://github.com/Degederon/GlassDualGauges/blob/main/wallpapers/aurora.jpg) into your `config/www` folder and change the address in the `background:` line to `/local/aurora.jpg`.

<p align="center">
  <img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/demo-phone.jpg" alt="The demo dashboard on a phone" width="300">
</p>

### Part 4: Add a gauge with your own sensors

1. Open the dashboard you want it on and select the pencil (**Edit dashboard**).
2. In the section where you want the gauge, select **+ Add card**.
3. Type **glass** in the search box and select **Glass Dual Gauge**. The editor opens with a live preview, already using two of your sensors.
4. Under **Title**, give the card a name, for example **Living room**.
5. Open **Inner ring · first value** and pick the first sensor under **Entity**, for example your temperature sensor. Set **Minimum** and **Maximum** to the range you care about, for example **0** and **40**.
6. Open **Outer ring · second value** and do the same for the second sensor, for example humidity from **0** to **100**.
7. Under **Big number shows**, choose which value appears large in the middle.
8. Select **Save**.

### Part 5: Choose a style and colours

1. Edit the card again (select it while the dashboard is in edit mode).
2. At the top, tap a thumbnail under **Style**. The preview changes straight away, and the section names change to match (for example **Left wing** and **Right wing** for Butterfly).
3. Scroll down to the colour panels. For each value:
   - **One colour:** pick a colour or tap one of the swatches.
   - **Changes with value:** each colour applies from its value upwards. Edit the numbers, add or remove colours, or tap a quick palette such as **Cool → hot** to start.
   - Tick **Blend smoothly between colours** for a gradient instead of steps.
4. For the Rings style, use the **Ring thickness** and **Space between the rings** sliders to change the look.
5. Select **Save**.

### Part 6: Arrange and resize

- **Sections dashboards:** each card starts at half a section wide. In edit mode, drag the card to move it, or drag its bottom-right corner to resize it. The gauge shrinks or grows to fit.
- **Masonry dashboards:** the card fills its column. Use **Maximum size** in the editor to make it bigger or smaller.
- **A big wall display:** put one card in a **Panel** view and raise **Maximum size**, for example to **700**.

### Part 7: Turn the demo into your dashboard

Each demo card is a normal Glass Dual Gauge with `demo: true`, so you can keep the layout and connect real sensors one card at a time:

1. In the demo dashboard, select the pencil (**Edit dashboard**) and select a card.
2. Select **Show code editor** (the `</>` button), delete the line `demo: true`, and select **Show visual editor**.
3. Pick an **Entity** for each value, adjust **Minimum** and **Maximum**, and select **Save**.

## The demo dashboard

[demo-dashboard.yaml](https://github.com/Degederon/GlassDualGauges/blob/main/demo-dashboard.yaml) is a complete Sections dashboard with all 13 styles. See [Part 3](#part-3-try-the-demo-dashboard) for how to add it.

| Group | Cards |
|---|---|
| **Climate** | Living room (Rings), Inside and out (Butterfly), Air quality (Segments), Thermostat (Needles) |
| **Energy** | Solar (Pulse), Battery and grid (Rings, filling from zero), Power (Tape), Server (Orbit) |
| **Water and garden** | Rain tank (Liquid), Aquarium (Capsules), Garden (Dot grid) |
| **Me and the sky** | Today (Spiral), Wellbeing (Bloom), Tonight (Moon) |

The view also sets a dark aurora background, which makes the glass stand out. To use the same background on your own dashboard, copy the `background:` line from the file into your view's raw configuration.

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

[examples.yaml](https://github.com/Degederon/GlassDualGauges/blob/main/examples.yaml) is a second ready-made dashboard with eight example cards: colour ranges, zones and markers, values that go negative, a half circle, and the Liquid, Butterfly, Spiral and Capsules styles. Add it the same way as the demo ([Part 3](#part-3-try-the-demo-dashboard)), using a new dashboard called **Gauge examples**. Each card already names example sensors such as `sensor.office_temperature`; change them to yours and delete `demo: true` to switch a card to live values.

<p align="center">
  <img src="https://raw.githubusercontent.com/Degederon/GlassDualGauges/main/docs/images/examples-dashboard.jpg" alt="The examples dashboard: eight glass gauges in three groups" width="100%">
</p>

To copy a single example onto an existing dashboard instead, add a Glass Dual Gauge card, select **Show code editor**, and paste just that card, starting at `type: custom:glass-dual-gauge` (without the leading `- `).

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
| `demo` | `false` | Show moving sample values instead of sensors, for trying styles and building layouts. With `demo: true` the gauges don't need an `entity`. |

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

### Glass Heading card

A section title that matches the gauges. Add it from the card list (search for **Glass Heading**) or in YAML:

```yaml
type: custom:glass-heading
heading: Climate
subtitle: Temperature, humidity and air   # optional
icon: mdi:home-thermometer                # optional; the first letter is used without it
color: "#ff9f5c"                          # optional accent colour
theme: dark                               # auto (default), dark or light
```

Home Assistant's own heading card uses your theme's text colour, which can disappear against a dark wallpaper when Home Assistant is in light mode. Glass Heading with `theme: dark` always stays readable. It's included in the same file as the gauge, so there's nothing extra to install.

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
| Every value in the demo or examples says **Unavailable** | Your card is older than version 1.4.0, which added demo mode. In the Marketplace (or HACS), open **Glass Dual Gauge**, choose **⋮ → Update information**, install the update, then refresh as in [Part 2](#part-2-refresh-the-page). |
| The section titles are invisible on the dark background | Use the **Glass Heading** card with `theme: dark` instead of Home Assistant's heading card. Both ready-made dashboards already do. |
| The cards look pale and milky on the wallpaper | Home Assistant is in light mode, so the cards use their light look. Set `theme: dark` on each card, as the ready-made dashboards do. |
| The wallpaper doesn't appear | It loads from GitHub. Check the internet connection, or download it to `config/www` as described in [Part 3](#part-3-try-the-demo-dashboard). |
| **Glass Dual Gauge** isn't in the card list | Refresh the page as in [Part 2](#part-2-refresh-the-page). If it's still missing, check **Settings → Dashboards → ⋮ → Resources** for a `glass-dual-gauge.js` entry of type **JavaScript module**. |
| A red box says **Custom element doesn't exist: glass-dual-gauge** | The browser hasn't loaded the card yet. Refresh as in [Part 2](#part-2-refresh-the-page), and check the resource as above. |
| The pictures or text on the Marketplace page are out of date | Open **Glass Dual Gauge** in the Marketplace, open the **⋮** menu and choose **Update information**. |
| The card still looks like the old version after an update | Refresh as in [Part 2](#part-2-refresh-the-page). |
| A value shows **–** and **Unavailable** | The sensor itself is unavailable or not a number. Check it under **Settings → Devices & services → Entities**. |
| The colour doesn't change with the value | That gauge is set to a single colour. Choose **Changes with value** in the editor, or use `colors` instead of `color` in YAML. |
| Pasting `examples.yaml` or `demo-dashboard.yaml` gives an error | Paste it into the **Raw configuration editor** of a dashboard (see [Part 3](#part-3-try-the-demo-dashboard)), replacing everything there. It's a whole dashboard, so it doesn't go into a single card's code editor. |
| The demo dashboard shows red error boxes | The card isn't loaded yet. Complete [Part 2](#part-2-refresh-the-page). If only the section titles fail, update Home Assistant to 2024.10 or later. |
| The card is small | In a Sections dashboard, drag the card's corner to make it bigger. In other layouts, raise `size`. |
| The visual editor says it isn't available | Use the code editor for now, and update Home Assistant to a recent version. |

## Contributing

Bug reports and ideas are welcome. When reporting a problem, include your Home Assistant version, your browser or app, and the card's YAML (from the code editor).

## License

Released under the [MIT License](https://github.com/Degederon/GlassDualGauges/blob/main/LICENSE).
