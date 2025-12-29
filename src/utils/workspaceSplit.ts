/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { App, WorkspaceLeaf } from 'obsidian';

export type SplitLocation = 'main' | 'left-sidebar' | 'right-sidebar' | 'unknown';

// Checks if a value is a non-null object
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

// Type guard for objects that expose a parent reference used in workspace tree
function hasParentRef(value: unknown): value is { parent?: unknown } {
    return isObject(value) && 'parent' in value;
}

/**
 * Determines the split location for a given leaf by walking its parent tree
 * and comparing against the workspace's root, left, and right splits.
 *
 * @param app - The Obsidian App instance
 * @param leaf - The WorkspaceLeaf to inspect
 * @returns Split location identifier
 */
export function getLeafSplitLocation(app: App, leaf: WorkspaceLeaf | null): SplitLocation {
    if (!leaf) return 'unknown';

    let current: unknown = leaf.parent;

    // Walk up the workspace item tree to find the top-level split
    while (current) {
        if (current === app.workspace.rootSplit) {
            return 'main';
        }
        if (current === app.workspace.leftSplit) {
            return 'left-sidebar';
        }
        if (current === app.workspace.rightSplit) {
            return 'right-sidebar';
        }

        if (!hasParentRef(current)) break;
        current = current.parent;
    }

    return 'unknown';
}
