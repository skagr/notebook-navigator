/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import NotebookNavigatorPlugin from '../main';

interface RecentDataState {
    recentNotes: string[];
    recentIcons: Record<string, string[]>;
}

const RecentDataContext = createContext<RecentDataState | null>(null);

interface RecentDataProviderProps {
    plugin: NotebookNavigatorPlugin;
    children: React.ReactNode;
}

/**
 * Provider that maintains recent notes and recent icons state from local storage
 */
export function RecentDataProvider({ plugin, children }: RecentDataProviderProps) {
    const [recentNotes, setRecentNotes] = useState<string[]>(() => plugin.getRecentNotes());
    const [recentIcons, setRecentIcons] = useState<Record<string, string[]>>(() => plugin.getRecentIcons());

    useEffect(() => {
        // Generate unique listener ID
        const id = `recent-data-${Date.now()}`;

        // Update state when recent data changes
        const handleRecentUpdate = () => {
            setRecentNotes(plugin.getRecentNotes());
            setRecentIcons(plugin.getRecentIcons());
        };

        plugin.registerRecentDataListener(id, handleRecentUpdate);

        return () => {
            plugin.unregisterRecentDataListener(id);
        };
    }, [plugin]);

    const value: RecentDataState = React.useMemo(() => ({ recentNotes, recentIcons }), [recentNotes, recentIcons]);

    return <RecentDataContext.Provider value={value}>{children}</RecentDataContext.Provider>;
}

/**
 * Hook to access recent notes and icons from the context
 */
export function useRecentData(): RecentDataState {
    const context = useContext(RecentDataContext);
    if (context === null) {
        throw new Error('useRecentData must be used within a RecentDataProvider');
    }
    return context;
}
