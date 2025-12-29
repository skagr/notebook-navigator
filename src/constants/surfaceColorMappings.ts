/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { SurfaceVariableMapping } from '../hooks/useSurfaceColorVariables';

export const LIST_PANE_SURFACE_COLOR_MAPPINGS: SurfaceVariableMapping[] = [
    { source: '--nn-theme-file-selected-bg', target: '--nn-theme-file-selected-bg-solid' },
    { source: '--nn-theme-file-selected-inactive-bg', target: '--nn-theme-file-selected-inactive-bg-solid' }
];

export const NAVIGATION_PANE_SURFACE_COLOR_MAPPINGS: SurfaceVariableMapping[] = [
    { source: '--nn-theme-navitem-selected-bg', target: '--nn-theme-navitem-selected-bg-solid' },
    { source: '--nn-theme-navitem-selected-inactive-bg', target: '--nn-theme-navitem-selected-inactive-bg-solid' },
    { source: '--nn-theme-tag-positive-bg', target: '--nn-theme-tag-positive-bg-solid' },
    { source: '--nn-theme-tag-negative-bg', target: '--nn-theme-tag-negative-bg-solid' }
];
