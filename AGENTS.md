# Hisabati: Kitabu cha Mwanafunzi Darasa la Tano — ADT Bundle Reference

This document describes the structure of this Accessible Digital Textbook (ADT) bundle. Use it to orient yourself when doing post-processing.

## About This Book

**Hisabati: Kitabu cha Mwanafunzi Darasa la Tano** — Kitabu hiki ni cha Hisabati kwa mwanafunzi wa Darasa la Tano, kimeandaliwa na Taasisi ya Elimu Tanzania kwa muktadha wa elimu ya msingi Tanzania Bara na kimeandikwa kwa Kiswahili. Kinashughulikia mada za vipimo, duara, aina za namba, sehemu, desimali, aljebra na hesabu za fedha, kwa kiwango kinachofaa wanafunzi wa shule ya msingi wa kati. Kwa ujumla, kinatumia mbinu ya kufundisha kwa hatua, mifano, mazoezi, kazi za vitendo na matumizi ya maisha ya kila siku ili kujenga uelewa wa kimantiki na uwezo wa kutatua matatizo.

- **Source language**: `sw-TZ`
- **Available languages in this bundle**: `sw-TZ`
- **Total pages**: 179
- **Quizzes**: yes
- **Glossary**: yes

## Quick Overview

An ADT bundle is a self-contained, offline-capable web app for reading a book. It has:

- One HTML file per page/section and per quiz
- A localization system (`i18n`) for text, audio, and glossary — keyed by stable IDs
- A `pages.json` manifest that defines reading order
- A shared `assets/` directory with JS runtime, fonts, and UI resources

The `adt/` subdirectory is the self-contained web app. Other top-level files (`.db`, `.pdf`, `images/`, `audio/`, `.cache/`) are pipeline artifacts and not part of the reader.

## Directory Structure

```
HISABATI-DRS-5-PB-2025--15-OCTOBER-/
├── adt/                              # THE WEB APP
│   ├── index.html                    # Redirects to first page
│   ├── cover.png                     # Book cover image
│   ├── pg001_sec001.html             # Page HTML files (one per section)
│   ├── pg002_sec001.html
│   ├── ...
│   ├── qz001.html                    # Quiz HTML files
│   ├── qz002.html
│   ├── ...
│   │
│   ├── images/                       # Images referenced by page HTML
│   │   ├── pg001_im001.png
│   │   └── pg002_im002.png
│   │
│   ├── content/
│   │   ├── pages.json                # Reading order manifest
│   │   ├── toc.json                  # Table of contents
│   │   ├── tailwind_output.css       # Compiled Tailwind CSS
│   │   ├── navigation/
│   │   │   └── nav.html              # Navigation sidebar fragment
│   │   └── i18n/
│   │       └── {lang}/               # One directory per language: sw-TZ
│   │           ├── texts.json        # All text content (textId → string)
│   │           ├── audios.json       # Audio mappings (textId → mp3 filename)
│   │           ├── videos.json       # Video mappings (currently unused)
│   │           ├── glossary.json     # Glossary entries (word → object)
│   │           └── audio/            # MP3 files for read-aloud / TTS
│   │
│   └── assets/                       # Shared runtime (JS, fonts, icons)
│       ├── config.json               # Book title, languages, feature flags
│       ├── base.bundle.min.js        # Main JS runtime (do not edit)
│       ├── interface.html            # Accessibility sidebar template
│       ├── fonts/                    # Font files
│       ├── libs/fontawesome/         # Icon library
│       ├── modules/                  # JS feature modules (do not edit)
│       ├── sounds/                   # UI feedback sounds
│       └── interface_translations/
│           └── {lang}/
│               └── interface_translations.json
│
├── images/                           # Raw extracted images and page renders (pipeline artifact)
│   ├── pg001_page.png                # Full-page render from PDF (useful for visual reference)
│   ├── pg001_im001.png               # Extracted image from page
│   └── ...
├── audio/                            # Source audio files (pipeline artifact)
│   └── {lang}/                       # TTS audio per language
├── HISABATI-DRS-5-PB-2025--15-OCTOBER-.db                    # SQLite database (pipeline state)
├── HISABATI-DRS-5-PB-2025--15-OCTOBER-.pdf                   # Original source PDF
└── config.yaml                       # Pipeline configuration
```

