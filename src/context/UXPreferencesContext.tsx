/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import NotebookNavigatorPlugin from '../main';
import type { UXPreferences } from '../types';

/**
 * Props for the UX preferences provider component
 */
interface UXPreferencesProviderProps {
    children: ReactNode;
    plugin: NotebookNavigatorPlugin;
}

/**
 * Actions for modifying UX preference values
 * These preferences control runtime view state that should not persist across devices
 */
interface UXPreferenceActions {
    setSearchActive: (value: boolean) => void;
    setIncludeDescendantNotes: (value: boolean) => void;
    toggleIncludeDescendantNotes: () => void;
    setShowHiddenItems: (value: boolean) => void;
    toggleShowHiddenItems: () => void;
    setPinShortcuts: (value: boolean) => void;
}

// Context for providing UX preference state values
const UXPreferencesStateContext = createContext<UXPreferences | null>(null);
// Context for providing UX preference action methods
const UXPreferencesActionsContext = createContext<UXPreferenceActions | null>(null);

/**
 * Provider component for UX preferences
 * Manages non-persistent view state preferences that control runtime UI behavior
 */
export function UXPreferencesProvider({ children, plugin }: UXPreferencesProviderProps) {
    // Version counter to trigger re-renders when preferences change
    const [version, setVersion] = useState(0);
    const listenerIdRef = useRef<string>('');
    if (!listenerIdRef.current) {
        listenerIdRef.current = `ux-preferences-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    // Register listener for preference updates from the plugin
    useEffect(() => {
        const handleUpdate = () => {
            setVersion(v => v + 1);
        };

        plugin.registerUXPreferencesListener(listenerIdRef.current, handleUpdate);

        return () => {
            plugin.unregisterUXPreferencesListener(listenerIdRef.current);
        };
    }, [plugin]);

    // Get current preferences from plugin, re-computing on version change
    const preferences = useMemo(() => {
        void version; // Dependency to trigger recalculation
        return plugin.getUXPreferences();
    }, [plugin, version]);

    // Create stable action methods that delegate to plugin
    const actions = useMemo<UXPreferenceActions>(
        () => ({
            setSearchActive: (value: boolean) => {
                plugin.setSearchActive(value);
            },
            setIncludeDescendantNotes: (value: boolean) => {
                plugin.setIncludeDescendantNotes(value);
            },
            toggleIncludeDescendantNotes: () => {
                plugin.toggleIncludeDescendantNotes();
            },
            setShowHiddenItems: (value: boolean) => {
                plugin.setShowHiddenItems(value);
            },
            toggleShowHiddenItems: () => {
                plugin.toggleShowHiddenItems();
            },
            setPinShortcuts: (value: boolean) => {
                plugin.setPinShortcuts(value);
            }
        }),
        [plugin]
    );

    return (
        <UXPreferencesStateContext.Provider value={preferences}>
            <UXPreferencesActionsContext.Provider value={actions}>{children}</UXPreferencesActionsContext.Provider>
        </UXPreferencesStateContext.Provider>
    );
}

/**
 * Hook to access current UX preference values
 * @returns Current UX preferences state
 */
export function useUXPreferences(): UXPreferences {
    const context = useContext(UXPreferencesStateContext);
    if (!context) {
        throw new Error('useUXPreferences must be used within a UXPreferencesProvider');
    }
    return context;
}

/**
 * Hook to access UX preference action methods
 * @returns Object containing methods to modify UX preferences
 */
export function useUXPreferenceActions(): UXPreferenceActions {
    const context = useContext(UXPreferencesActionsContext);
    if (!context) {
        throw new Error('useUXPreferenceActions must be used within a UXPreferencesProvider');
    }
    return context;
}
