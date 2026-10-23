# Bundled themes

Select these in **Launcher Settings → Appearance**. Changes apply immediately and survive app restarts. Each theme shares the same source selection, remote behavior and prayer data.

| Theme | Preview |
| --- | --- |
| **Teal & Gold** — original Islamic geometry, initial default | ![Teal and Gold](../docs/screenshots/classic.png) |
| **Midnight & Mint** — architectural arches and soft mint | ![Midnight and Mint](../docs/screenshots/mint.png) |
| **Sand & Olive** — warm ivory with forest green | ![Sand and Olive](../docs/screenshots/sand.png) |
| **Obsidian & Gold** — dark with champagne accents | ![Obsidian and Gold](../docs/screenshots/obsidian.png) |
| **Twilight** — sunset colors and layered landscape | ![Twilight](../docs/screenshots/dusk.png) |

These are demo renders, not live times. Implementation lives in `launcher/app/src/main/assets/`: `home.css` + `refresh.css` for classic, `modern.css` for the modern base, `theme-sand.css`, `theme-obsidian.css`, `theme-dusk.css` for variants, and `settings.css` for shared controls. No separate JSON import or theme-pushing API exists in this app; use the bundled settings controls.
