/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

// Imports
import { useCallback } from 'react';
import type { ReleaseUpdateNotice } from '../services/ReleaseCheckService';
import { strings } from '../i18n';
import { ObsidianIcon } from './ObsidianIcon';
import { useAutoDismissFade } from '../hooks/useAutoDismissFade';

// Types/Interfaces
interface UpdateNoticeIndicatorProps {
    notice: ReleaseUpdateNotice | null;
    isEnabled: boolean;
}

// Component
/**
 * Floating indicator button that appears when a new plugin version is available
 */
export function UpdateNoticeIndicator({ notice, isEnabled }: UpdateNoticeIndicatorProps) {
    // Hooks (state, context, refs)
    const noticeVersion = notice?.version ?? null;
    const shouldShowIndicator = isEnabled && notice !== null;
    // Controls auto-dismiss timing and fade animation state
    const { isVisible, isFading } = useAutoDismissFade({
        isActive: shouldShowIndicator,
        resetKey: noticeVersion
    });

    // Callbacks / handlers
    // Opens the plugin's page in Obsidian's plugin manager
    const handleClick = useCallback(() => {
        window.open('obsidian://show-plugin?id=notebook-navigator');
    }, []);

    // Render
    if (!isVisible) {
        return null;
    }

    return (
        <button
            type="button"
            className={`nn-update-indicator${isFading ? ' fade-out' : ''}`}
            onClick={handleClick}
            aria-label={strings.common.updateIndicatorLabel}
            title={strings.common.updateIndicatorLabel}
        >
            <ObsidianIcon name="lucide-arrow-up-circle" className="nn-update-indicator__icon" />
        </button>
    );
}
