/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { TFile } from 'obsidian';
import { TagFileMutations } from './TagFileMutations';

/**
 * Handles batch tag operations on multiple files
 */
export class TagBatchOperations {
    constructor(private readonly fileMutations: TagFileMutations) {}

    /**
     * Adds a tag to multiple files
     * Skips non-markdown files and files that already have the tag or its ancestor
     */
    async addTagToFiles(tag: string, files: TFile[]): Promise<{ added: number; skipped: number }> {
        let added = 0;
        let skipped = 0;

        for (const file of files) {
            if (!this.fileMutations.isMarkdownFile(file)) {
                skipped++;
                continue;
            }

            if (await this.fileMutations.fileHasTagOrAncestor(file, tag)) {
                skipped++;
                continue;
            }

            await this.fileMutations.addTagToFile(file, tag);
            added++;
        }

        return { added, skipped };
    }

    /**
     * Removes a specific tag from multiple files
     * Returns count of files where the tag was actually removed
     */
    async removeTagFromFiles(tag: string, files: TFile[]): Promise<number> {
        let removed = 0;

        for (const file of files) {
            if (!this.fileMutations.isMarkdownFile(file)) {
                continue;
            }

            if (await this.fileMutations.removeTagFromFile(file, tag)) {
                removed++;
            }
        }

        return removed;
    }

    /**
     * Removes all tags from multiple files
     * Returns count of files where tags were actually removed
     */
    async clearAllTagsFromFiles(files: TFile[]): Promise<number> {
        let cleared = 0;

        for (const file of files) {
            if (!this.fileMutations.isMarkdownFile(file)) {
                continue;
            }

            if (await this.fileMutations.clearAllTagsFromFile(file)) {
                cleared++;
            }
        }

        return cleared;
    }

    /**
     * Collects all unique tags from multiple files
     * Returns sorted array of tag strings without # prefix
     */
    getTagsFromFiles(files: TFile[]): string[] {
        return this.fileMutations.getTagsFromFiles(files);
    }
}