## Page Images (Visual Reference)

The `images/` directory at the top level (outside `adt/`) contains raw renders of each original PDF page. These are useful as visual reference when editing content — you can see exactly what the original page looked like.

Page renders follow the pattern `pg{NNN}_page.png`:

- `images/pg001_page.png`
- `images/pg002_page.png`
- `images/pg003_page.png`
- `images/pg004_page.png`
- `images/pg005_page.png`
- `images/pg006_page.png`
- `images/pg007_page.png`
- `images/pg008_page.png`
- `images/pg009_page.png`
- `images/pg010_page.png`
- `images/pg011_page.png`
- `images/pg012_page.png`
- `images/pg013_page.png`
- `images/pg014_page.png`
- `images/pg015_page.png`
- `images/pg016_page.png`
- `images/pg017_page.png`
- `images/pg018_page.png`
- `images/pg019_page.png`
- `images/pg020_page.png`
- `images/pg021_page.png`
- `images/pg022_page.png`
- `images/pg023_page.png`
- `images/pg024_page.png`
- `images/pg025_page.png`
- `images/pg026_page.png`
- `images/pg027_page.png`
- `images/pg028_page.png`
- `images/pg029_page.png`
- `images/pg030_page.png`
- `images/pg031_page.png`
- `images/pg032_page.png`
- `images/pg033_page.png`
- `images/pg034_page.png`
- `images/pg035_page.png`
- `images/pg036_page.png`
- `images/pg037_page.png`
- `images/pg038_page.png`
- `images/pg039_page.png`
- `images/pg040_page.png`
- `images/pg041_page.png`
- `images/pg042_page.png`
- `images/pg043_page.png`
- `images/pg044_page.png`
- `images/pg045_page.png`
- `images/pg046_page.png`
- `images/pg047_page.png`
- `images/pg048_page.png`
- `images/pg049_page.png`
- `images/pg050_page.png`
- `images/pg051_page.png`
- `images/pg052_page.png`
- `images/pg053_page.png`
- `images/pg054_page.png`
- `images/pg055_page.png`
- `images/pg056_page.png`
- `images/pg057_page.png`
- `images/pg058_page.png`
- `images/pg059_page.png`
- `images/pg060_page.png`
- `images/pg061_page.png`
- `images/pg062_page.png`
- `images/pg063_page.png`
- `images/pg064_page.png`
- `images/pg065_page.png`
- `images/pg066_page.png`
- `images/pg067_page.png`
- `images/pg068_page.png`
- `images/pg069_page.png`
- `images/pg070_page.png`
- `images/pg071_page.png`
- `images/pg072_page.png`
- `images/pg073_page.png`
- `images/pg074_page.png`
- `images/pg075_page.png`
- `images/pg076_page.png`
- `images/pg077_page.png`
- `images/pg078_page.png`
- `images/pg079_page.png`
- `images/pg080_page.png`
- `images/pg081_page.png`
- `images/pg082_page.png`
- `images/pg083_page.png`
- `images/pg084_page.png`
- `images/pg085_page.png`
- `images/pg086_page.png`
- `images/pg087_page.png`
- `images/pg088_page.png`
- `images/pg089_page.png`
- `images/pg090_page.png`
- `images/pg091_page.png`
- `images/pg092_page.png`
- `images/pg093_page.png`
- `images/pg094_page.png`
- `images/pg095_page.png`
- `images/pg096_page.png`
- `images/pg097_page.png`
- `images/pg098_page.png`
- `images/pg099_page.png`
- `images/pg100_page.png`
- `images/pg101_page.png`
- `images/pg102_page.png`
- `images/pg103_page.png`
- `images/pg104_page.png`
- `images/pg105_page.png`
- `images/pg106_page.png`
- `images/pg107_page.png`
- `images/pg108_page.png`
- `images/pg109_page.png`
- `images/pg110_page.png`
- `images/pg111_page.png`
- `images/pg112_page.png`
- `images/pg113_page.png`
- `images/pg114_page.png`
- `images/pg115_page.png`
- `images/pg116_page.png`
- `images/pg117_page.png`
- `images/pg118_page.png`
- `images/pg119_page.png`
- `images/pg120_page.png`
- `images/pg121_page.png`
- `images/pg122_page.png`
- `images/pg123_page.png`
- `images/pg124_page.png`
- `images/pg125_page.png`
- `images/pg126_page.png`
- `images/pg127_page.png`
- `images/pg128_page.png`
- `images/pg129_page.png`
- `images/pg130_page.png`
- `images/pg131_page.png`
- `images/pg132_page.png`
- `images/pg133_page.png`
- `images/pg134_page.png`
- `images/pg135_page.png`
- `images/pg136_page.png`
- `images/pg137_page.png`
- `images/pg138_page.png`
- `images/pg139_page.png`
- `images/pg140_page.png`
- `images/pg141_page.png`
- `images/pg142_page.png`
- `images/pg143_page.png`
- `images/pg144_page.png`

