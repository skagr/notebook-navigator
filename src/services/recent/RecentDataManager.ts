/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { NotebookNavigatorSettings } from '../../settings';
import type { LocalStorageKeys } from '../../types';
import { RecentStorageService } from '../RecentStorageService';

interface RecentDataManagerOptions {
    // Plugin settings containing recent data limits
    settings: NotebookNavigatorSettings;
    // Local storage keys for persisting data
    keys: LocalStorageKeys;
    // Callback invoked when recent data changes
    onRecentDataChange: () => void;
}

/**
 * Wraps RecentStorageService lifecycle so the plugin stops hosting persistence helpers.
 */
export default class RecentDataManager {
    private storage: RecentStorageService | null = null;
    private readonly options: RecentDataManagerOptions;

    constructor(options: RecentDataManagerOptions) {
        this.options = options;
    }

    /**
     * Creates a new storage service instance and loads recent data from local storage
     */
    initialize(): void {
        this.dispose();
        this.storage = new RecentStorageService({
            settings: this.options.settings,
            keys: this.options.keys,
            notifyChange: this.options.onRecentDataChange
        });
        this.storage.hydrate();
        this.options.onRecentDataChange();
    }

    /**
     * Persists pending changes and releases the storage service
     */
    dispose(): void {
        this.storage?.flushPendingPersists();
        this.storage = null;
    }

    /**
     * Returns the list of recent note paths
     */
    getRecentNotes(): string[] {
        return this.storage?.getRecentNotes() ?? [];
    }

    /**
     * Updates the list of recent note paths
     */
    setRecentNotes(recentNotes: string[]): void {
        this.storage?.setRecentNotes(recentNotes);
    }

    /**
     * Trims the recent notes list to the configured maximum count
     */
    applyRecentNotesLimit(): void {
        this.storage?.applyRecentNotesLimit();
    }

    /**
     * Returns the map of recent icon IDs per provider
     */
    getRecentIcons(): Record<string, string[]> {
        return this.storage?.getRecentIcons() ?? {};
    }

    /**
     * Updates the map of recent icon IDs per provider
     */
    setRecentIcons(recentIcons: Record<string, string[]>): void {
        this.storage?.setRecentIcons(recentIcons);
    }

    /**
     * Immediately writes any pending changes to local storage
     */
    flushPendingPersists(): void {
        this.storage?.flushPendingPersists();
    }
}
