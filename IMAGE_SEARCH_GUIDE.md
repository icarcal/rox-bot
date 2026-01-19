# Image Search & Template Matching Guide

## Overview

ROX Bot includes powerful image recognition capabilities that search for images **anywhere on your screen** during automation. You don't need to position the image in the same location every time!

## How It Works

### The Key Concept

When you create an **Image Template**, you're capturing a small portion of the screen as a reference. During task execution, the bot searches the **entire screen** to find where that image currently appears - regardless of position.

```
Capture Phase:        Search Phase (during automation):
┌─────────────────┐   ┌──────────────────────┐
│ Source Region   │   │  Entire Screen       │
│  ┌───────────┐  │   │  ┌────────────────┐  │
│  │ Template  │  │   │  │                │  │
│  │  (saved)  │  │   │  │  Found! ✓      │  │
│  └───────────┘  │   │  │  (anywhere)    │  │
└─────────────────┘   │  └────────────────┘  │
```

## Creating Templates

### In the Template Manager

1. Go to **Templates** tab
2. Click **+ Capture New**
3. **Define the region** containing the element you want to track
   - You only need to capture the distinctive part of the UI
   - Smaller regions are faster to search
4. Give it a **name** and **category**
5. Save

That's it! The template is now region-agnostic.

## Using Templates in Tasks

### Click on Image

You can make a click action target an image template instead of fixed coordinates:

1. Create a task action: **Click**
2. Set target type to **Image Template**
3. Select your template
4. During execution, the bot will find the image anywhere on screen and click it

### Find Image Action

Explicitly locate an image and save its position:

1. **Template**: Select which template to find
2. **Confidence** (0-1): How strict should matching be?
   - `0.95` - Very strict, nearly exact matches only
   - `0.85` - Balanced (default: 0.9)
   - `0.70` - Flexible, allows variations
3. **Search Region** (optional): Limit search to a specific area
   - Disabled by default (searches entire screen)
   - Enable for performance optimization on large screens
4. **Store Result**: Save found coordinates to a variable
   - Use later in the task with `{variable_name}`

### Wait for Image Action

Wait until an image appears (or disappears) with a timeout:

1. **Template**: Which image to wait for
2. **Confidence**: Matching strictness (same scale as above)
3. **Timeout**: How long to wait (in milliseconds)
4. **Wait for disappear**: Flip the logic to wait until image is gone

## Advanced Options

### Confidence Threshold Explained

The confidence setting determines how similar an on-screen image must be to your template:

| Value | Use Case | Notes |
|-------|----------|-------|
| 0.95+ | Exact matches | UI elements with consistent appearance |
| 0.85-0.90 | **Standard** | Recommended for most automation |
| 0.70-0.80 | Variation tolerance | Images that may have slight changes |
| < 0.70 | Very flexible | May get false positives |

**Tip**: Start with 0.9 (default). If images aren't found, lower to 0.85. If you get false positives, raise to 0.95.

### Search Region (Performance Optimization)

By default, the system searches the entire screen. For very large or complex images, you can:

1. Enable **Limit search to specific screen region**
2. Enter coordinates and dimensions
3. The search will only look in that area (faster)

**When to use**:
- Large monitors (2160p+)
- Multiple monitors
- Very similar images elsewhere on screen
- Performance is critical

## Best Practices

### Template Capture

✅ **DO**:
- Capture only the distinctive part (e.g., just the button, not the whole window)
- Include enough context for uniqueness
- Use elements with high contrast
- Test on different UI themes if applicable

❌ **DON'T**:
- Capture enormous regions (slows down search)
- Use generic templates (text, basic shapes)
- Capture entire screens
- Include text that changes (like status messages)

### Confidence Settings

✅ **DO**:
- Start with `0.9` for most elements
- Use `0.95` for exact UI matches
- Use `0.85` if targets vary slightly
- Adjust based on failures

❌ **DON'T**:
- Use very low values (`< 0.70`) unless necessary
- Mix wildly different confidence levels without testing
- Assume higher = better (can miss valid matches)

### Task Design

✅ **DO**:
- Verify images exist before using them with `find-image`
- Use `wait-for-image` before clicking on dynamic elements
- Add delays before searches if UI is animating
- Store click results for logging/debugging

❌ **DON'T**:
- Assume fixed positions (use image search instead)
- Search immediately after UI transitions
- Use overly aggressive confidence (< 0.8) without testing

## Example Workflow

### Automating a Button Click

1. **Capture Template**
   - Take screenshot of the button
   - Go to Templates → + Capture New
   - Select just the button area
   - Name: "Submit Button"

2. **Add to Task**
   - Create Click action
   - Target type: Image Template
   - Select "Submit Button"
   - Confidence: 0.9

3. **Test**
   - Move button to different position on screen
   - Run task
   - Bot finds and clicks button automatically ✓

### Waiting for Dynamic Content

```
Task: "Wait for Save Confirmation"
1. Find-Image: "Success Message" (confidence: 0.85)
2. Delay: 2000ms (give user time to read)
3. Click: "OK Button"
```

## Troubleshooting

### Image Not Found

**Symptom**: Search fails even though image is visible

**Solutions**:
1. Lower confidence threshold (try 0.85 or 0.80)
2. Re-capture the template (may be corrupted or outdated)
3. Check template region is distinct enough
4. Verify template file exists in data folder

### False Positives

**Symptom**: Bot clicks wrong element or wrong location

**Solutions**:
1. Raise confidence threshold (try 0.95)
2. Capture larger, more distinctive region
3. Use search region to exclude problematic areas
4. Ensure template is unique on screen

### Search Too Slow

**Symptom**: Image search takes too long

**Solutions**:
1. Capture smaller template (less data to compare)
2. Enable search region (limit area to search)
3. Lower confidence threshold slightly (0.85 vs 0.95)
4. Close unnecessary applications

## Technical Details

### Where Templates Are Stored

Templates are saved in:
```
%APPDATA%/rox-bot/templates/  (Windows)
~/.config/rox-bot/templates/  (Linux)
~/Library/Application Support/rox-bot/templates/ (macOS)
```

Files are PNG images named like:
```
category_templatename_hash.png
e.g., ui_submit-button_a1b2c3.png
```

### Search Algorithm

ROX Bot uses `@nut-tree-fork/nut-js` for image matching, which:
- Performs pixel-by-pixel comparison with fuzzy matching
- Returns center point and bounding region of match
- Searches entire screen by default
- Supports optional region constraints

### Storage

Found image locations can be stored in variables:
```javascript
// Find image and store location
"store-result-in": "buttonLocation"

// Later in task
"target": {
  "type": "variable",
  "variableName": "buttonLocation"
}
```

## Tips & Tricks

### Multi-Monitor Support

ROX Bot automatically handles multiple monitors. Templates will search across all connected displays.

### Dynamic UI Elements

For elements that change slightly (different text, colors):
- Use lower confidence (0.80-0.85)
- Capture the stable parts of the UI
- Test across different states

### Performance Monitoring

To check search performance:
1. Open DevTools (F12 in development mode)
2. Check console logs for timing
3. Adjust template size/confidence based on metrics

### Layered Searches

For complex tasks with multiple similar elements:
1. Define unique regions for each element
2. Use confidence matching strategically
3. Add delays between searches
4. Verify with find-image before clicking

