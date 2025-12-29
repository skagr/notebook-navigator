/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { BackgroundMode } from '../types';

/** Returns CSS classes for the configured background mode */
export function getBackgroundClasses(mode: BackgroundMode | null | undefined): string[] {
    if (mode === 'primary') {
        return ['nn-bg-primary'];
    }
    if (mode === 'secondary') {
        return ['nn-bg-secondary'];
    }
    return [];
}
