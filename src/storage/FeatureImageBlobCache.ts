/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

export interface FeatureImageBlobEntry {
    featureImageKey: string;
    blob: Blob;
}

/**
 * FeatureImageBlobCache - LRU cache keyed by file path.
 *
 * Stores a bounded number of feature image blobs in memory.
 */
export class FeatureImageBlobCache {
    // Map preserves insertion order; oldest entries appear first.
    private entries = new Map<string, FeatureImageBlobEntry>();
    // Maximum number of cached entries retained in memory.
    private maxEntries: number;

    constructor(maxEntries: number) {
        // Clamp to a non-negative size to keep the cache bounded.
        this.maxEntries = Math.max(0, maxEntries);
    }

    get(path: string, expectedKey: string): Blob | null {
        const entry = this.entries.get(path);
        if (!entry) {
            return null;
        }
        if (entry.featureImageKey !== expectedKey) {
            // Drop stale entries when the key no longer matches.
            this.entries.delete(path);
            return null;
        }
        // Refresh LRU order by re-inserting the entry.
        this.entries.delete(path);
        this.entries.set(path, entry);
        return entry.blob;
    }

    set(path: string, entry: FeatureImageBlobEntry): void {
        // Skip inserts when the cache is disabled.
        if (this.maxEntries === 0) {
            return;
        }
        // Replace existing entries so the newest insert is most recent.
        if (this.entries.has(path)) {
            this.entries.delete(path);
        }
        this.entries.set(path, entry);
        this.evictIfNeeded();
    }

    delete(path: string): void {
        // Remove any cached entry for the path.
        this.entries.delete(path);
    }

    move(oldPath: string, newPath: string): void {
        const entry = this.entries.get(oldPath);
        if (!entry) {
            return;
        }
        // Preserve the entry while updating its key.
        this.entries.delete(oldPath);
        this.entries.set(newPath, entry);
        this.evictIfNeeded();
    }

    clear(): void {
        // Remove all cached entries.
        this.entries.clear();
    }

    getEntryCount(): number {
        // Expose current entry count for cache stats or tests.
        return this.entries.size;
    }

    private evictIfNeeded(): void {
        // Evict oldest entries until the cache fits within the max size.
        while (this.entries.size > this.maxEntries) {
            const iterator = this.entries.keys();
            const first = iterator.next();
            if (first.done) {
                return;
            }
            this.entries.delete(first.value);
        }
    }
}
