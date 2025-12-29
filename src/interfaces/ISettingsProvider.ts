/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { NotebookNavigatorSettings } from '../settings';

/**
 * Interface for providing access to plugin settings
 * This abstraction allows services to access settings without depending on the concrete plugin class
 */
export interface ISettingsProvider {
    /**
     * Gets the current settings
     * @returns The current plugin settings
     */
    readonly settings: NotebookNavigatorSettings;

    /**
     * Saves the current settings to persistent storage and triggers UI updates
     * @returns Promise that resolves when settings are saved
     */
    saveSettingsAndUpdate(): Promise<void>;

    /**
     * Notifies listeners that settings relevant state changed without persisting
     */
    notifySettingsUpdate(): void;

    /**
     * Gets the cached list of recent notes stored outside of synced settings
     */
    getRecentNotes(): string[];

    /**
     * Persists the cached list of recent notes to vault-local storage
     * @param recentNotes - Ordered array of recent note paths
     */
    setRecentNotes(recentNotes: string[]): void;

    /**
     * Gets the cached record of recently used icons stored outside of synced settings
     */
    getRecentIcons(): Record<string, string[]>;

    /**
     * Persists the cached record of recently used icons to vault-local storage
     * @param recentIcons - Map of provider id to ordered icon id list
     */
    setRecentIcons(recentIcons: Record<string, string[]>): void;

    /**
     * Gets the cached list of recently used colors stored outside of synced settings
     */
    getRecentColors(): string[];

    /**
     * Persists the cached list of recently used colors to vault-local storage
     * @param recentColors - Ordered array of recent color values
     */
    setRecentColors(recentColors: string[]): void;
}
