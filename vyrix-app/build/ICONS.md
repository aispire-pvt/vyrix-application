# Icon Files Required

Place these files in this directory before running `npm run dist`:

| File | Size | Platform | How to create |
|---|---|---|---|
| `icon.ico` | 256x256 (multi-size ICO) | Windows | Use https://convertico.com — upload a 1024x1024 PNG of the Vyrix logo |
| `icon.icns` | 1024x1024 | macOS | Use https://cloudconvert.com/png-to-icns — upload a 1024x1024 PNG |
| `icon.png` | 512x512 min | Linux | Just a high-res PNG of the Vyrix logo |

All three should be the same Vyrix logo — just different formats for each OS.

electron-builder will error if these files are missing when you run `npm run dist`.
