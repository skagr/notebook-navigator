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
import type { ISettingsProvider } from '../interfaces/ISettingsProvider';
import { DEFAULT_SETTINGS } from '../settings';

/**
 * Manages the recent notes list stored in vault-local storage
 */
export class RecentNotesService {
    constructor(private readonly settingsProvider: ISettingsProvider) {}

    /**
     * Updates recents when a file is opened
     * @returns true when the list changed
     */
    recordFileOpen(file: TFile): boolean {
        const path = file.path;
        const current = this.settingsProvider.getRecentNotes();
        const filtered = current.filter(entry => entry !== path);
        filtered.unshift(path);

        const limit = this.getLimit();
        if (filtered.length > limit) {
            filtered.length = limit;
        }

        const changed = filtered.length !== current.length || filtered.some((value, index) => value !== current[index]);
        if (!changed) {
            return false;
        }

        this.settingsProvider.setRecentNotes(filtered);
        return true;
    }

    /**
     * Updates recents when a file path changes
     * @returns true when the list changed
     */
    renameEntry(oldPath: string, newPath: string): boolean {
        const current = this.settingsProvider.getRecentNotes();
        if (current.length === 0) {
            return false;
        }

        const limit = this.getLimit();
        const updated: string[] = [];
        const seen = new Set<string>();
        let changed = false;

        for (const entry of current) {
            const candidate = entry === oldPath ? newPath : entry;
            if (candidate !== entry) {
                changed = true;
            }

            if (!candidate) {
                changed = true;
                continue;
            }

            if (seen.has(candidate)) {
                changed = true;
                continue;
            }

            seen.add(candidate);
            updated.push(candidate);
        }

        if (updated.length > limit) {
            updated.length = limit;
            changed = true;
        }

        if (!changed) {
            return false;
        }

        this.settingsProvider.setRecentNotes(updated);
        return true;
    }

    /**
     * Removes entries for deleted files
     * @returns true when the list changed
     */
    removeEntry(path: string): boolean {
        if (!path) {
            return false;
        }

        const current = this.settingsProvider.getRecentNotes();
        if (current.length === 0) {
            return false;
        }

        const filtered = current.filter(entry => entry !== path);
        if (filtered.length === current.length) {
            return false;
        }

        this.settingsProvider.setRecentNotes(filtered);
        return true;
    }

    private getLimit(): number {
        const { recentNotesCount } = this.settingsProvider.settings;
        const limit = typeof recentNotesCount === 'number' ? recentNotesCount : DEFAULT_SETTINGS.recentNotesCount;
        return Math.max(1, limit);
    }
}
