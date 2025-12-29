/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

export interface FrontmatterTagField {
    key: string;
    lowerKey: string;
    isAlias: boolean;
    value: string | unknown[];
    set(nextValue: string | unknown[]): void;
    remove(): void;
}

export type FrontmatterTagMutator = (field: FrontmatterTagField) => void;

/**
 * Visits all frontmatter fields that may store tags or tag aliases.
 * Provides helpers to update or remove values without duplicating traversal logic.
 *
 * @param frontmatter - The YAML frontmatter object supplied by Obsidian
 * @param mutator - Called for each tag/alias field with helpers to mutate the value
 * @returns True when any field was changed
 */
export function mutateFrontmatterTagFields(frontmatter: Record<string, unknown>, mutator: FrontmatterTagMutator): boolean {
    let changed = false;

    // Creates field descriptor with set/remove helpers and invokes the mutator
    const mutateValue = (key: string, lowerKey: string, current: string | unknown[]) => {
        const field: FrontmatterTagField = {
            key,
            lowerKey,
            isAlias: lowerKey === 'aliases' || lowerKey === 'alias',
            value: current,
            set: (nextValue: string | unknown[]) => {
                const existing = frontmatter[key];
                if (Array.isArray(existing) && Array.isArray(nextValue)) {
                    if (existing.length === nextValue.length && existing.every((entry, index) => entry === nextValue[index])) {
                        return;
                    }
                } else if (existing === nextValue) {
                    return;
                }
                frontmatter[key] = nextValue;
                changed = true;
            },
            remove: () => {
                if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
                    delete frontmatter[key];
                    changed = true;
                }
            }
        };

        mutator(field);
    };

    for (const key of Object.keys(frontmatter)) {
        const value = frontmatter[key];
        if (typeof value !== 'string' && !Array.isArray(value)) {
            continue;
        }

        const lowerKey = key.toLowerCase();
        if (lowerKey === 'tags' || lowerKey === 'tag' || lowerKey === 'aliases' || lowerKey === 'alias') {
            mutateValue(key, lowerKey, value);
        }
    }

    return changed;
}
