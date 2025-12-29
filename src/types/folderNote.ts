/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

export type FolderNoteType = 'markdown' | 'canvas' | 'base';

export type FolderNoteCreationPreference = FolderNoteType | 'ask';

export const FOLDER_NOTE_TYPE_EXTENSIONS: Record<FolderNoteType, string> = {
    markdown: 'md',
    canvas: 'canvas',
    base: 'base'
};

function isFolderNoteType(value: string): value is FolderNoteType {
    return value === 'markdown' || value === 'canvas' || value === 'base';
}

export function isFolderNoteCreationPreference(value: string): value is FolderNoteCreationPreference {
    return value === 'ask' || isFolderNoteType(value);
}
