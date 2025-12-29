/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { Notice } from 'obsidian';

/**
 * Visual variants for notices.
 * - success: Green text for successful operations
 * - warning: Red text for warnings
 * - loading: Shows loading spinner animation
 */
export type NoticeVariant = 'success' | 'warning' | 'loading';

/**
 * Configuration options for displaying notices.
 */
export interface ShowNoticeOptions {
    /** Duration in milliseconds before notice auto-dismisses. Omit for default duration. */
    timeout?: number;
    /** Visual style variant to apply to the notice */
    variant?: NoticeVariant;
}

/**
 * Displays an Obsidian notice with optional styling variants.
 *
 * Applies CSS classes to the notice container based on the variant:
 * - 'success': Adds 'mod-success' class for green text
 * - 'warning': Adds 'mod-warning' class for red text
 * - 'loading': Adds 'is-loading' class for spinner animation
 *
 * @param message - Text to display in the notice
 * @param options - Optional configuration for timeout and visual variant
 * @returns The Notice instance, allowing caller to dismiss or update it
 */
export function showNotice(message: string, options?: ShowNoticeOptions): Notice {
    const notice = new Notice(message, options?.timeout);
    const container = notice.containerEl;
    if (container) {
        if (options?.variant === 'success') {
            container.addClass('mod-success');
        } else if (options?.variant === 'warning') {
            container.addClass('mod-warning');
        } else if (options?.variant === 'loading') {
            container.addClass('is-loading');
        }
    }
    return notice;
}
