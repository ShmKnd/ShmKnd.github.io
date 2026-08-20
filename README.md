# Shoma Kondo Portfolio

## Daily editing

The portfolio content source is:

- `data/projects.csv`

Media lives under:

- `assets/media/projects/<project-id>/`
- `assets/media/photo/`
- `assets/media/movie/`

## Preview

### Fastest
Open `index.html` directly. A generated CSV fallback is bundled, so cards and local images work from `file://`.


### Recommended
Double-click `preview.command` on macOS, or run:

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765`.

## After editing projects.csv

GitHub Pages reads `data/projects.csv` directly, so a normal push is enough for the published site.

For direct `file://` preview to reflect the latest CSV too, run:

```bash
python3 tools/sync_csv.py
```

This regenerates `assets/js/projects-data.js`. Do not edit that generated file manually.

## Product images

Public SoundRave product artwork may be referenced directly with absolute HTTPS URLs in `data/projects.csv`.
This keeps the portfolio data-driven while avoiding duplicate copies of already-public product artwork.
Private/photo assets should continue to use local project media paths as appropriate.
