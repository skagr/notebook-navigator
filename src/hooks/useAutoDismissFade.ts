/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { useEffect, useState } from 'react';
import { UPDATE_NOTICE_DISPLAY_DURATION_MS, UPDATE_NOTICE_FADE_DURATION_MS } from '../constants/updateNotice';

interface AutoDismissOptions {
    isActive: boolean;
    resetKey?: unknown;
    onDismiss?: () => void;
}

interface AutoDismissState {
    isVisible: boolean;
    isFading: boolean;
}

/**
 * Manages show/fade transitions for temporary notices with shared timing.
 */
export function useAutoDismissFade({ isActive, resetKey, onDismiss }: AutoDismissOptions): AutoDismissState {
    const [isVisible, setIsVisible] = useState(false);
    const [isFading, setIsFading] = useState(false);

    // Controls visibility and starts fade timer when component becomes active
    useEffect(() => {
        if (!isActive) {
            setIsVisible(false);
            setIsFading(false);
            return;
        }

        setIsVisible(true);
        setIsFading(false);

        // Start fade animation after display duration
        const displayTimer = window.setTimeout(() => {
            setIsFading(true);
        }, UPDATE_NOTICE_DISPLAY_DURATION_MS);

        return () => {
            window.clearTimeout(displayTimer);
        };
    }, [isActive, resetKey]);

    // Handles dismissal after fade animation completes
    useEffect(() => {
        if (!isVisible || !isFading) {
            return;
        }

        const fadeTimer = window.setTimeout(() => {
            if (onDismiss) {
                onDismiss();
            }

            setIsVisible(false);
            setIsFading(false);
        }, UPDATE_NOTICE_FADE_DURATION_MS);

        return () => {
            window.clearTimeout(fadeTimer);
        };
    }, [isVisible, isFading, onDismiss]);

    return {
        isVisible,
        isFading
    };
}
