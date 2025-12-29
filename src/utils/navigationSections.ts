/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { DEFAULT_NAVIGATION_SECTION_ORDER, NavigationSectionId } from '../types';

// Set of valid navigation section identifiers for quick lookup
const NAVIGATION_SECTION_VALUES = new Set<NavigationSectionId>(DEFAULT_NAVIGATION_SECTION_ORDER);

// Returns a valid NavigationSectionId when input matches a known identifier, otherwise null
function coerceNavigationSectionId(value: unknown): NavigationSectionId | null {
    if (typeof value !== 'string') {
        return null;
    }

    if (NAVIGATION_SECTION_VALUES.has(value as NavigationSectionId)) {
        return value as NavigationSectionId;
    }

    return null;
}

// Ensures all navigation sections are present in the order array and removes duplicates
export function sanitizeNavigationSectionOrder(order: NavigationSectionId[]): NavigationSectionId[] {
    const seen = new Set<NavigationSectionId>();
    const normalized: NavigationSectionId[] = [];

    // Process existing order, filtering out duplicates and invalid values
    order.forEach(identifier => {
        if (!NAVIGATION_SECTION_VALUES.has(identifier)) {
            return;
        }
        if (seen.has(identifier)) {
            return;
        }
        seen.add(identifier);
        normalized.push(identifier);
    });

    // Add any missing sections from the default order to maintain completeness
    DEFAULT_NAVIGATION_SECTION_ORDER.forEach(identifier => {
        if (seen.has(identifier)) {
            return;
        }
        seen.add(identifier);
        normalized.push(identifier);
    });

    return normalized;
}

// Validates and normalizes user input for navigation section order from local storage
export function normalizeNavigationSectionOrderInput(input: unknown): NavigationSectionId[] {
    if (!Array.isArray(input)) {
        return [...DEFAULT_NAVIGATION_SECTION_ORDER];
    }

    const parsed = input.map(coerceNavigationSectionId).filter((identifier): identifier is NavigationSectionId => Boolean(identifier));
    return sanitizeNavigationSectionOrder(parsed);
}

// Merges newly ordered keys with the previous order, maintaining any sections not in orderedKeys
export function mergeNavigationSectionOrder(orderedKeys: string[], previous: NavigationSectionId[]): NavigationSectionId[] {
    const merged: NavigationSectionId[] = [];
    const seen = new Set<NavigationSectionId>();

    orderedKeys.forEach(key => {
        const identifier = coerceNavigationSectionId(key);
        if (!identifier) {
            return;
        }
        if (seen.has(identifier)) {
            return;
        }
        seen.add(identifier);
        merged.push(identifier);
    });

    previous.forEach(identifier => {
        if (seen.has(identifier)) {
            return;
        }
        seen.add(identifier);
        merged.push(identifier);
    });

    return sanitizeNavigationSectionOrder(merged);
}
