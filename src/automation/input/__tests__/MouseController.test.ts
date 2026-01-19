import { MouseController } from '../MouseController';
import * as nutjs from '@nut-tree-fork/nut-js';

jest.mock('@nut-tree-fork/nut-js');

describe('MouseController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('click', () => {
    it('should click with point parameter', async () => {
      const mockMouse = nutjs.mouse as any;
      mockMouse.move.mockResolvedValue(undefined);
      mockMouse.click.mockResolvedValue(undefined);

      await MouseController.click({ x: 100, y: 200 });

      expect(mockMouse.move).toHaveBeenCalled();
      expect(mockMouse.click).toHaveBeenCalledWith('LEFT');
    });

    it('should click without point parameter', async () => {
      const mockMouse = nutjs.mouse as any;
      mockMouse.click.mockResolvedValue(undefined);

      await MouseController.click();

      expect(mockMouse.click).toHaveBeenCalledWith('LEFT');
    });
  });

  describe('doubleClick', () => {
    it('should double click at point', async () => {
      const mockMouse = nutjs.mouse as any;
      mockMouse.move.mockResolvedValue(undefined);
      mockMouse.doubleClick.mockResolvedValue(undefined);

      await MouseController.doubleClick({ x: 150, y: 250 });

      expect(mockMouse.move).toHaveBeenCalled();
      expect(mockMouse.doubleClick).toHaveBeenCalledWith('LEFT');
    });
  });

  describe('rightClick', () => {
    it('should right click at point', async () => {
      const mockMouse = nutjs.mouse as any;
      mockMouse.move.mockResolvedValue(undefined);
      mockMouse.click.mockResolvedValue(undefined);

      await MouseController.rightClick({ x: 300, y: 400 });

      expect(mockMouse.move).toHaveBeenCalled();
      expect(mockMouse.click).toHaveBeenCalledWith('RIGHT');
    });
  });

  describe('moveTo', () => {
    it('should move mouse to point with humanize', async () => {
      const mockMouse = nutjs.mouse as any;
      mockMouse.move.mockResolvedValue(undefined);

      await MouseController.moveTo({ x: 100, y: 200 }, true);

      expect(mockMouse.move).toHaveBeenCalled();
    });

    it('should move mouse to point without humanize', async () => {
      const mockMouse = nutjs.mouse as any;
      mockMouse.setPosition.mockResolvedValue(undefined);

      await MouseController.moveTo({ x: 100, y: 200 }, false);

      expect(mockMouse.setPosition).toHaveBeenCalled();
    });
  });

  describe('scroll', () => {
    it('should scroll down', async () => {
      const mockMouse = nutjs.mouse as any;
      mockMouse.scrollDown.mockResolvedValue(undefined);

      await MouseController.scrollDown(5);

      expect(mockMouse.scrollDown).toHaveBeenCalledWith(5);
    });

    it('should scroll up', async () => {
      const mockMouse = nutjs.mouse as any;
      mockMouse.scrollUp.mockResolvedValue(undefined);

      await MouseController.scrollUp(5);

      expect(mockMouse.scrollUp).toHaveBeenCalledWith(5);
    });
  });

  describe('drag', () => {
    it('should drag from point to point', async () => {
      const mockMouse = nutjs.mouse as any;
      mockMouse.move.mockResolvedValue(undefined);
      mockMouse.pressButton.mockResolvedValue(undefined);
      mockMouse.releaseButton.mockResolvedValue(undefined);

      await MouseController.drag({ x: 0, y: 0 }, { x: 100, y: 100 });

      expect(mockMouse.move).toHaveBeenCalled();
      expect(mockMouse.pressButton).toHaveBeenCalledWith('LEFT');
      expect(mockMouse.releaseButton).toHaveBeenCalledWith('LEFT');
    });
  });
});
