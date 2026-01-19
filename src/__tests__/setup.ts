import '@testing-library/jest-dom';

// Mock electron module first
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/path'),
    whenReady: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
    quit: jest.fn(),
  },
  BrowserWindow: jest.fn(() => ({
    loadURL: jest.fn(),
    webContents: {
      send: jest.fn(),
    },
  })),
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
  },
  globalShortcut: {
    register: jest.fn(() => true),
    unregister: jest.fn(),
    unregisterAll: jest.fn(),
  },
}));

// Mock electron-store
jest.mock('electron-store', () => {
  return jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  }));
});

// Mock nut-tree-fork
jest.mock('@nut-tree-fork/nut-js', () => ({
  screen: {
    grab: jest.fn(),
    grabRegion: jest.fn(),
    find: jest.fn(),
    mousePosition: jest.fn(),
  },
  mouse: {
    move: jest.fn(),
    click: jest.fn(),
    doubleClick: jest.fn(),
    rightClick: jest.fn(),
    setPosition: jest.fn(),
    pressButton: jest.fn(),
    releaseButton: jest.fn(),
    scrollUp: jest.fn(),
    scrollDown: jest.fn(),
    getPosition: jest.fn(() => Promise.resolve({ x: 0, y: 0 })),
  },
  keyboard: {
    type: jest.fn(),
    pressKey: jest.fn(),
    releaseKey: jest.fn(),
    config: {
      autoDelayMs: 50,
    },
  },
  Region: jest.fn((x, y, w, h) => ({ x, y, width: w, height: h })),
  Point: jest.fn((x, y) => ({ x, y })),
  Button: {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
  },
  Key: {
    Return: 'Return',
    Tab: 'Tab',
  },
  imageResource: jest.fn(),
  straightTo: jest.fn((point) => point),
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => '{}'),
  readdirSync: jest.fn(() => []),
}));

// Mock winston logger
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
  },
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
  },
}));

// Global test utilities
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as any;
