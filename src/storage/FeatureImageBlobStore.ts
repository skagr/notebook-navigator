/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { FeatureImageBlobCache } from './FeatureImageBlobCache';
import type { FeatureImageStatus } from './IndexedDBStorage';

// Blob store for feature image thumbnails keyed by file path.
export const FEATURE_IMAGE_STORE_NAME = 'featureImageBlobs';
// Default in-memory LRU capacity for feature image blobs.
export const DEFAULT_FEATURE_IMAGE_CACHE_MAX = 1000;

export interface FeatureImageBlobRecord {
    featureImageKey: string;
    blob: Blob;
}

export interface FeatureImageChangeSet {
    featureImageKey?: string | null;
    featureImageStatus?: FeatureImageStatus;
}

export function computeFeatureImageMutation(params: {
    existingKey: string | null;
    existingStatus: FeatureImageStatus;
    featureImageKey?: string | null;
    featureImage?: Blob | null;
}): {
    nextKey: string | null;
    nextStatus: FeatureImageStatus;
    changes: FeatureImageChangeSet;
    blobUpdate: FeatureImageBlobRecord | null;
    shouldDeleteBlob: boolean;
    shouldClearCache: boolean;
} {
    // Feature images are tracked as:
    // - Main store: `featureImageKey` + `featureImageStatus` (no blob data)
    // - Blob store: `{ featureImageKey, blob }` keyed by path
    //
    // Normalized rules:
    // - A non-empty blob requires a non-empty key; otherwise it is dropped.
    // - Empty blobs are treated as "processed but no thumbnail" and are not persisted.
    // - Any key change invalidates any stored blob for that path.
    const changes: FeatureImageChangeSet = {};
    let nextKey = params.existingKey;
    let nextStatus = params.existingStatus;
    let blobUpdate: FeatureImageBlobRecord | null = null;
    let shouldDeleteBlob = false;
    let shouldClearCache = false;

    const featureImageKeyProvided = params.featureImageKey !== undefined;
    if (featureImageKeyProvided) {
        const requestedKey = params.featureImageKey ?? null;
        if (requestedKey !== params.existingKey) {
            nextKey = requestedKey;
            nextStatus = nextKey === null ? 'unprocessed' : 'none';
            changes.featureImageKey = nextKey;
            changes.featureImageStatus = nextStatus;
            shouldDeleteBlob = true;
            shouldClearCache = true;
        }
    }

    const featureImageProvided = params.featureImage !== undefined;
    if (featureImageProvided) {
        // Any feature image blob update invalidates the in-memory LRU entry for this path.
        shouldClearCache = true;
        const blob = params.featureImage;
        if (blob instanceof Blob && blob.size > 0 && nextKey !== null && nextKey !== '') {
            blobUpdate = { featureImageKey: nextKey, blob };
            nextStatus = 'has';
            changes.featureImageStatus = 'has';
            shouldDeleteBlob = false;
        } else {
            blobUpdate = null;
            shouldDeleteBlob = true;
            nextStatus = nextKey === null ? 'unprocessed' : 'none';
            changes.featureImageStatus = nextStatus;
        }
    }

    return { nextKey, nextStatus, changes, blobUpdate, shouldDeleteBlob, shouldClearCache };
}

/**
 * FeatureImageBlobStore - Dedicated IndexedDB store helper with an in-memory LRU.
 */
export class FeatureImageBlobStore {
    private readonly cache: FeatureImageBlobCache;
    private inFlight = new Map<string, Promise<Blob | null>>();

    constructor(maxEntries: number) {
        this.cache = new FeatureImageBlobCache(maxEntries);
    }

    clearMemoryCaches(): void {
        this.cache.clear();
        this.inFlight.clear();
    }

    deleteFromCache(path: string): void {
        this.cache.delete(path);
        this.dropInFlightForPath(path);
    }

    moveCacheEntry(oldPath: string, newPath: string): void {
        this.cache.move(oldPath, newPath);
        this.dropInFlightForPath(oldPath);
        this.dropInFlightForPath(newPath);
    }

    async getBlob(db: IDBDatabase, path: string, expectedKey: string): Promise<Blob | null> {
        if (!expectedKey) {
            return null;
        }

        const cached = this.cache.get(path, expectedKey);
        if (cached) {
            return cached;
        }

        const requestKey = `${path}|${expectedKey}`;
        const inFlight = this.inFlight.get(requestKey);
        if (inFlight) {
            return inFlight;
        }

        const request = this.readBlobFromStore(db, path, expectedKey)
            .then(blob => {
                if (blob) {
                    this.cache.set(path, { featureImageKey: expectedKey, blob });
                }
                return blob;
            })
            .finally(() => {
                this.inFlight.delete(requestKey);
            });

        this.inFlight.set(requestKey, request);
        return request;
    }

