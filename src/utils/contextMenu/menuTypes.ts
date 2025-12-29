/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { Menu, TFile, TFolder, App } from 'obsidian';
import { ItemType } from '../../types';
import type { VisibilityPreferences } from '../../types';
import { NotebookNavigatorSettings } from '../../settings';
import { FileSystemOperations } from '../../services/FileSystemService';
import { MetadataService } from '../../services/MetadataService';
import { TagOperations } from '../../services/TagOperations';
import { TagTreeService } from '../../services/TagTreeService';
import { CommandQueueService } from '../../services/CommandQueueService';
import { SelectionState, SelectionAction } from '../../context/SelectionContext';
import type NotebookNavigatorPlugin from '../../main';
import { ExpansionAction } from '../../context/ExpansionContext';
import { UIAction } from '../../context/UIStateContext';
import type { ShortcutsContextValue } from '../../context/ShortcutsContext';

/**
 * Configuration for the context menu
 */
// Special menu type for empty areas in the list pane
export const EMPTY_LIST_MENU_TYPE = 'empty-list' as const;

export type MenuConfig =
    | {
          type: typeof ItemType.FILE;
          item: TFile;
      }
    | {
          type: typeof ItemType.FOLDER;
          item: TFolder;
          options?: FolderMenuOptions;
      }
    | {
          type: typeof ItemType.TAG;
          item: string; // Tag path
      }
    | {
          type: typeof EMPTY_LIST_MENU_TYPE;
          item: TFolder | null;
      };

/**
 * Services available to menu builders
 */
export interface MenuServices {
    app: App;
    plugin: NotebookNavigatorPlugin;
    isMobile: boolean;
    fileSystemOps: FileSystemOperations;
    metadataService: MetadataService;
    tagOperations: TagOperations;
    tagTreeService: TagTreeService | null;
    commandQueue: CommandQueueService | null;
    shortcuts: ShortcutsContextValue | null;
    visibility: VisibilityPreferences;
}

/**
 * State values available to menu builders
 */
export interface MenuState {
    selectionState: SelectionState;
    expandedFolders: Set<string>;
    expandedTags: Set<string>;
}

/**
 * Dispatch functions available to menu builders
 */
export interface MenuDispatchers {
    selectionDispatch: (action: SelectionAction) => void;
    expansionDispatch: (action: ExpansionAction) => void;
    uiDispatch: (action: UIAction) => void;
}

/**
 * Common parameters for all menu builders
 */
export interface MenuBuilderParams {
    menu: Menu;
    services: MenuServices;
    settings: NotebookNavigatorSettings;
    state: MenuState;
    dispatchers: MenuDispatchers;
}

export interface FolderMenuOptions {
    disableNavigationSeparatorActions?: boolean;
}

export interface TagMenuOptions {
    disableNavigationSeparatorActions?: boolean;
}

/**
 * Parameters for folder menu builder
 */
export interface FolderMenuBuilderParams extends MenuBuilderParams {
    folder: TFolder;
    options?: FolderMenuOptions;
}

/**
 * Parameters for tag menu builder
 */
export interface TagMenuBuilderParams extends MenuBuilderParams {
    tagPath: string;
    options?: TagMenuOptions;
}

/**
 * Parameters for file menu builder
 */
export interface FileMenuBuilderParams extends MenuBuilderParams {
    file: TFile;
}