## The Text ID System

Every piece of displayable text has a unique, stable **text ID**. This ID is the key that connects everything together. The same ID appears in three places simultaneously:

1. As a `data-id` attribute on HTML elements in page files
2. As a key in `content/i18n/{lang}/texts.json` (the string value)
3. As a key in `content/i18n/{lang}/audios.json` (the audio filename)

### ID Naming Conventions

| Pattern | What it is | Example |
|---|---|---|
| `pg{NNN}_gp{NNN}_tx{NNN}` | Page body text | `pg001_gp001_tx001` |
| `pg{NNN}_im{NNN}` | Image alt text / description | `pg001_im001` |
| `gl{NNN}` | Glossary word | `gl001` |
| `gl{NNN}_def` | Glossary definition | `gl001_def` |
| `qz{NNN}_que` | Quiz question | `qz001_que` |
| `qz{NNN}_o{N}` | Quiz option | `qz001_o0` |
| `qz{NNN}_o{N}_exp` | Quiz option explanation | `qz001_o0_exp` |

Page/group/text numbers are zero-padded to 3 digits. Quiz option numbers are single digits.

## Key Files in Detail

### `content/pages.json` — Reading Order

An ordered array that defines the navigation spine. Every page section and quiz appears here in reading order. Here are the first entries from this book:

```json
[
  { "section_id": "pg001_sec001", "href": "index.html" },
  { "section_id": "pg002_sec001", "href": "pg002_sec001.html" },
  { "section_id": "pg003_sec001", "href": "pg003_sec001.html" },
  { "section_id": "pg004_sec001", "href": "pg004_sec001.html" },
  { "section_id": "pg005_sec001", "href": "pg005_sec001.html" }
]
```

- `section_id` — matches the `<meta name="title-id">` in the HTML file
- `href` — relative path to the HTML file from the `adt/` root
- `page_number` — original PDF page number (omitted for cover pages, quizzes, etc.)

Quizzes are interleaved after their anchor content page.

### `content/i18n/{lang}/texts.json` — All Text Content

A flat `Record<textId, string>` containing every piece of text in the book. Example entries from this book:

