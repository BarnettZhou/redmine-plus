# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Redmine Plus is a Chrome Extension (Manifest V3) that enhances the Redmine project management system. It injects content scripts into `https://redm.topcj.com/*` to provide additional features like project shortcuts, time tracking shortcuts, immersive Markdown editing, and issue detail drawers.

## Development Workflow

This is a pure browser extension with no build system. To develop:

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked" and select this project directory
4. After making code changes, click the refresh icon on the extension card or reload the Redmine page

## Architecture

### Plugin-Based Content Scripts

The extension uses a modular plugin architecture. Each feature is implemented as a separate plugin in `js/plugins/`:

- `project_shortcuts.js` - Adds custom project links to top navigation
- `time_tracking_shortcuts.js` - Adds time report shortcuts to top navigation
- `immersive_input.js` - Full-screen Markdown editor with live preview
- `issue_details.js` - Side drawer for quick issue preview via iframe
- `time_report_chart.js` - Generates charts from time report tables

### Configuration System

- Default configuration is defined in `js/default_config.js` (global `defaultConfig`)
- User settings are stored via `chrome.storage.local` with key `redminePlusConfig`
- The options page (`options.html`/`options.js`) provides the settings UI
- Configuration changes require page refresh to take effect

### Script Loading Order (manifest.json)

Content scripts load in this order:
1. `default_config.js` - Default configuration
2. `marked.min.js` - Markdown parser (global `marked`)
3. `chart.umd.min.js` - Chart.js library (global `Chart`)
4. Plugin files (each exposes a global init function)
5. `content-script.js` - Main entry that reads config and initializes plugins

### Key Code Patterns

**Adding a new plugin:**
1. Create file in `js/plugins/my_feature.js` exposing global init function `myFeatureInit(config)`
2. Add default config to `js/default_config.js`
3. Add script path to `manifest.json` content_scripts.js array (before content-script.js)
4. Add initialization call in `js/content-script.js` `execApp()` function
5. Add settings UI to `options.html` and handler logic to `js/options.js`

**Dynamic UI creation:**
- Use `Object.assign(element.style, {...})` for inline styles
- Use high z-index (>9999) for drawers/modals
- Use `position: fixed` with overlay for modal-like interfaces

## File Structure

```
manifest.json          # Extension manifest (V3)
popup.html/js          # Extension popup UI
options.html/js        # Settings page
css/
  custom-style.css     # Custom styles for issue highlighting
js/
  background.js        # Service worker (currently empty)
  content-script.js    # Main content script entry
  default_config.js    # Default configuration object
  options.js           # Settings page logic
  popup.js             # Popup logic
  plugins/             # Feature plugins
    project_shortcuts.js
    time_tracking_shortcuts.js
    immersive_input.js
    issue_details.js
    time_report_chart.js
```

## Important Implementation Details

- **Immersive Input**: Creates a 1600px drawer with left editor/right preview. Uses `marked` for Markdown rendering. Handles attachment image mapping from `.attachments` table.
- **Issue Details**: Opens issue in 1200px side drawer via iframe. Injects CSS to hide Redmine header/sidebar in iframe. Highlights selected row with `detail-opened` class.
- **Time Report Chart**: Parses `#time-report` table, extracts user/project/hours data, generates stacked bar chart using Chart.js in a modal.
- **Shortcuts**: Both project and time tracking shortcuts inject links into `#top-menu > ul` with a `|` separator.

## Permissions

The extension requires:
- `storage` - For saving user configuration
- `activeTab`, `tabs` - For tab operations
- Host permission: `https://redm.topcj.com/*`
