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
 * Removes a trailing slash from a path unless it is the vault root.
 */
export function stripTrailingSlash(path: string): string {
    if (path === '/') {
        return path;
    }
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * Returns the final segment of a path after trimming trailing slashes.
 */
export function getPathBaseName(path: string): string {
    const trimmed = stripTrailingSlash(path);
    if (!trimmed) {
        return '';
    }

    const segments = trimmed.split('/').filter(Boolean);
    if (segments.length === 0) {
        return trimmed || '/';
    }

    return segments[segments.length - 1];
}

/**
 * Checks whether the candidate path is the folder itself or within the folder hierarchy.
 */
export function doesFolderContainPath(folderPath: string, candidatePath: string): boolean {
    if (folderPath === '/') {
        return true;
    }
    if (folderPath === candidatePath) {
        return true;
    }
    const normalizedFolderPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    return candidatePath.startsWith(normalizedFolderPath);
}
