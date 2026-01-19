import { keyboard, Key } from '@nut-tree-fork/nut-js';

// Key mapping from string names to nut.js Key enum
const KEY_MAP: Record<string, Key> = {
  // Letters
  a: Key.A, b: Key.B, c: Key.C, d: Key.D, e: Key.E,
  f: Key.F, g: Key.G, h: Key.H, i: Key.I, j: Key.J,
  k: Key.K, l: Key.L, m: Key.M, n: Key.N, o: Key.O,
  p: Key.P, q: Key.Q, r: Key.R, s: Key.S, t: Key.T,
  u: Key.U, v: Key.V, w: Key.W, x: Key.X, y: Key.Y, z: Key.Z,

  // Numbers
  '0': Key.Num0, '1': Key.Num1, '2': Key.Num2, '3': Key.Num3, '4': Key.Num4,
  '5': Key.Num5, '6': Key.Num6, '7': Key.Num7, '8': Key.Num8, '9': Key.Num9,

  // Function keys
  f1: Key.F1, f2: Key.F2, f3: Key.F3, f4: Key.F4, f5: Key.F5, f6: Key.F6,
  f7: Key.F7, f8: Key.F8, f9: Key.F9, f10: Key.F10, f11: Key.F11, f12: Key.F12,

  // Modifiers
  ctrl: Key.LeftControl, control: Key.LeftControl,
  alt: Key.LeftAlt,
  shift: Key.LeftShift,
  win: Key.LeftWin, windows: Key.LeftWin, meta: Key.LeftWin,

  // Navigation
  up: Key.Up, down: Key.Down, left: Key.Left, right: Key.Right,
  home: Key.Home, end: Key.End,
  pageup: Key.PageUp, pagedown: Key.PageDown,

  // Editing
  enter: Key.Enter, return: Key.Enter,
  tab: Key.Tab,
  space: Key.Space,
  backspace: Key.Backspace,
  delete: Key.Delete, del: Key.Delete,
  insert: Key.Insert,
  escape: Key.Escape, esc: Key.Escape,

  // Symbols (common ones)
  minus: Key.Minus, '-': Key.Minus,
  equal: Key.Equal, '=': Key.Equal,
  comma: Key.Comma, ',': Key.Comma,
  period: Key.Period, '.': Key.Period,
  slash: Key.Slash, '/': Key.Slash,
  backslash: Key.Backslash, '\\': Key.Backslash,
};

class KeyboardControllerClass {
  private delayBetweenKeys = 50;

  setDelay(delay: number) {
    this.delayBetweenKeys = delay;
  }

  async type(text: string, delayBetweenKeys?: number): Promise<void> {
    const delay = delayBetweenKeys ?? this.delayBetweenKeys;
    keyboard.config.autoDelayMs = delay;
    await keyboard.type(text);
  }

  async pressKey(keyName: string): Promise<void> {
    const key = this.resolveKey(keyName);
    if (key) {
      await keyboard.pressKey(key);
      await keyboard.releaseKey(key);
    } else {
      // If not a special key, try typing it as text
      await keyboard.type(keyName);
    }
  }

  async hotkey(keys: string[]): Promise<void> {
    const resolvedKeys = keys.map((k) => this.resolveKey(k)).filter((k): k is Key => k !== null);

    if (resolvedKeys.length === 0) {
      throw new Error(`No valid keys found in hotkey: ${keys.join('+')}`);
    }

    // Press all keys in sequence
    for (const key of resolvedKeys) {
      await keyboard.pressKey(key);
    }

    // Small delay
    await this.sleep(50);

    // Release in reverse order
    for (const key of resolvedKeys.reverse()) {
      await keyboard.releaseKey(key);
    }
  }

  async holdKey(keyName: string): Promise<void> {
    const key = this.resolveKey(keyName);
    if (key) {
      await keyboard.pressKey(key);
    }
  }

  async releaseKey(keyName: string): Promise<void> {
    const key = this.resolveKey(keyName);
    if (key) {
      await keyboard.releaseKey(key);
    }
  }

  private resolveKey(keyName: string): Key | null {
    const normalized = keyName.toLowerCase().trim();
    return KEY_MAP[normalized] || null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const KeyboardController = new KeyboardControllerClass();