```json
{
  "pg001_gp001_tx001": "",
  "pg001_im001": "Cheti cha ithibati cha kitabu cha Hisabati cha Mwanafunzi Darasa la Tano kutoka Wizara ya Elimu, Sayansi na Teknolojia. Kina muhuri wa serikali, maelezo ya kitabu, na saini ya Kamishna wa Elimu.",
  "gl001": "akaunti",
  "gl001_def": "Mahali pa kuhifadhi au kurekodi fedha benki au taasisi ya kifedha.",
  "qz001_que": "Unapozidisha vipimo vya urefu, unapaswa kuanza na kipimo kipi?",
  "qz001_o0": "1) Kipimo kidogo",
  "qz001_o0_exp": "✅ Sahihi! Unaanza na kipimo kidogo kama milimeta au sentimeta kisha unaendelea kwenda kwenye vipimo vikubwa."
}
```

### `content/i18n/{lang}/audios.json` — Audio Mappings

Maps each text ID to its MP3 filename in the `audio/` subdirectory:

```json
{
  "pg001_gp001_tx001": "pg001_gp001_tx001.mp3",
  "gl001": "gl001.mp3",
  "qz001_que": "qz001_que.mp3"
}
```

Audio files live at `content/i18n/{lang}/audio/{filename}.mp3`.

### `content/i18n/{lang}/glossary.json` — Glossary

Keyed by word (lowercase). Each entry has the word, a simple definition, inflected variations for matching, and decorative emoji. Example from this book:

```json
{
  "akaunti": {
    "word": "akaunti",
    "definition": "Mahali pa kuhifadhi au kurekodi fedha benki au taasisi ya kifedha.",
    "variations": ["akaunti","akaunti yake"],
    "emoji": "🏦📒"
  }
}
```

The runtime uses `variations` to match and highlight glossary words anywhere in the page text.

### `assets/config.json` — Feature Flags and Languages

Controls which features the reader UI enables. This book's config:

```json
{
  "title": "Hisabati: Kitabu cha Mwanafunzi Darasa la Tano",
  "bundleVersion": "1",
  "languages": {
    "available": [
      "sw-TZ"
    ],
    "default": "sw-TZ"
  },
  "features": {
    "signLanguage": false,
    "easyRead": true,
    "glossary": true,
    "eli5": false,
    "readAloud": true,
    "autoplay": true,
    "showTutorial": true,
    "showNavigationControls": true,
    "describeImages": true,
    "notepad": false,
    "state": true,
    "characterDisplay": false,
    "highlight": true,
    "activities": true
  },
  "analytics": {
    "enabled": false,
    "siteId": 0,
    "trackerUrl": "https://unisitetracker.unicef.io/matomo.php",
    "srcUrl": "https://unisitetracker.unicef.io/matomo.js"
  },
  "defaultSettings": {
    "dockLayout": {
      "width": "full",
      "position": "bottom",
      "align": "spread"
    },
    "theme": "dark",
    "iconSize": "md",
    "reduceMotion": false
  },
  "lockedSettings": [
    "dockLayout",
    "theme",
    "iconSize",
    "reduceMotion"
  ]
}
```

## Page HTML Structure

Each page is a standalone HTML file at the root of `adt/`. Key structural elements:

```html
<!DOCTYPE html>
<html lang="sw-TZ">
<head>
    <meta name="title-id" content="pg007_sec001" />      <!-- section identity -->
    <meta name="page-section-id" content="2" />           <!-- 1-based index in pages.json -->
    <link href="./content/tailwind_output.css" rel="stylesheet">
    <link href="./assets/libs/fontawesome/css/all.min.css" rel="stylesheet">
    <link href="./assets/fonts.css" rel="stylesheet">
</head>
<body>
    <div id="content" class="opacity-0">
        <section role="article" data-section-type="text_and_single_image"
                 data-section-id="pg007_sec001">
            <!-- Images use relative paths and carry data-id for alt text lookup -->
            <img data-id="pg001_im001" src="images/pg001_im001.png" ...>

            <!-- Text elements carry data-id for i18n and TTS -->
            <span data-id="pg001_gp001_tx001"></span>
        </section>
    </div>

    <div id="interface-container"></div>
    <div id="nav-container"></div>
    <script src="./assets/base.bundle.min.js?v=1" type="module"></script>
</body>
</html>
```

