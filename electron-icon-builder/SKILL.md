---
name: electron-icon-builder
description: >
  Generate multi-platform Electron app icons (ICO, ICNS, multiple PNG sizes) from a single
  source PNG using electron-icon-builder. Use when the user wants to create, regenerate, or
  update app icons for an Electron project, mentions "electron-icon-builder", asks about icon
  generation for Electron apps, or needs to set up icon build scripts in package.json.
---

# Electron Icon Builder

Generate all required Electron app icon formats and sizes from a single source PNG.

## Prerequisites

- Node.js project with Electron (electron-builder or electron-forge)
- A source PNG image, **1024x1024px or larger**, with transparent background recommended

## Workflow

### 1. Prepare Source Image

Place a high-resolution PNG (at least 1024x1024) in the project. Common location: `build/icon.png` or `build/gen.png`.

If the user provides a different format (SVG, JPG, etc.), convert it to PNG first.

### 2. Install

```bash
npm install --save-dev electron-icon-builder
```

### 3. Add Script to package.json

```json
{
  "scripts": {
    "build:icons": "electron-icon-builder --input=./build/icon.png --output=./build"
  }
}
```

Adjust `--input` to match the actual source image path.

### 4. Run Generation

```bash
npm run build:icons
```

This produces the following structure:

```
build/
└── icons/
    ├── 16x16.png
    ├── 24x24.png
    ├── 32x32.png
    ├── 48x48.png
    ├── 64x64.png
    ├── 128x128.png
    ├── 256x256.png
    ├── 512x512.png
    ├── 1024x1024.png
    ├── icon.ico      (Windows)
    └── icon.icns     (macOS)
```

### 5. Configure electron-builder

In `electron-builder.yml`:

```yaml
directories:
  buildResources: build

win:
  icon: build/icons/icon.ico

mac:
  icon: build/icons/icon.icns

linux:
  icon: build/icons
```

For `electron-forge`, set the icon path in the maker config accordingly.

### 6. Update BrowserWindow Icon (Optional)

In the main process, set the window icon for consistent taskbar appearance:

```ts
import { join } from 'path'

new BrowserWindow({
  icon: join(__dirname, '../../build/icons/256x256.png')
})
```

For production builds using electron-builder, the `build/icons` directory is included automatically via `buildResources`.

## Troubleshooting

- **Blurry icons**: Ensure source image is at least 1024x1024px
- **Transparent background lost**: Use PNG format, not JPG
- **ICO not generated**: Verify the source is a valid PNG with proper color depth
- **Permission errors on macOS**: Ensure write access to the output directory
