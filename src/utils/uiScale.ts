/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

// Internal constants, only derived/step values exported
const MIN_UI_SCALE = 0.75;
const MAX_UI_SCALE = 1.5;
export const DEFAULT_UI_SCALE = 1;
const UI_SCALE_STEP = 0.05;
export const MIN_UI_SCALE_PERCENT = Math.round(MIN_UI_SCALE * 100);
export const MAX_UI_SCALE_PERCENT = Math.round(MAX_UI_SCALE * 100);
export const UI_SCALE_PERCENT_STEP = Math.round(UI_SCALE_STEP * 100);

/**
 * Ensures UI scale values stay within supported range and uses two decimal precision.
 */
export function sanitizeUIScale(value: number | null | undefined): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return DEFAULT_UI_SCALE;
    }
    if (value < MIN_UI_SCALE) {
        return MIN_UI_SCALE;
    }
    if (value > MAX_UI_SCALE) {
        return MAX_UI_SCALE;
    }
    return Math.round(value * 100) / 100;
}

/**
 * Formats a UI scale value as a percentage string for display.
 */
export function formatUIScalePercent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

export function scaleToPercent(value: number): number {
    return Math.round(sanitizeUIScale(value) * 100);
}

export function percentToScale(value: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return DEFAULT_UI_SCALE;
    }
    const clampedPercent = Math.min(MAX_UI_SCALE_PERCENT, Math.max(MIN_UI_SCALE_PERCENT, Math.round(value)));
    return Math.round((clampedPercent / 100) * 100) / 100;
}
