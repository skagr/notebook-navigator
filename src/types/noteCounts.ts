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
 * Interface for tracking note counts in folders and tags, supporting separate counts
 * for current items and their descendants
 */
export interface NoteCountInfo {
    /** Notes stored directly on the current item */
    current: number;
    /** Notes stored under descendant items */
    descendants: number;
    /** Sum of current and descendant notes */
    total: number;
}
