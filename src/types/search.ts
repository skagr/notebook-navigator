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
 * Search providers supported by Notebook Navigator.
 */
export type SearchProvider = 'internal' | 'omnisearch';

/**
 * Individual match returned by search providers that support excerpts (e.g., Omnisearch).
 */
export interface SearchResultMatch {
    offset: number;
    length: number;
    text: string;
}

/**
 * Metadata captured for search results when using external providers.
 */
export interface SearchResultMeta {
    score: number;
    terms: string[];
    matches: SearchResultMatch[];
    excerpt?: string;
}

/**
 * Captures tag-related filters derived from the search query.
 * Used to highlight matching tags inside the navigation tree.
 */
export interface SearchTagFilterState {
    include: string[];
    exclude: string[];
    excludeTagged: boolean;
    includeUntagged: boolean;
    requireTagged: boolean;
}

export const EMPTY_SEARCH_TAG_FILTER_STATE: SearchTagFilterState = {
    include: [],
    exclude: [],
    excludeTagged: false,
    includeUntagged: false,
    requireTagged: false
};
