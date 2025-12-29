/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { NAVIGATION_PANE_DIMENSIONS, STORAGE_KEYS, type DualPaneOrientation } from '../types';

interface NavigationPaneSizing {
    defaultSize: number;
    minSize: number;
    storageKey: string;
}

/**
 * Returns sizing defaults and persistence keys for the navigation pane
 * based on the active dual-pane orientation.
 */
export function getNavigationPaneSizing(orientation: DualPaneOrientation): NavigationPaneSizing {
    if (orientation === 'vertical') {
        return {
            defaultSize: NAVIGATION_PANE_DIMENSIONS.defaultHeight,
            minSize: NAVIGATION_PANE_DIMENSIONS.minHeight,
            storageKey: STORAGE_KEYS.navigationPaneHeightKey
        };
    }

    return {
        defaultSize: NAVIGATION_PANE_DIMENSIONS.defaultWidth,
        minSize: NAVIGATION_PANE_DIMENSIONS.minWidth,
        storageKey: STORAGE_KEYS.navigationPaneWidthKey
    };
}
