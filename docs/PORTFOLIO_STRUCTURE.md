# Portfolio CSV workflow

作品データは **`data/projects.csv` 1本**で管理します。
Photo / Movie / Technology / Product を別ファイルに分ける必要はありません。

## メディア配置ルール

原則として作品ごとにフォルダを作ります。

```text
assets/media/projects/<project-id>/
```

例：

```text
assets/media/projects/lyrics-sync/
assets/media/projects/echogentleman/
assets/media/projects/image-captioner/
```

CSVの `id` とフォルダ名を揃えると管理しやすくなります。

写真だけの作品素材は `assets/media/photo/`、自前MP4/WebMは `assets/media/movie/` に置いても構いません。

## 1作品 = CSVの1レコード

| column | 内容 |
|---|---|
| `id` | 一意のID。英数字と `-` 推奨 |
| `enabled` | `1` = 表示、`0` = 非表示 |
| `order` | 一覧の並び順 |
| `title` | 作品名 |
| `tags` | `visual technology product photo movie` などをスペース区切り |
| `card_label` | カード下の表示 |
| `cover` | 一覧サムネイル。YouTubeの場合は空欄でも可 |
| `images` | 複数画像は ` | ` 区切り |
| `youtube` | YouTube URL |
| `video` | MP4 / WebM等の相対パス |
| `summary` | 概要 |
| `note` / `note2` | 技術・担当・期間など |
| `background` / `background_en` | 補足文 |
| `context` / `approach` / `result` | PROCESS詳細 |
| `links` | `GitHub::URL | Website::URL` 形式 |

CSVはRFC 4180形式の引用符・カンマ・セル内改行を扱えます。
Excel / Google SheetsからCSV（UTF-8推奨）として保存できます。

## Photo

例：

```text
id: tokyo-night
 tags: visual photo
 cover: assets/media/projects/tokyo-night/cover.webp
 images: assets/media/projects/tokyo-night/01.webp | assets/media/projects/tokyo-night/02.webp
```

## Movie / YouTube

- `tags`: `visual movie`
- `youtube`: YouTube URL
- `cover`: 空欄ならYouTubeサムネイルを自動使用

## Movie / self-hosted

```text
video: assets/media/movie/demo.mp4
```

## Technology / Product

専用形式はありません。同じCSV行で管理します。

```text
technology
technology visual
product technology
product technology visual
```

のように複数タグを付けられます。
画像、YouTube、外部リンクを同一作品で併用できます。

## 複数値

`images` と `links` は ` | ` 区切りです。

```text
assets/media/projects/example/01.webp | assets/media/projects/example/02.webp
```

```text
Website::https://example.com | GitHub::https://github.com/example
```

## テンプレート

`data/templates/PROJECT_TEMPLATE.csv` に以下のサンプルがあります。

- Photo
- YouTube Movie
- Local Movie
- Product + Technology

必要な行を `data/projects.csv` へコピーし、`enabled=1` にします。

## Local preview / CSV loading

The published site reads `data/projects.csv` directly over HTTP(S).

For opening `index.html` directly from Finder (`file://`), a generated fallback is bundled at:

- `assets/js/projects-data.js`

After changing `projects.csv`, regenerate the local-preview fallback with:

```bash
python3 tools/sync_csv.py
```

The generated JS is only a local-preview fallback. The CSV remains the source of truth for GitHub Pages.

## Product draft entries

The Product section currently includes seven SoundRave draft case studies sourced from the public product catalog:

- Verdigris
- Toxic
- BufferCareler
- ThermVoltGe
- REPUN
- ON'NENIKUR
- RAUSI

Each draft has a neutral placeholder cover at `assets/media/projects/<id>/cover.svg` and a pre-filled public product summary.
The personal development story fields (`context`, `approach`, `result`) intentionally contain `[TODO]` prompts so they can be replaced with accurate case-study details rather than inferred claims.

To replace a placeholder, put the real product image in the same project folder and update `cover` / `images` in `data/projects.csv`.
