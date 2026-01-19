import type { Task } from '../types';

/**
 * Pre-built example tasks for common ROX automation scenarios.
 * These serve as templates that users can copy and customize.
 */
export const EXAMPLE_TASKS: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Daily Quest Board',
    description: 'Automatically accept and complete daily quest board quests',
    enabled: true,
    actions: [
      {
        id: 'ex-1-1',
        type: 'find-image',
        templateName: 'ui/quest-board-icon.png',
        storeResultIn: 'questBoardLocation',
        description: 'Find the quest board icon',
      },
      {
        id: 'ex-1-2',
        type: 'click',
        target: { type: 'variable', variableName: 'questBoardLocation' },
        description: 'Click on quest board',
        delayAfter: 500,
      },
      {
        id: 'ex-1-3',
        type: 'wait-for-image',
        templateName: 'ui/quest-board-dialog.png',
        timeout: 3000,
        description: 'Wait for quest board dialog to open',
      },
      {
        id: 'ex-1-4',
        type: 'loop',
        loopType: 'while-image-visible',
        templateName: 'ui/accept-quest-button.png',
        maxIterations: 10,
        actions: [
          {
            id: 'ex-1-4-1',
            type: 'click',
            target: { type: 'image', templateName: 'ui/accept-quest-button.png' },
            description: 'Click accept button',
            delayAfter: 300,
          },
        ],
        description: 'Accept all available quests',
      },
    ],
    runCount: 0,
  },
  {
    name: 'Auto Attack Loop',
    description: 'Continuously attack nearby monsters',
    enabled: true,
    actions: [
      {
        id: 'ex-2-1',
        type: 'loop',
        loopType: 'infinite',
        maxIterations: 1000,
        actions: [
          {
            id: 'ex-2-1-1',
            type: 'find-image',
            templateName: 'monsters/target-monster.png',
            storeResultIn: 'monsterLocation',
            continueOnError: true,
            description: 'Find monster',
          },
          {
            id: 'ex-2-1-2',
            type: 'condition',
            conditionType: 'variable-equals',
            variableName: 'monsterLocation',
            variableValue: 'null',
            thenActions: [
              {
                id: 'ex-2-1-2-1',
                type: 'wait',
                duration: 1000,
                description: 'No monster found, wait',
              },
            ],
            elseActions: [
              {
                id: 'ex-2-1-2-2',
                type: 'click',
                target: { type: 'variable', variableName: 'monsterLocation' },
                description: 'Click on monster',
                delayAfter: 200,
              },
              {
                id: 'ex-2-1-2-3',
                type: 'press-key',
                key: '1',
                description: 'Use skill 1',
                delayAfter: 500,
              },
            ],
            description: 'Attack if monster found',
          },
        ],
        description: 'Main attack loop',
      },
    ],
    runCount: 0,
  },
  {
    name: 'Auto Potion',
    description: 'Automatically use health potion when HP is low',
    enabled: true,
    actions: [
      {
        id: 'ex-3-1',
        type: 'loop',
        loopType: 'infinite',
        maxIterations: 10000,
        actions: [
          {
            id: 'ex-3-1-1',
            type: 'condition',
            conditionType: 'image-visible',
            templateName: 'ui/low-hp-indicator.png',
            thenActions: [
              {
                id: 'ex-3-1-1-1',
                type: 'press-key',
                key: '5',
                description: 'Use HP potion (hotkey 5)',
                delayAfter: 1000,
              },
            ],
            description: 'Check if HP is low',
          },
          {
            id: 'ex-3-1-2',
            type: 'wait',
            duration: 500,
            description: 'Check interval',
          },
        ],
        description: 'Potion monitoring loop',
      },
    ],
    runCount: 0,
  },
  {
    name: 'NPC Interaction',
    description: 'Talk to an NPC and select dialog options',
    enabled: true,
    actions: [
      {
        id: 'ex-4-1',
        type: 'find-image',
        templateName: 'npcs/target-npc.png',
        storeResultIn: 'npcLocation',
        description: 'Find the NPC',
      },
      {
        id: 'ex-4-2',
        type: 'click',
        target: { type: 'variable', variableName: 'npcLocation' },
        description: 'Click on NPC',
        delayAfter: 500,
      },
      {
        id: 'ex-4-3',
        type: 'wait-for-image',
        templateName: 'ui/dialog-box.png',
        timeout: 3000,
        description: 'Wait for dialog',
      },
      {
        id: 'ex-4-4',
        type: 'click',
        target: { type: 'image', templateName: 'ui/dialog-option-1.png' },
        description: 'Select first option',
        delayAfter: 300,
      },
      {
        id: 'ex-4-5',
        type: 'wait',
        duration: 500,
        description: 'Wait for response',
      },
      {
        id: 'ex-4-6',
        type: 'click',
        target: { type: 'image', templateName: 'ui/dialog-close.png' },
        description: 'Close dialog',
        continueOnError: true,
      },
    ],
    runCount: 0,
  },
];
