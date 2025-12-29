/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */
import { describe, expect, it } from 'vitest';
import { FeatureImageBlobCache } from '../../src/storage/FeatureImageBlobCache';

describe('FeatureImageBlobCache', () => {
    it('evicts least recently used entries by count', () => {
        const cache = new FeatureImageBlobCache(2);
        const blobA = new Blob(['a']);
        const blobB = new Blob(['b']);
        const blobC = new Blob(['c']);

        // Fill the cache to its maximum entry count.
        cache.set('a', { featureImageKey: 'k1', blob: blobA });
        cache.set('b', { featureImageKey: 'k2', blob: blobB });
        // Touch a so b is least recent.
        expect(cache.get('a', 'k1')).toBe(blobA);

        // Insert a third entry and expect the least-recent entry to be evicted.
        cache.set('c', { featureImageKey: 'k3', blob: blobC });

        expect(cache.get('b', 'k2')).toBeNull();
        expect(cache.get('a', 'k1')).toBe(blobA);
        expect(cache.get('c', 'k3')).toBe(blobC);
    });

    it('returns null and removes entries when key mismatches', () => {
        const cache = new FeatureImageBlobCache(1);
        const blob = new Blob(['x']);

        cache.set('path', { featureImageKey: 'key-1', blob });

        // Key mismatch returns null and removes the stale entry.
        expect(cache.get('path', 'key-2')).toBeNull();
        expect(cache.getEntryCount()).toBe(0);
    });
});
