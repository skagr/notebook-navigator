/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */
import { TFile } from 'obsidian';
import { deriveFileMetadata } from './pathMetadata';

/**
 * Creates a TFile stub with path-derived metadata for unit tests.
 */
export function createTestTFile(path: string): TFile {
    const file = new TFile();
    file.path = path;

    const metadata = deriveFileMetadata(path);
    file.name = metadata.name;
    file.basename = metadata.basename;
    file.extension = metadata.extension;

    return file;
}
