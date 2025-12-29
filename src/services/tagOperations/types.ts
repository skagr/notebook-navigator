/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { TagDescriptor } from '../tagRename/TagRenameEngine';

export interface TagRenameEventPayload {
    /** Original tag path without # prefix (preserves casing) */
    oldPath: string;
    /** New tag path without # prefix (preserves casing) */
    newPath: string;
    /** Original canonical lowercase tag path */
    oldCanonicalPath: string;
    /** New canonical lowercase tag path */
    newCanonicalPath: string;
    /** Indicates if rename merged into an existing tag */
    mergedIntoExisting: boolean;
}

export interface TagDeleteEventPayload {
    /** Deleted tag path without # prefix (preserves casing) */
    path: string;
    /** Deleted canonical lowercase tag path */
    canonicalPath: string;
}

export interface TagUsageSummary {
    total: number;
    sample: string[];
}

export interface TagPreviewCollector {
    collectPreviewPaths(tag: TagDescriptor): string[] | null;
}