    async forEachBlobRecord(db: IDBDatabase, callback: (path: string, record: FeatureImageBlobRecord) => void): Promise<void> {
        const transaction = db.transaction([FEATURE_IMAGE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const op = 'forEachBlobRecord';
        let lastRequestError: DOMException | Error | null = null;

        await new Promise<void>((resolve, reject) => {
            const request = store.openCursor();
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor) {
                    return;
                }

                if (typeof cursor.key !== 'string') {
                    cursor.continue();
                    return;
                }

                const path = cursor.key;
                const record = cursor.value as FeatureImageBlobRecord | undefined;
                if (record && typeof record.featureImageKey === 'string' && record.blob instanceof Blob && record.blob.size > 0) {
                    try {
                        callback(path, record);
                    } catch (error: unknown) {
                        console.error('[IndexedDB] callback failed', { store: FEATURE_IMAGE_STORE_NAME, op, path, error });
                    }
                }

                cursor.continue();
            };
            request.onerror = () => {
                lastRequestError = request.error || null;
                console.error('[IndexedDB] openCursor failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    name: request.error?.name,
                    message: request.error?.message
                });
                reject(request.error ?? new Error('Cursor request failed'));
            };
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction aborted'));
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction error'));
            };
        });
    }

    async moveBlob(db: IDBDatabase, oldPath: string, newPath: string): Promise<void> {
        const transaction = db.transaction([FEATURE_IMAGE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        let hasRecord = false;
        const op = 'moveFeatureImageBlob';
        let lastRequestError: DOMException | Error | null = null;

        await new Promise<void>((resolve, reject) => {
            const getReq = store.get(oldPath);
            getReq.onsuccess = () => {
                const record = getReq.result as FeatureImageBlobRecord | undefined;
                if (!record) {
                    return;
                }
                hasRecord = true;
                const putReq = store.put(record, newPath);
                putReq.onerror = () => {
                    lastRequestError = putReq.error || null;
                    console.error('[IndexedDB] put failed', {
                        store: FEATURE_IMAGE_STORE_NAME,
                        op,
                        path: newPath,
                        name: putReq.error?.name,
                        message: putReq.error?.message
                    });
                };
                const deleteReq = store.delete(oldPath);
                deleteReq.onerror = () => {
                    lastRequestError = deleteReq.error || null;
                    console.error('[IndexedDB] delete failed', {
                        store: FEATURE_IMAGE_STORE_NAME,
                        op,
                        path: oldPath,
                        name: deleteReq.error?.name,
                        message: deleteReq.error?.message
                    });
                };
            };
            getReq.onerror = () => {
                lastRequestError = getReq.error || null;
                console.error('[IndexedDB] get failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    path: oldPath,
                    name: getReq.error?.name,
                    message: getReq.error?.message
                });
                try {
                    transaction.abort();
                } catch (e) {
                    void e;
                }
            };
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction aborted'));
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction error'));
            };
        });

        if (hasRecord) {
            this.moveCacheEntry(oldPath, newPath);
        } else {
            this.deleteFromCache(oldPath);
        }
    }

    async deleteBlob(db: IDBDatabase, path: string): Promise<void> {
        const transaction = db.transaction([FEATURE_IMAGE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const op = 'deleteFeatureImageBlob';
        let lastRequestError: DOMException | Error | null = null;

        await new Promise<void>((resolve, reject) => {
            const deleteReq = store.delete(path);
            deleteReq.onerror = () => {
                lastRequestError = deleteReq.error || null;
                console.error('[IndexedDB] delete failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    path,
                    name: deleteReq.error?.name,
                    message: deleteReq.error?.message
                });
            };
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => {
                console.error('[IndexedDB] transaction aborted', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction aborted'));
            };
            transaction.onerror = () => {
                console.error('[IndexedDB] transaction error', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    txError: transaction.error?.message,
                    reqError: lastRequestError?.message
                });
                reject(transaction.error || lastRequestError || new Error('Transaction error'));
            };
        });

        this.deleteFromCache(path);
    }

    private async readBlobFromStore(db: IDBDatabase, path: string, expectedKey: string): Promise<Blob | null> {
        const transaction = db.transaction([FEATURE_IMAGE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(FEATURE_IMAGE_STORE_NAME);
        const op = 'getFeatureImageBlob';

        return new Promise(resolve => {
            const request = store.get(path);
            request.onsuccess = () => {
                const record = request.result as FeatureImageBlobRecord | undefined;
                if (!record || record.featureImageKey !== expectedKey || !(record.blob instanceof Blob) || record.blob.size === 0) {
                    resolve(null);
                    return;
                }
                resolve(record.blob);
            };
            request.onerror = () => {
                console.error('[IndexedDB] get failed', {
                    store: FEATURE_IMAGE_STORE_NAME,
                    op,
                    path,
                    name: request.error?.name,
                    message: request.error?.message
                });
                resolve(null);
            };
        });
    }

    private dropInFlightForPath(path: string): void {
        const prefix = `${path}|`;
        for (const key of this.inFlight.keys()) {
            if (key === prefix || key.startsWith(prefix)) {
                this.inFlight.delete(key);
            }
        }
    }
}
