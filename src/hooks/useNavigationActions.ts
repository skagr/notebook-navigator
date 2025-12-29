/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { useCallback } from 'react';
import { TFolder } from 'obsidian';
import { useExpansionState, useExpansionDispatch } from '../context/ExpansionContext';
import { useSelectionState } from '../context/SelectionContext';
import { useServices, useFileSystemOps } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferenceActions, useUXPreferences } from '../context/UXPreferencesContext';
import { useFileCache } from '../context/StorageContext';
import { collectAllTagPaths } from '../utils/tagTree';

/**
 * Custom hook that provides shared actions for navigation pane toolbars.
 * Used by both NavigationPaneHeader (desktop) and NavigationToolbar (mobile) to avoid code duplication.
 *
 * @returns Object containing action handlers and computed values for navigation pane operations
 */
export function useNavigationActions() {
    const { app } = useServices();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const showHiddenItems = uxPreferences.showHiddenItems;
    const { setShowHiddenItems } = useUXPreferenceActions();
    const expansionState = useExpansionState();
    const expansionDispatch = useExpansionDispatch();
    const selectionState = useSelectionState();
    const fileSystemOps = useFileSystemOps();
    const { fileData } = useFileCache();

    const shouldCollapseItems = useCallback(() => {
        const behavior = settings.collapseBehavior;

        const hasFoldersExpanded = settings.showRootFolder
            ? Array.from(expansionState.expandedFolders).some(path => path !== '/')
            : expansionState.expandedFolders.size > 0;
        const hasTagsExpanded = expansionState.expandedTags.size > 0;

        // Check if we should collapse based on behavior setting
        const hasItemsExpanded =
            behavior === 'all'
                ? hasFoldersExpanded || hasTagsExpanded
                : behavior === 'folders-only'
                  ? hasFoldersExpanded
                  : behavior === 'tags-only'
                    ? hasTagsExpanded
                    : false;

        // If smart collapse is enabled and items are expanded,
        // check if we're already in the "focused" state (only parent chain expanded)
        if (settings.smartCollapse && hasItemsExpanded) {
            const shouldAffectFolders = behavior === 'all' || behavior === 'folders-only';
            const shouldAffectTags = behavior === 'all' || behavior === 'tags-only';

            // Build the parent chain that we would keep when collapsing
            const expectedFolders = new Set<string>();
            const expectedTags = new Set<string>();

            if (shouldAffectFolders && selectionState.selectedFolder) {
                let currentFolder: TFolder | null = selectionState.selectedFolder.parent;
                while (currentFolder) {
                    expectedFolders.add(currentFolder.path);
                    if (currentFolder.path === '/') break;
                    currentFolder = currentFolder.parent;
                }
            }

            if (shouldAffectTags && selectionState.selectedTag) {
                const parts = selectionState.selectedTag.split('/');
                let currentPath = '';
                // Build parent chain (excluding the tag itself)
                for (let i = 0; i < parts.length - 1; i++) {
                    currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
                    expectedTags.add(currentPath);
                }
            }

            // Check if current expansion matches what we'd have after smart collapse
            const foldersMatch =
                !shouldAffectFolders ||
                (expansionState.expandedFolders.size === expectedFolders.size &&
                    Array.from(expansionState.expandedFolders).every(f => expectedFolders.has(f)));

            const tagsMatch =
                !shouldAffectTags ||
                (expansionState.expandedTags.size === expectedTags.size &&
                    Array.from(expansionState.expandedTags).every(t => expectedTags.has(t)));

            // If we're already in focused state, expand all instead
            if (foldersMatch && tagsMatch) {
                return false;
            }
        }

        return hasItemsExpanded;
    }, [
        settings.collapseBehavior,
        settings.showRootFolder,
        settings.smartCollapse,
        expansionState.expandedFolders,
        expansionState.expandedTags,
        selectionState.selectedFolder,
        selectionState.selectedTag
    ]);

    const handleExpandCollapseAll = useCallback(() => {
        const behavior = settings.collapseBehavior;
        const rootFolder = app.vault.getRoot();
        const shouldCollapse = shouldCollapseItems();

        const shouldAffectFolders = behavior === 'all' || behavior === 'folders-only';
        const shouldAffectTags = behavior === 'all' || behavior === 'tags-only';

        if (shouldCollapse) {
            // Smart collapse: keep selected item and its parents expanded
            if (settings.smartCollapse && (selectionState.selectedFolder || selectionState.selectedTag)) {
                const foldersToKeep = new Set<string>();
                const tagsToKeep = new Set<string>();

                // If a folder is selected, keep only its parent chain (not the folder itself)
                // This way we see the selected folder but not its siblings
                if (selectionState.selectedFolder && shouldAffectFolders) {
                    let currentFolder: TFolder | null = selectionState.selectedFolder.parent;
                    while (currentFolder) {
                        foldersToKeep.add(currentFolder.path);
                        if (currentFolder.path === '/') break;
                        currentFolder = currentFolder.parent;
                    }
                }

                // If a tag is selected, keep only its parent chain (not the tag itself)
                // This way we see the selected tag but not its siblings
                if (selectionState.selectedTag && shouldAffectTags) {
                    const parts = selectionState.selectedTag.split('/');
                    let currentPath = '';
                    // Stop before the last part (the selected tag itself)
                    for (let i = 0; i < parts.length - 1; i++) {
                        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
                        tagsToKeep.add(currentPath);
                    }
                }

                // Apply smart collapse
                if (shouldAffectFolders) {
                    expansionDispatch({ type: 'SET_EXPANDED_FOLDERS', folders: foldersToKeep });
                }
                if (shouldAffectTags) {
                    expansionDispatch({ type: 'SET_EXPANDED_TAGS', tags: tagsToKeep });
                }
            } else {
                // Regular collapse all
                if (shouldAffectFolders) {
                    const collapsedFolders = new Set<string>();
                    if (settings.showRootFolder) {
                        collapsedFolders.add('/');
                    }
                    expansionDispatch({ type: 'SET_EXPANDED_FOLDERS', folders: collapsedFolders });
                }

                if (shouldAffectTags) {
                    expansionDispatch({ type: 'SET_EXPANDED_TAGS', tags: new Set() });
                }
            }
        } else {
            if (shouldAffectFolders) {
                const allFolders = new Set<string>();

                const collectAllFolders = (folder: TFolder) => {
                    folder.children.forEach(child => {
                        if (child instanceof TFolder) {
                            allFolders.add(child.path);
                            collectAllFolders(child);
                        }
                    });
                };

                if (settings.showRootFolder) {
                    allFolders.add(rootFolder.path);
                }

                collectAllFolders(rootFolder);
                expansionDispatch({ type: 'SET_EXPANDED_FOLDERS', folders: allFolders });
            }

            if (shouldAffectTags) {
                const allTagPaths = new Set<string>();

                for (const tagNode of fileData.tagTree.values()) {
                    collectAllTagPaths(tagNode, allTagPaths);
                }

                expansionDispatch({ type: 'SET_EXPANDED_TAGS', tags: allTagPaths });
            }
        }
    }, [
        app,
        expansionDispatch,
        settings.showRootFolder,
        settings.collapseBehavior,
        settings.smartCollapse,
        selectionState.selectedFolder,
        selectionState.selectedTag,
        fileData.tagTree,
        shouldCollapseItems
    ]);

    const handleNewFolder = useCallback(async () => {
        if (!selectionState.selectedFolder) return;

        try {
            await fileSystemOps.createNewFolder(selectionState.selectedFolder, () => {
                if (selectionState.selectedFolder && !expansionState.expandedFolders.has(selectionState.selectedFolder.path)) {
                    expansionDispatch({ type: 'TOGGLE_FOLDER_EXPANDED', folderPath: selectionState.selectedFolder.path });
                }
            });
        } catch {
            // Error is handled by FileSystemOperations with user notification
        }
    }, [selectionState.selectedFolder, expansionState.expandedFolders, fileSystemOps, expansionDispatch]);

    const handleToggleShowExcludedFolders = useCallback(() => {
        setShowHiddenItems(!showHiddenItems);
    }, [setShowHiddenItems, showHiddenItems]);

    return {
        shouldCollapseItems,
        handleExpandCollapseAll,
        handleNewFolder,
        handleToggleShowExcludedFolders
    };
}
