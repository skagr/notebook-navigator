/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { App } from 'obsidian';
import { TFile } from 'obsidian';
import type { TagTreeService } from '../TagTreeService';
import type { RenameFile, TagDescriptor } from '../tagRename/TagRenameEngine';
import type { TagUsageSummary } from './types';
import { normalizeTagPathValue } from '../../utils/tagPrefixMatcher';

/**
 * Yields control back to the event loop to prevent blocking UI during batch operations
 * Uses requestAnimationFrame when available for smoother UI updates
 */
export async function yieldToEventLoop(): Promise<void> {
    await new Promise<void>(resolve => {
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => resolve());
            return;
        }
        setTimeout(resolve, 0);
    });
}

/**
 * Collects all file paths that contain the specified tag
 * Returns null if tag tree service is unavailable
 */
export function collectPreviewPaths(tag: TagDescriptor, tagTreeService: TagTreeService | null): string[] | null {
    if (tag.canonicalName.length === 0) {
        return [];
    }
    if (!tagTreeService) {
        return null;
    }
    return tagTreeService.collectTagFilePaths(tag.canonicalName);
}

/**
 * Builds a usage summary from file paths
 * Limits sample to 8 files for display in modals
 */
export function buildUsageSummaryFromPaths(app: App, paths: Iterable<string>): TagUsageSummary {
    const sample: string[] = [];
    let total = 0;

    for (const filePath of paths) {
        total += 1;
        if (sample.length >= 8) {
            continue;
        }
        const abstractFile = app.vault.getAbstractFileByPath(filePath);
        if (abstractFile instanceof TFile) {
            sample.push(abstractFile.basename);
        } else {
            sample.push(filePath);
        }
    }

    return { total, sample };
}

/**
 * Builds a usage summary from rename target files
 * Wrapper for buildUsageSummaryFromPaths
 */
export function buildUsageSummary(app: App, targets: RenameFile[]): TagUsageSummary {
    return buildUsageSummaryFromPaths(
        app,
        targets.map(target => target.filePath)
    );
}

/**
 * Resolves canonical tag path to its display path using the tag tree
 * Returns original path if tag tree is unavailable or tag not found
 */
export function resolveDisplayTagPath(tagPath: string, tagTreeService: TagTreeService | null): string {
    const canonical = normalizeTagPathValue(tagPath);
    if (canonical.length === 0) {
        return tagPath;
    }
    if (!tagTreeService) {
        return tagPath;
    }
    const node = tagTreeService.findTagNode(canonical);
    return node?.displayPath ?? tagPath;
}
