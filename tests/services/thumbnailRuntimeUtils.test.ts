/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.1
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.1.
 * See the LICENSE file in the repository root.
 */

import { describe, expect, it, vi } from 'vitest';
import { createOnceLogger, createRenderBudgetLimiter } from '../../src/services/content/thumbnail/thumbnailRuntimeUtils';

describe('createOnceLogger', () => {
    it('logs a key once and evicts old keys', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const logOnce = createOnceLogger(2);

        logOnce('a', 'A');
        logOnce('a', 'A again');
        logOnce('b', 'B');
        logOnce('c', 'C');
        logOnce('a', 'A after eviction');

        expect(spy.mock.calls.map(call => call[0])).toEqual(['A', 'B', 'C', 'A after eviction']);
        spy.mockRestore();
    });
});

describe('createRenderBudgetLimiter', () => {
    async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
        let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
        const timeout = new Promise<never>((_, reject) => {
            timeoutId = globalThis.setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
        });

        try {
            return await Promise.race([promise, timeout]);
        } finally {
            if (timeoutId !== null) {
                globalThis.clearTimeout(timeoutId);
            }
        }
    }

    it('queues acquisitions when budget is exceeded', async () => {
        const limiter = createRenderBudgetLimiter(5);

        const releaseA = await limiter.acquire(3);
        expect(limiter.getActiveWeight()).toBe(3);

        let acquiredB = false;
        const acquireB = limiter.acquire(3).then(release => {
            acquiredB = true;
            return release;
        });

        await Promise.resolve();
        expect(acquiredB).toBe(false);

        releaseA();
        const releaseB = await acquireB;
        expect(acquiredB).toBe(true);
        expect(limiter.getActiveWeight()).toBe(3);

        releaseB();
        expect(limiter.getActiveWeight()).toBe(0);
    });

    it('clamps overweight acquisitions to the total budget', async () => {
        const limiter = createRenderBudgetLimiter(5);

        const releaseA = await limiter.acquire(3);
        expect(limiter.getActiveWeight()).toBe(3);

        const acquireOverweight = limiter.acquire(10);
        await Promise.resolve();
        expect(limiter.getActiveWeight()).toBe(3);

        releaseA();

        const releaseOverweight = await withTimeout(acquireOverweight, 250);
        expect(limiter.getActiveWeight()).toBe(5);

        releaseOverweight();
        expect(limiter.getActiveWeight()).toBe(0);
    });
});
