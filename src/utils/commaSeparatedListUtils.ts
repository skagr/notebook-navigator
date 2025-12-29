/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

const commaSeparatedListCache = new Map<string, readonly string[]>();
const EMPTY_COMMA_SEPARATED_LIST = Object.freeze<string[]>([]);

export function parseCommaSeparatedList(value: string): string[] {
    return value
        .split(',')
        .map(field => field.trim())
        .filter(field => field.length > 0);
}

export function formatCommaSeparatedList(values: readonly string[]): string {
    return values.join(', ');
}

export function normalizeCommaSeparatedList(value: string): string {
    return formatCommaSeparatedList(parseCommaSeparatedList(value));
}

export function getCachedCommaSeparatedList(value: string): readonly string[] {
    const cached = commaSeparatedListCache.get(value);
    if (cached) {
        return cached;
    }

    const parsed = parseCommaSeparatedList(value);
    const result = parsed.length > 0 ? parsed : EMPTY_COMMA_SEPARATED_LIST;
    commaSeparatedListCache.set(value, result);
    return result;
}
