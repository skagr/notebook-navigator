/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { App } from 'obsidian';

// Current localStorage schema version
export const LOCALSTORAGE_VERSION = 1;

/**
 * Type-safe wrapper around Obsidian's vault-specific localStorage API
 * Obsidian handles JSON serialization/deserialization internally
 * IMPORTANT: Must be initialized with app instance before use to prevent data mixing between vaults
 */
export const localStorage = {
    _app: null as App | null,

    /**
     * Initialize the localStorage utility with the app instance
     * This enables vault-specific storage isolation
     */
    init(app: App) {
        // Use localStorage object literal directly to ensure proper this binding (eslint @typescript-eslint/unbound-method)
        localStorage._app = app;
    },
    /**
     * Safely retrieves a value from localStorage with error handling
     * Obsidian automatically deserializes the stored value
     * @param key - The localStorage key
     * @returns The deserialized value or null if not found/error occurs
     */
    get<T = string>(key: string): T | null {
        try {
            if (!localStorage._app) {
                // Return null if app not initialized to prevent mixing storage
                console.log(`localStorage accessed before initialization for key "${key}"`);
                return null;
            }
            // Use vault-specific storage
            const data: unknown = localStorage._app.loadLocalStorage(key);
            return data as T;
        } catch (error: unknown) {
            console.error(`Failed to get from localStorage for key "${key}":`, error);
            return null;
        }
    },

    /**
     * Safely sets a value in localStorage with error handling
     * @param key - The localStorage key
     * @param value - The value to store (Obsidian handles serialization)
     * @returns True if successful, false otherwise
     */
    set<T>(key: string, value: T): boolean {
        try {
            if (!localStorage._app) {
                // Ignore writes if app not initialized to prevent mixing storage
                console.log(`localStorage write attempted before initialization for key "${key}"`);
                return false;
            }
            // Use vault-specific storage
            localStorage._app.saveLocalStorage(key, value);
            return true;
        } catch (error: unknown) {
            console.error(`Failed to set localStorage for key "${key}":`, error);
            return false;
        }
    },

    /**
     * Safely removes a value from localStorage with error handling
     * @param key - The localStorage key
     * @returns True if successful, false otherwise
     */
    remove(key: string): boolean {
        try {
            if (!localStorage._app) {
                // Ignore removes if app not initialized to prevent mixing storage
                console.log(`localStorage remove attempted before initialization for key "${key}"`);
                return false;
            }
            // Use vault-specific storage - pass null to clear
            localStorage._app.saveLocalStorage(key, null);
            return true;
        } catch (error: unknown) {
            console.error(`Failed to remove from localStorage for key "${key}":`, error);
            return false;
        }
    }
};
