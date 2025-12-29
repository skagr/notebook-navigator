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
import { useExpansionDispatch, useExpansionState } from '../context/ExpansionContext';
import { useSelectionDispatch } from '../context/SelectionContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUIState, useUIDispatch } from '../context/UIStateContext';
import { useFileCache } from '../context/StorageContext';
import { navigateToTag as navigateToTagInternal, type NavigateToTagOptions } from '../utils/tagNavigation';

/**
 * Custom hook that provides tag navigation functionality.
 * Handles navigating to tags, expanding parent tags, and managing UI state.
 *
 * This hook encapsulates the tag navigation logic to make it reusable
 * across different components (NotebookNavigatorComponent, FileItem, etc).
 */
export function useTagNavigation() {
    const settings = useSettingsState();
    const expansionState = useExpansionState();
    const selectionDispatch = useSelectionDispatch();
    const expansionDispatch = useExpansionDispatch();
    const uiState = useUIState();
    const uiDispatch = useUIDispatch();
    const { findTagInTree } = useFileCache();

    /**
     * Navigates to a tag, expanding parent tags if it's hierarchical.
     *
     * @param tagPath - The tag path to navigate to (e.g., "parent/child")
     */
    const navigateToTag = useCallback(
        (tagPath: string, options?: NavigateToTagOptions) => {
            navigateToTagInternal(
                {
                    showTags: settings.showTags,
                    showAllTagsFolder: settings.showAllTagsFolder,
                    expandedTags: expansionState.expandedTags,
                    expandedVirtualFolders: expansionState.expandedVirtualFolders,
                    expansionDispatch,
                    selectionDispatch,
                    uiState: {
                        singlePane: uiState.singlePane,
                        currentSinglePaneView: uiState.currentSinglePaneView,
                        focusedPane: uiState.focusedPane
                    },
                    uiDispatch,
                    findTagInTree
                },
                tagPath,
                {
                    ...options,
                    preserveNavigationFocus: options?.preserveNavigationFocus ?? false,
                    requireTagInTree: options?.requireTagInTree ?? false
                }
            );
        },
        [
            selectionDispatch,
            expansionDispatch,
            expansionState.expandedTags,
            expansionState.expandedVirtualFolders,
            settings.showAllTagsFolder,
            settings.showTags,
            findTagInTree,
            uiDispatch,
            uiState.currentSinglePaneView,
            uiState.focusedPane,
            uiState.singlePane
        ]
    );

    return {
        navigateToTag
    };
}
