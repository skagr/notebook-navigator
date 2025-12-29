/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { normalizeTagPath } from '../../utils/tagUtils';
import type { ShortcutEntry } from '../../types/shortcuts';
import { isTagShortcut } from '../../types/shortcuts';
import { mutateVaultProfileShortcuts } from '../../utils/vaultProfiles';
import type { MetadataService } from '../MetadataService';

/**
 * Handles updates to tag shortcuts when tags are renamed or deleted
 */
export class TagShortcutMutations {
    constructor(private readonly getMetadataService: () => MetadataService | null) {}

    /**
     * Updates all tag shortcuts after a tag is renamed
     * Handles both direct matches and descendant tags
     */
    async updateTagShortcutsAfterRename(oldTagPath: string, newTagPath: string): Promise<void> {
        const normalizedOld = normalizeTagPath(oldTagPath);
        const normalizedNew = normalizeTagPath(newTagPath);
        if (!normalizedOld || !normalizedNew || normalizedOld === normalizedNew) {
            return;
        }

        await this.mutateTagShortcuts(shortcuts => {
            const prefix = `${normalizedOld}/`;
            const preservedPaths = new Set<string>();
            for (const shortcut of shortcuts) {
                if (isTagShortcut(shortcut)) {
                    const { tagPath } = shortcut;
                    if (tagPath !== normalizedOld && !tagPath.startsWith(prefix)) {
                        preservedPaths.add(tagPath);
                    }
                }
            }

            const occupiedPaths = new Set<string>();
            let changed = false;
            const updated: ShortcutEntry[] = [];

            for (const shortcut of shortcuts) {
                if (!isTagShortcut(shortcut)) {
                    updated.push(shortcut);
                    continue;
                }

                const currentPath = shortcut.tagPath;
                const isDirectMatch = currentPath === normalizedOld;
                const isDescendantMatch = currentPath.startsWith(prefix);
                let targetPath = currentPath;

                if (isDirectMatch || isDescendantMatch) {
                    const suffix = isDescendantMatch ? currentPath.slice(prefix.length) : '';
                    targetPath = suffix.length > 0 ? `${normalizedNew}/${suffix}` : normalizedNew;
                    if (targetPath !== currentPath) {
                        changed = true;
                    }
                }

                if ((isDirectMatch || isDescendantMatch) && preservedPaths.has(targetPath)) {
                    changed = true;
                    continue;
                }

                if (occupiedPaths.has(targetPath)) {
                    if (targetPath !== currentPath) {
                        changed = true;
                    }
                    continue;
                }

                const nextShortcut = targetPath === currentPath ? shortcut : { ...shortcut, tagPath: targetPath };
                updated.push(nextShortcut);
                occupiedPaths.add(targetPath);
                preservedPaths.add(targetPath);
            }

            return { changed, next: updated };
        }, 'Failed to update tag shortcuts after rename');
    }

    /**
     * Removes tag shortcuts after a tag is deleted
     * Also removes shortcuts for all descendant tags
     */
    async removeTagShortcutsAfterDelete(tagPath: string): Promise<void> {
        const normalizedPath = normalizeTagPath(tagPath);
        if (!normalizedPath) {
            return;
        }

        await this.mutateTagShortcuts(shortcuts => {
            const prefix = `${normalizedPath}/`;
            let changed = false;
            const filtered: ShortcutEntry[] = [];

            for (const shortcut of shortcuts) {
                if (!isTagShortcut(shortcut)) {
                    filtered.push(shortcut);
                    continue;
                }

                const currentPath = shortcut.tagPath;
                if (currentPath === normalizedPath || currentPath.startsWith(prefix)) {
                    changed = true;
                    continue;
                }

                filtered.push(shortcut);
            }

            return { changed, next: filtered };
        }, 'Failed to remove tag shortcuts after delete');
    }

    /**
     * Helper method to mutate tag shortcuts with atomic save
     * Applies changes and persists them to settings
     */
    private async mutateTagShortcuts(
        apply: (shortcuts: ShortcutEntry[]) => { changed: boolean; next: ShortcutEntry[] },
        failureContext: string
    ): Promise<void> {
        const metadataService = this.getMetadataService();
        const settingsProvider = metadataService?.getSettingsProvider();
        if (!settingsProvider) {
            return;
        }

        // Applies shortcut transformation to all vault profiles
        const didChange = mutateVaultProfileShortcuts(settingsProvider.settings.vaultProfiles, shortcuts => {
            const { changed, next } = apply(shortcuts);
            return changed ? next : null;
        });

        if (!didChange) {
            return;
        }

        try {
            await settingsProvider.saveSettingsAndUpdate();
        } catch (error) {
            console.error(`[Notebook Navigator] ${failureContext}`, error);
        }
    }
}
