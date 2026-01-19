# ROX Bot - Ragnarok X Next Gen Automation Bot

A Windows desktop automation bot for Ragnarok X Next Gen using Electron, React, and image recognition.

## Features

- **Visual Task Builder** - Create automation tasks with a drag-and-drop interface
- **Image Recognition** - Find UI elements using template matching
- **11 Action Types** - Click, type, wait, find image, conditions, loops, and more
- **Emergency Stop** - Press F12 anytime to immediately stop automation
- **Task Scheduling** - Run tasks on intervals or at specific times
- **Real-time Logging** - Monitor automation progress with detailed logs

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Windows 10/11** - Required for nut-tree/nut-js
- **Windows 10 N users**: Install [Media Feature Pack](https://www.microsoft.com/en-us/software-download/mediafeaturepack) for image recognition

## Installation

```bash
# Clone or navigate to the project
cd rox-bot

# Install dependencies
npm install
```

## Running the App

### Development Mode

```bash
npm run electron:dev
```

This starts Vite dev server and launches Electron with hot reload.

### Production Build

```bash
# Build the app
npm run electron:build

# The installer will be in the /release folder
```

## Usage Guide

### 1. Create a Task

1. Click **"+ New"** in the Tasks panel
2. Enter a task name
3. Add actions using the action buttons at the bottom

### 2. Add Actions

Available actions:

| Action | Description |
|--------|-------------|
| **Click** | Click at coordinates, on an image, or stored variable |
| **Double Click** | Double-click variant |
| **Right Click** | Right-click variant |
| **Type** | Type text with configurable delay |
| **Press Key** | Press a single key (enter, tab, f1, etc.) |
| **Hotkey** | Press key combination (ctrl+c, alt+f4, etc.) |
| **Wait** | Pause for specified milliseconds |
| **Find Image** | Search screen for template image |
| **Wait for Image** | Wait until image appears/disappears |
| **Condition** | If-else based on image visibility |
| **Loop** | Repeat actions (count, while visible, until visible) |

### 3. Create Image Templates

1. Go to **Templates** tab
2. Click **"+ Capture New"**
3. Enter coordinates (X, Y, Width, Height) of the region to capture
4. Click **"Capture Preview"** to see the result
5. Save with a descriptive name and category

### 4. Run Automation

1. Select a task from the list
2. Ensure the task is **enabled** (green toggle)
3. Click the **Start** button in the header
4. Use **Pause/Resume** to control execution
5. Press **F12** for emergency stop

## Project Structure

```
rox-bot/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── index.ts          # App entry point
│   │   ├── window.ts         # Window management
│   │   ├── ipc/              # IPC handlers
│   │   └── services/         # Log & Storage services
│   │
│   ├── renderer/             # React UI
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   └── store/            # Zustand state
│   │
│   ├── automation/           # Automation core
│   │   ├── core/             # Engine & TaskRunner
│   │   ├── actions/          # Action executor
│   │   ├── vision/           # Screen capture & matching
│   │   └── input/            # Mouse & keyboard control
│   │
│   ├── shared/               # Shared types & constants
│   └── preload/              # Electron preload script
│
└── resources/templates/      # Default template images
```

## Task JSON Format

Tasks are stored as JSON and can be exported/imported:

```json
{
  "id": "unique-id",
  "name": "My Task",
  "enabled": true,
  "actions": [
    {
      "id": "action-1",
      "type": "find-image",
      "templateName": "button.png",
      "storeResultIn": "buttonLocation"
    },
    {
      "id": "action-2",
      "type": "click",
      "target": { "type": "variable", "variableName": "buttonLocation" }
    },
    {
      "id": "action-3",
      "type": "loop",
      "loopType": "while-image-visible",
      "templateName": "accept-btn.png",
      "actions": [
        { "id": "action-3-1", "type": "click", "target": { "type": "image", "templateName": "accept-btn.png" } }
      ]
    }
  ]
}
```

## Settings

Access via the **Settings** tab:

- **Default Confidence** - Image matching threshold (0.0-1.0)
- **Default Delay** - Milliseconds between actions
- **Random Variation** - Adds randomness to delays for natural behavior
- **Emergency Stop Key** - Default: F12

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F12 | Emergency stop (works globally) |

## Troubleshooting

### "Image not found" errors

- Ensure template images are captured at the same resolution as the game
- Lower the confidence threshold in Settings (try 0.8 or 0.7)
- Recapture templates if game UI has changed

### nut-tree/nut-js installation issues

```bash
# If you get native module errors, rebuild:
npm rebuild @nut-tree/nut-js
```

### Windows N edition issues

Install the Media Feature Pack from Microsoft for image recognition to work.

## Tech Stack

- **Electron 32** - Desktop framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **@nut-tree/nut-js** - Screen capture, image matching, input simulation
- **Zustand** - State management
- **electron-store** - Persistent storage

## License

MIT

## Disclaimer

This bot is for educational purposes. Use responsibly and at your own risk. Automation may violate game terms of service.
