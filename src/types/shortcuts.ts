/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { SearchProvider } from './search';

/**
 * Enum-like object defining all supported shortcut types
 */
export const ShortcutType = {
    FOLDER: 'folder',
    NOTE: 'note',
    SEARCH: 'search',
    TAG: 'tag'
} as const;

export type ShortcutType = (typeof ShortcutType)[keyof typeof ShortcutType];

/**
 * MIME type for drag-and-drop operations with shortcuts
 */
export const SHORTCUT_DRAG_MIME = 'application/x-notebook-shortcut';

/**
 * Shortcut pointing to a folder in the vault
 */
export interface FolderShortcut {
    type: typeof ShortcutType.FOLDER;
    path: string;
}

/**
 * Shortcut pointing to a note (file) in the vault
 */
export interface NoteShortcut {
    type: typeof ShortcutType.NOTE;
    path: string;
}

/**
 * Shortcut for a saved search query
 */
export interface SearchShortcut {
    type: typeof ShortcutType.SEARCH;
    name: string;
    query: string;
    provider: SearchProvider;
}

/**
 * Shortcut pointing to a tag
 */
export interface TagShortcut {
    type: typeof ShortcutType.TAG;
    tagPath: string;
}

/**
 * Union type of all possible shortcut types
 */
export type ShortcutEntry = FolderShortcut | NoteShortcut | SearchShortcut | TagShortcut;

/**
 * Type guard to check if a shortcut is a folder shortcut
 */
export function isFolderShortcut(shortcut: ShortcutEntry): shortcut is FolderShortcut {
    return shortcut.type === ShortcutType.FOLDER;
}

/**
 * Type guard to check if a shortcut is a note shortcut
 */
export function isNoteShortcut(shortcut: ShortcutEntry): shortcut is NoteShortcut {
    return shortcut.type === ShortcutType.NOTE;
}

/**
 * Type guard to check if a shortcut is a search shortcut
 */
export function isSearchShortcut(shortcut: ShortcutEntry): shortcut is SearchShortcut {
    return shortcut.type === ShortcutType.SEARCH;
}

/**
 * Type guard to check if a shortcut is a tag shortcut
 */
export function isTagShortcut(shortcut: ShortcutEntry): shortcut is TagShortcut {
    return shortcut.type === ShortcutType.TAG;
}

/**
 * Returns a deterministic key for the provided shortcut.
 * Keys are used to identify shortcuts without storing separate IDs.
 */
export function getShortcutKey(shortcut: ShortcutEntry): string {
    if (isFolderShortcut(shortcut)) {
        return `${ShortcutType.FOLDER}:${shortcut.path}`;
    }

    if (isNoteShortcut(shortcut)) {
        return `${ShortcutType.NOTE}:${shortcut.path}`;
    }

    if (isTagShortcut(shortcut)) {
        return `${ShortcutType.TAG}:${shortcut.tagPath}`;
    }

    if (isSearchShortcut(shortcut)) {
        return `${ShortcutType.SEARCH}:${shortcut.name.toLowerCase()}`;
    }

    // Exhaustive check - ensures compiler warns if new shortcut type is added
    return assertNever(shortcut);
}

// Safely converts a value to string for error messages, handling JSON serialization failures
function describeShortcut(value: never): string {
    if (typeof value === 'object' && value !== null) {
        try {
            return JSON.stringify(value);
        } catch {
            return '[object Object]';
        }
    }
    return String(value);
}

// Exhaustive type check helper that throws with descriptive error message
function assertNever(value: never): never {
    throw new Error(`Unsupported shortcut type: ${describeShortcut(value)}`);
}
