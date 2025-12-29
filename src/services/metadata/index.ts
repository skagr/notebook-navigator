/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

export type { EntityType } from './BaseMetadataService';
export { FolderMetadataService } from './FolderMetadataService';
export { TagMetadataService } from './TagMetadataService';
export { FileMetadataService, type FileMetadataMigrationResult } from './FileMetadataService';
export { NavigationSeparatorService } from './NavigationSeparatorService';
