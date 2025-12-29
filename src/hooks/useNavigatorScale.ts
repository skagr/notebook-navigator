/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { sanitizeUIScale, DEFAULT_UI_SCALE } from '../utils/uiScale';

interface NavigatorScaleOptions {
    isMobile: boolean;
    desktopScale: number | null | undefined;
    mobileScale: number | null | undefined;
}

interface NavigatorScaleResult {
    scale: number;
    style?: CSSProperties;
    dataAttr?: string;
}

/**
 * Computes memoized scale props for wrapping the navigator so panes render at
 * the requested zoom level without duplicating style logic in each component.
 */
export function useNavigatorScale({ isMobile, desktopScale, mobileScale }: NavigatorScaleOptions): NavigatorScaleResult {
    return useMemo(() => {
        const scale = sanitizeUIScale(isMobile ? mobileScale : desktopScale);
        if (scale === DEFAULT_UI_SCALE) {
            return { scale };
        }

        const value = scale.toString();
        const style: CSSProperties = { '--nn-ui-scale': value } as CSSProperties;

        return {
            scale,
            style,
            dataAttr: value
        };
    }, [desktopScale, isMobile, mobileScale]);
}
