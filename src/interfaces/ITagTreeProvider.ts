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
 * Interface for providing access to tag tree paths
 * This abstraction allows services to access tag information without depending on the concrete plugin class
 */
export interface ITagTreeProvider {
    /**
     * Gets all tag paths from the tag tree
     * @returns Array of all tag paths
     */
    getAllTagPaths(): string[];
}