Key conventions:

- **`data-id` on text elements** links to `texts.json` and `audios.json` — the runtime replaces inner text with the value from the active language's `texts.json` and wires up audio playback from `audios.json`
- **`data-id` on images** links to image description text and audio
- **Images** use relative paths: `images/{filename}`
- **`page-section-id`** meta tag is the 1-based numeric index of this page's position in `pages.json` — the runtime uses this for navigation
- **Content starts `opacity-0`** — the JS runtime fades it in after loading the interface

## Quiz HTML Structure

Quiz pages use `role="activity"` and embed correct answers in multiple places:

```html
<section role="activity" data-section-type="activity_quiz" data-id="qz001"
    data-correct-answers='{"qz001_o0":true,"qz001_o1":false,"qz001_o2":false}'
    data-option-explanations='{"qz001_o0":"qz001_o0_exp","qz001_o1":"qz001_o1_exp","qz001_o2":"qz001_o2_exp"}'>

    <p data-id="qz001_que">Unapozidisha vipimo vya urefu, unapaswa kuanza na kipimo kipi?</p>

    <label data-activity-item="qz001_o0"
           data-explanation="✅ Sahihi! Unaanza na kipimo kidogo kama milimeta au sentimeta kisha unaendelea kwenda kwenye vipimo vikubwa." data-explanation-id="qz001_o0_exp">
        <input type="radio" name="qz001" value="qz001_o0" class="sr-only" />
        <span data-id="qz001_o0">1) Kipimo kidogo</span>
    </label>
    <!-- more options... -->
</section>

<!-- Answers also embedded as JSON and in window.correctAnswers -->
<script type="application/json" id="quiz-correct-answers">{"qz001_o0":true,"qz001_o1":false,"qz001_o2":false}</script>
<script type="application/json" id="quiz-explanations">{"qz001_o0":"qz001_o0_exp","qz001_o1":"qz001_o1_exp","qz001_o2":"qz001_o2_exp"}</script>
<script>window.correctAnswers = JSON.parse('{"qz001_o0":true,"qz001_o1":false,"qz001_o2":false}');</script>
```

## How to Edit Text

To change text content for a given language, you must update all three locations that reference the text:

1. **`texts.json`** — Change the value in `content/i18n/{lang}/texts.json` for the text ID.
2. **The HTML file** — The text also appears inline in the page HTML. Update the inner text of the element with the matching `data-id`. The runtime replaces this on load, but the inline text serves as fallback.
3. **Audio** (if applicable) — Regenerate the MP3 at `content/i18n/{lang}/audio/{textId}.mp3` and verify `audios.json` maps the text ID to the correct filename.

### Editing Quiz Text

For quiz content, you must additionally update:

- The `data-explanation` attribute on the `<label>` element (inline explanation text)
- The `data-correct-answers` attribute on the `<section>` element
- The `data-option-explanations` attribute on the `<section>` element
- The `<script type="application/json" id="quiz-correct-answers">` block
- The `<script type="application/json" id="quiz-explanations">` block
- The `window.correctAnswers` inline script

### Editing Glossary

Update both:

- `content/i18n/{lang}/glossary.json` — the glossary entry for the word
- `content/i18n/{lang}/texts.json` — the `gl{NNN}` and `gl{NNN}_def` entries

## How to Add a New Page

1. **Create the HTML file** — Copy an existing page as a template. Name it `pg{NNN}_sec001.html` following the sequential numbering pattern.

2. **Set the `title-id` meta tag** — `<meta name="title-id" content="pg012_sec001">`.

3. **Add text with `data-id` attributes** — Use the naming pattern `pg{NNN}_gp{NNN}_tx{NNN}` for each text element.

