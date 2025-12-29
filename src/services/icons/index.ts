/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

/**
 * Icon Service Module
 *
 * This module provides a unified icon system for Notebook Navigator,
 * supporting multiple icon providers through a plugin architecture.
 *
 * The module exports:
 * - IconService: Central service for managing icons
 * - Icon providers: LucideIconProvider, EmojiIconProvider
 * - Types: Interfaces and type definitions
 * - Helper functions: initializeIconService, getIconService
 *
 * Usage:
 * ```typescript
 * const iconService = getIconService();
 * iconService.renderIcon(element, 'folder'); // Renders Lucide folder icon
 * iconService.renderIcon(element, 'emoji:📁'); // Renders emoji icon
 * ```
 */

export * from './types';

import { useSyncExternalStore } from 'react';
import { IconService } from './IconService';
import { LucideIconProvider } from './providers/LucideIconProvider';
import { EmojiIconProvider } from './providers/EmojiIconProvider';

let iconService: IconService | null = null;

/**
 * Initializes the icon service with default providers.
 * Creates the service instance and registers Lucide and Emoji providers.
 *
 * @returns The initialized IconService instance
 */
function initializeIconService(): IconService {
    if (!iconService) {
        iconService = IconService.getInstance();

        // Register default providers
        iconService.registerProvider(new LucideIconProvider());
        iconService.registerProvider(new EmojiIconProvider());
    }

    return iconService;
}

/**
 * Gets the icon service instance, initializing if necessary.
 * This is the primary way to access the icon service throughout the plugin.
 *
 * @returns The IconService instance
 */
export function getIconService(): IconService {
    if (!iconService) {
        return initializeIconService();
    }
    return iconService;
}

export function useIconServiceVersion(): number {
    const service = getIconService();
    return useSyncExternalStore(
        listener => service.subscribe(listener),
        () => service.getVersion(),
        () => service.getVersion()
    );
}
