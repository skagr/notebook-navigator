/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

/**
 * Style data that can be copied and pasted between items
 */
export interface StyleClipboardData {
    icon?: string;
    color?: string;
    background?: string;
}

/**
 * Wrapper for clipboard data storage
 */
export interface StyleClipboardEntry {
    data: StyleClipboardData;
}

/** In-memory clipboard storage shared across all context menus */
let sharedClipboard: StyleClipboardEntry | null = null;

/**
 * Checks if the style data contains any values
 */
export function hasStyleData(data: StyleClipboardData): boolean {
    return Boolean(data.icon || data.color || data.background);
}

/**
 * Copies style data to the shared clipboard
 */
export function copyStyleToClipboard(data: StyleClipboardData): void {
    if (!hasStyleData(data)) {
        return;
    }

    sharedClipboard = {
        data
    };
}

/**
 * Retrieves the current style clipboard contents
 */
export function getStyleClipboard(): StyleClipboardEntry | null {
    return sharedClipboard;
}