4. **Add images** — Place image files in `images/` and reference them with relative paths. Give each `<img>` a `data-id` attribute (e.g. `pg012_im001`).

5. **Update `pages.json`** — Insert the new entry at the correct position in reading order:
   ```json
   { "section_id": "pg012_sec001", "href": "pg012_sec001.html", "page_number": 11 }
   ```

6. **Renumber `page-section-id`** — Update the `<meta name="page-section-id">` in every HTML file that comes after the insertion point (this is a 1-based index into `pages.json`).

7. **Add text entries** — Add entries for every `data-id` in the new page to `content/i18n/{lang}/texts.json` for each language.

8. **Add audio entries** — Map each new text ID in `content/i18n/{lang}/audios.json` and place MP3 files in `content/i18n/{lang}/audio/`.

## How to Add a New Language

1. Create `content/i18n/{lang}/` with all required files:
   - `texts.json` — translated strings for every text ID
   - `audios.json` — audio filename mappings (can reuse the same naming pattern)
   - `glossary.json` — translated glossary entries
   - `videos.json` — `{}` (placeholder)
   - `audio/` — MP3 files for each text ID

2. Add the language code to `languages.available` in `assets/config.json`.

3. Optionally add UI translations at `assets/interface_translations/{lang}/interface_translations.json`.

## Where to Find Things

| What you need | Where to look |
|---|---|
| Rendered page HTML | `adt/pg{NNN}_sec{NNN}.html` |
| Quiz HTML | `adt/qz{NNN}.html` |
| Entry point | `adt/index.html` (redirects to first page) |
| Page images | `adt/images/` |
| All text content | `adt/content/i18n/{lang}/texts.json` |
| Audio file mappings | `adt/content/i18n/{lang}/audios.json` |
| Audio MP3 files | `adt/content/i18n/{lang}/audio/` |
| Glossary | `adt/content/i18n/{lang}/glossary.json` |
| Reading order | `adt/content/pages.json` |
| Table of contents | `adt/content/toc.json` |
| Book config & features | `adt/assets/config.json` |
| CSS styles | `adt/content/tailwind_output.css` |
| JS runtime | `adt/assets/base.bundle.min.js` |
| UI string translations | `adt/assets/interface_translations/{lang}/` |
| Cover image | `adt/cover.png` |
| Original PDF | `HISABATI-DRS-5-PB-2025--15-OCTOBER-.pdf` |
| Pipeline database | `HISABATI-DRS-5-PB-2025--15-OCTOBER-.db` (SQLite) |
| Raw page renders | `images/pg{NNN}_page.png` (visual reference for original pages) |
| Raw extracted images | `images/pg{NNN}_im{NNN}.png` (pipeline artifact) |
| Source TTS audio | `audio/{lang}/` (pipeline artifact) |

## Audio Naming Conventions

| Pattern | What it is |
|---|---|
| `pg{NNN}_gp{NNN}_tx{NNN}.mp3` | Page body text read-aloud |
| `pg{NNN}_im{NNN}.mp3` | Image description read-aloud |
| `gl{NNN}.mp3` | Glossary word pronunciation |
| `gl{NNN}_def.mp3` | Glossary definition read-aloud |
| `qz{NNN}_que.mp3` | Quiz question read-aloud |
| `qz{NNN}_o{N}.mp3` | Quiz option read-aloud |
| `qz{NNN}_o{N}_exp.mp3` | Quiz explanation read-aloud |

## Important: What Not to Edit

- **`assets/base.bundle.min.js`** and **`assets/modules/`** — compiled JS runtime; do not modify
- **`assets/libs/`** — vendored third-party libraries (FontAwesome, MathJax)
- **`assets/fonts/`** — font files
- **`assets/sounds/`** — UI feedback sounds
- **`content/tailwind_output.css`** — compiled from all HTML files; if you add new Tailwind classes to HTML, this file must be regenerated
