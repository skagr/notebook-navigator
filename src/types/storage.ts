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
 * Storage system type definitions
 */

/**
 * Represents a node in the hierarchical tag tree.
 * Each node contains information about a tag and its nested children.
 */
export interface TagTreeNode {
    /** The name of this part of the tag (e.g., "processing" for "inbox/processing") */
    name: string;
    /** The full path of the tag without # prefix - ALWAYS LOWERCASE for logic (e.g., "inbox/processing") */
    path: string;
    /** The canonical display path with original casing for UI (e.g., "Inbox/Processing") */
    displayPath: string;
    /** Map of child tag nodes, keyed by their lowercase name */
    children: Map<string, TagTreeNode>;
    /** Set of file paths that have this exact tag */
    notesWithTag: Set<string>;
}
