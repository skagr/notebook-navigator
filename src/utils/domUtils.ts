/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

// src/utils/domUtils.ts

/**
 * Gets the path from a DOM element with a specific data attribute.
 * Useful for drag and drop operations that use different data attributes.
 *
 * @param element - The DOM element to check
 * @param attribute - The data attribute name (e.g., 'data-drag-path')
 * @returns The path string if found, null otherwise
 */
export function getPathFromDataAttribute(element: HTMLElement | null, attribute: string): string | null {
    return element?.getAttribute(attribute) ?? null;
}

/**
 * Checks if the user is currently typing in an input field.
 * Used to prevent keyboard shortcuts from firing while typing.
 *
 * @param e - The keyboard event
 * @returns True if typing in an input field, false otherwise
 */
export function isTypingInInput(e: KeyboardEvent): boolean {
    const target = e.target as HTMLElement;
    return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
}
