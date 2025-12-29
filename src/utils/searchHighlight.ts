/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

export type SearchMatchState = 'include' | 'exclude';

// Internal constants not exported to prevent unused exports
const SEARCH_MATCH_INCLUDE_CLASS = 'nn-navitem-content--search-include';
const SEARCH_MATCH_EXCLUDE_CLASS = 'nn-navitem-content--search-exclude';

/**
 * Build the class name for navigation item content that may be search-highlighted.
 * Ensures include/exclude styling remains consistent across components.
 */
export function buildSearchMatchContentClass(baseClasses: readonly string[], searchMatch?: SearchMatchState): string {
    const classes = [...baseClasses];

    if (searchMatch === 'include') {
        classes.push(SEARCH_MATCH_INCLUDE_CLASS);
    } else if (searchMatch === 'exclude') {
        classes.push(SEARCH_MATCH_EXCLUDE_CLASS);
    }

    return classes.join(' ');
}
