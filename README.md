# April Norton — portfolio site

Static site. No build step, no dependencies, no framework. Plain HTML, CSS and JS.

```
portfolio/
├── index.html          all the page content and copy
├── styles.css          all styling (colors defined at the top)
├── main.js             charts, lightbox, scroll behaviour
├── data/thermal.json   thermocouple data, generated from ProbeCali.csv
├── images/             web-optimised JPEGs (converted from the HEIC originals)
└── README.md
```

## Viewing it locally

The charts load `data/thermal.json` with `fetch()`, which browsers block when a page
is opened as a `file://` path. So run a tiny local server instead of double-clicking
`index.html`:

```bash
cd ~/Desktop/Cuisinart/portfolio && python3 -m http.server 8412
```

Then open <http://localhost:8412>. Everything else works either way — if the data file
can't load, the charts replace themselves with a short note instead of breaking.

## Putting it online

**Use GitHub Pages.** For a job application it's the right call: it's free forever,
the URL (`aprilnorton.github.io`) reads as a real personal site rather than a random
share link, it never expires or sleeps, and it costs nothing to keep up for years
after you stop touching it. You can also point a custom domain at it later
(`aprilnorton.com`) without moving anything.

One-time setup:

1. Make a free account at <https://github.com> if you don't have one.
2. Create a new **public** repository named exactly `aprilnorton.github.io`
   (substitute your actual username — the repo name must match it).
3. Upload the contents of this `portfolio` folder to the repo — on the repo page use
   **Add file → Upload files**, then drag in `index.html`, `styles.css`, `main.js`,
   and the `data` and `images` folders. Commit.
4. Wait a minute or two. Your site is live at `https://<username>.github.io`.

To update it later, upload changed files the same way and commit.

If you'd rather not use git at all, <https://app.netlify.com/drop> lets you drag this
whole folder onto the page and gives you a live URL in about ten seconds. It's the
fastest option, but the free URL looks like `cheerful-marzipan-1a2b3c.netlify.app`
until you set a custom name.

### Putting it on a resume or application

Once it's live, link it as a plain URL — `aprilnorton.github.io` — near your email
in the header. Avoid attaching the site as a zip; recruiters won't unzip it.

## Editing the content

All copy lives in `index.html` as ordinary text — search for the sentence you want to
change and edit it. Each project is one `<article class="project">` block.

To change the color scheme, edit the variables at the top of `styles.css`:

```css
--paper:  #FAF5EE;   /* background */
--ink:    #1F1B18;   /* body text */
--accent: #C0562B;   /* terracotta accent */
--steel:  #7C8A93;   /* chart trace color */
```

If you change `--accent` or `--steel`, note that the chart colors were checked for
colorblind separation (they stay distinguishable under protanopia, deuteranopia and
tritanopia). Picking new ones by eye may lose that.

To add a project photo: drop a JPEG in `images/`, then copy an existing
`<figure class="shot">` block and change the filename, the `alt` text, the
`data-cap` caption and the `<figcaption>`.

## Notes on the data

`data/thermal.json` is generated from `ProbeCali.csv` (the DI-808 export, one floor up
from this folder). It covers the in-bath portion of the run only — the probes were
lifted out of the water at 17.8 minutes, and the readings after that are room air, not
measurement, so they're excluded rather than drawn as a cliff at the edge of the chart.

Plateau statistics quoted on the page are computed over the 4.0–8.5 minute hold:
2.53 °F total spread between channels, under 0.7 °F noise per channel, and a 3.3 °F
systematic offset from the 212 °F reference.

## One thing to check before you publish

These photos are prototype hardware from an active co-op employer. Nothing here looks
like a trade secret to me — they're process shots of your own work — but Conair /
Cuisinart may still have rules about posting images of unreleased products. Worth a
quick email to your manager before the site goes public. If anything has to come out,
the easiest fix is deleting that `<figure>` block; the layout reflows on its own.
