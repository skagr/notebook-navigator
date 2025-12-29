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
import type { ReleaseUpdateNotice } from '../services/ReleaseCheckService';
import { strings } from '../i18n';
import { useAutoDismissFade } from '../hooks/useAutoDismissFade';
import { runAsyncAction } from '../utils/async';

/** Props for the UpdateNoticeBanner component */
interface UpdateNoticeBannerProps {
    notice: ReleaseUpdateNotice | null;
    onDismiss: (version: string) => Promise<void>;
}

/**
 * Displays a temporary banner when a newer plugin release is available.
 */
export function UpdateNoticeBanner({ notice, onDismiss }: UpdateNoticeBannerProps) {
    const [visibleNotice, setVisibleNotice] = useState<ReleaseUpdateNotice | null>(null);

    // Update visible notice when a new notice arrives
    useEffect(() => {
        if (!notice) {
            return;
        }

        setVisibleNotice(notice);
    }, [notice]);

    // Callback to dismiss the banner and clear the visible notice
    const handleDismiss = useCallback(() => {
        if (!visibleNotice) {
            return;
        }

        runAsyncAction(() => onDismiss(visibleNotice.version));
        setVisibleNotice(null);
    }, [visibleNotice, onDismiss]);

    // Manages automatic fade-out animation and dismissal timing
    const { isVisible, isFading } = useAutoDismissFade({
        isActive: visibleNotice !== null,
        resetKey: visibleNotice?.version ?? null,
        onDismiss: handleDismiss
    });

    if (!isVisible || !visibleNotice) {
        return null;
    }

    const className = `nn-update-banner${isFading ? ' fade-out' : ''}`;

    return (
        <div className={className} role="status">
            <div className="nn-update-banner__text">
                <span className="nn-update-banner__label">{strings.common.updateBannerTitle}</span>
                <span className="nn-update-banner__instruction">{strings.common.updateBannerInstruction}</span>
            </div>
        </div>
    );
}
