/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { FolderMenuBuilderParams } from './menuTypes';
import { buildFolderCreationMenu } from './folderMenuBuilder';

/**
 * Builds the context menu for empty space inside the list pane.
 * Reuses the folder creation builder so options stay in sync with folder context menus.
 */
export function buildEmptyListMenu(params: FolderMenuBuilderParams): void {
    buildFolderCreationMenu(params);
}
