/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { useCallback, useEffect, useState } from 'react';
import { useServices } from '../context/ServicesContext';
import type { ReleaseUpdateNotice } from '../services/ReleaseCheckService';

/** State returned by the useUpdateNotice hook */
interface UpdateNoticeState {
    notice: ReleaseUpdateNotice | null;
    markAsDisplayed: (version: string) => Promise<void>;
}

/**
 * Provides access to the pending release update notice and a handler to mark it as shown.
 */
export function useUpdateNotice(): UpdateNoticeState {
    const { plugin } = useServices();
    const [notice, setNotice] = useState<ReleaseUpdateNotice | null>(() => plugin.getPendingUpdateNotice());

    // Subscribe to update notice changes
    useEffect(() => {
        // Generate unique listener ID to avoid conflicts
        const id = `update-notice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const listener = (value: ReleaseUpdateNotice | null) => {
            setNotice(value);
        };

        plugin.registerUpdateNoticeListener(id, listener);

        return () => {
            plugin.unregisterUpdateNoticeListener(id);
        };
    }, [plugin]);

    // Callback to mark a specific version as having been displayed to the user
    const markAsDisplayed = useCallback(
        async (version: string) => {
            await plugin.markUpdateNoticeAsDisplayed(version);
        },
        [plugin]
    );

    return {
        notice,
        markAsDisplayed
    };
}
