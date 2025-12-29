/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { LISTPANE_MEASUREMENTS } from '../types';

export interface CompactListMetrics {
    fontSize: number;
    mobileFontSize: number;
    desktopPadding: number;
    desktopPaddingTotal: number;
    mobilePadding: number;
    mobilePaddingTotal: number;
}

interface CompactListMetricsInput {
    compactItemHeight: number;
    scaleText: boolean;
    titleLineHeight: number;
}

/**
 * Calculates compact list typography and spacing based on height settings.
 * Keeps CSS custom properties and virtualization estimates in sync.
 */
export function calculateCompactListMetrics({
    compactItemHeight,
    scaleText,
    titleLineHeight
}: CompactListMetricsInput): CompactListMetrics {
    const {
        defaultCompactItemHeight,
        defaultCompactFontSize,
        mobileHeightIncrement,
        mobileFontSizeIncrement,
        minCompactPaddingVerticalMobile
    } = LISTPANE_MEASUREMENTS;

    // Calculate desktop padding to center title line within item height
    const desktopPadding = Math.max((compactItemHeight - titleLineHeight) / 2, 0);
    const desktopPaddingTotal = Math.max(compactItemHeight - titleLineHeight, 0);

    // Reduce font size for shorter items when text scaling is enabled
    let fontSize = defaultCompactFontSize;
    if (scaleText) {
        if (compactItemHeight <= defaultCompactItemHeight - 6) {
            fontSize = defaultCompactFontSize - 2;
        } else if (compactItemHeight <= defaultCompactItemHeight - 4) {
            fontSize = defaultCompactFontSize - 1;
        }
    }

    // Mobile height uses same scaling logic as navigation items with fixed increment
    const mobileItemHeight = compactItemHeight + mobileHeightIncrement;

    // Calculate mobile padding using mobile-adjusted item height
    const mobilePaddingRaw = Math.max((mobileItemHeight - titleLineHeight) / 2, 0);
    const mobilePadding = Math.max(minCompactPaddingVerticalMobile, mobilePaddingRaw);
    const mobilePaddingTotal = mobilePadding * 2;

    // Apply same font scaling delta as navigation items
    const mobileFontSize = fontSize + mobileFontSizeIncrement;

    return {
        fontSize,
        mobileFontSize,
        desktopPadding,
        desktopPaddingTotal,
        mobilePadding,
        mobilePaddingTotal
    };
}
