/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { TAbstractFile, TFile } from 'obsidian';

/**
 * Set of file extensions supported as homepage files
 * Includes Markdown, Canvas, and Excalidraw files
 */
const SUPPORTED_EXTENSIONS = new Set(['md', 'canvas', 'base']);

/**
 * Checks if a file extension is supported as a homepage target
 * @param extension - The file extension to check (without the dot)
 * @returns True if the extension is supported for homepage use
 */
export function isSupportedHomepageExtension(extension: string): boolean {
    return SUPPORTED_EXTENSIONS.has(extension.toLowerCase());
}

/**
 * Type guard that checks if an abstract file is a valid homepage file
 * Ensures the file is a TFile instance and has a supported extension
 * @param file - The file to check, can be null
 * @returns True if the file is a valid homepage file
 */
export function isSupportedHomepageFile(file: TAbstractFile | null): file is TFile {
    return file instanceof TFile && isSupportedHomepageExtension(file.extension);
}
