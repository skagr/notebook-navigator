/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { TFile } from 'obsidian';
import type { NotebookNavigatorSettings } from '../settings';

export const EXCALIDRAW_BASENAME_SUFFIX = '.excalidraw';
const EXCALIDRAW_FRONTMATTER_KEY = 'excalidraw-plugin';

type ExcalidrawFrontmatterFlagValue = boolean | number | string | object | null | undefined;

// Pattern matching characters that break Obsidian links: [[, ]], %%, #, |, ^, :
const INVALID_LINK_CHARACTERS_PATTERN = /(\[\[|\]\]|%%|[#|^:])/u;
const INVALID_LINK_CHARACTERS_GLOBAL_PATTERN = /(\[\[|\]\]|%%|[#|^:])/gu;

// Forbidden characters across all platforms: : and /
const FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_PATTERN = /[:/]/u;
const FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_GLOBAL_PATTERN = /[:/]/gu;

// Forbidden characters on Windows (excluding : and / handled in all-platform pattern): < > " \ | ? *
const FORBIDDEN_NAME_CHARACTERS_WINDOWS_PATTERN = /[<>"\\|?*]/u;
const FORBIDDEN_NAME_CHARACTERS_WINDOWS_GLOBAL_PATTERN = /[<>"\\|?*]/gu;

/**
 * Strips leading periods from a name.
 */
export function stripLeadingPeriods(value: string): string {
    if (!value) {
        return '';
    }
    return value.replace(/^\.+/u, '');
}

/**
 * Checks whether a filename ends with the Excalidraw composite extension (.excalidraw.md).
 */
export function isExcalidrawFileName(value: string): boolean {
    if (!value) {
        return false;
    }

    return value.toLowerCase().endsWith(`${EXCALIDRAW_BASENAME_SUFFIX}.md`);
}

/**
 * Removes the Excalidraw basename suffix when present.
 * Returns the original value for non-Excalidraw names.
 */
export function stripExcalidrawSuffix(value: string): string {
    if (!value) {
        return value;
    }
    const lower = value.toLowerCase();
    if (lower.endsWith(EXCALIDRAW_BASENAME_SUFFIX)) {
        return value.slice(0, -EXCALIDRAW_BASENAME_SUFFIX.length);
    }
    return value;
}

/**
 * Checks whether a file uses the Excalidraw composite extension (.excalidraw.md).
 */
export function isExcalidrawFile(file: TFile): boolean {
    return isExcalidrawFileName(file.name);
}

/**
 * Checks if a frontmatter value indicates the file is an Excalidraw drawing.
 */
function isTruthyExcalidrawFrontmatterFlag(value: ExcalidrawFrontmatterFlagValue): boolean {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return false;
        }
        const normalized = trimmed.toLowerCase();
        return normalized !== 'false' && normalized !== '0';
    }

    return Boolean(value);
}

/**
 * Checks if a frontmatter record marks the file as an Excalidraw drawing.
 */
export function hasExcalidrawFrontmatterFlag(frontmatter?: Record<string, ExcalidrawFrontmatterFlagValue> | null): boolean {
    if (!frontmatter) {
        return false;
    }

    return isTruthyExcalidrawFrontmatterFlag(frontmatter[EXCALIDRAW_FRONTMATTER_KEY]);
}

/**
 * Removes characters that break Obsidian links (#, |, ^, :, %%, [[, ]]).
 */
export function stripInvalidLinkCharacters(value: string): string {
    if (!value) {
        return value;
    }
    INVALID_LINK_CHARACTERS_GLOBAL_PATTERN.lastIndex = 0;
    return value.replace(INVALID_LINK_CHARACTERS_GLOBAL_PATTERN, '');
}

/**
 * Checks whether a name contains characters that break Obsidian links (#, |, ^, :, %%, [[, ]]).
 */
export function containsInvalidLinkCharacters(value: string): boolean {
    if (!value) {
        return false;
    }
    return INVALID_LINK_CHARACTERS_PATTERN.test(value);
}

/**
 * Removes forbidden name characters across all platforms (: and /).
 */
export function stripForbiddenNameCharactersAllPlatforms(value: string): string {
    if (!value) {
        return value;
    }
    FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_GLOBAL_PATTERN.lastIndex = 0;
    return value.replace(FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_GLOBAL_PATTERN, '');
}

/**
 * Checks whether a name contains forbidden characters across all platforms (: and /).
 */
export function containsForbiddenNameCharactersAllPlatforms(value: string): boolean {
    if (!value) {
        return false;
    }
    return FORBIDDEN_NAME_CHARACTERS_ALL_PLATFORMS_PATTERN.test(value);
}

/**
 * Removes forbidden name characters on Windows (<, >, ", \\, |, ?, *).
 */
export function stripForbiddenNameCharactersWindows(value: string): string {
    if (!value) {
        return value;
    }
    FORBIDDEN_NAME_CHARACTERS_WINDOWS_GLOBAL_PATTERN.lastIndex = 0;
    return value.replace(FORBIDDEN_NAME_CHARACTERS_WINDOWS_GLOBAL_PATTERN, '');
}

/**
 * Checks whether a name contains forbidden characters on Windows (<, >, ", \\, |, ?, *).
 */
export function containsForbiddenNameCharactersWindows(value: string): boolean {
    if (!value) {
        return false;
    }
    return FORBIDDEN_NAME_CHARACTERS_WINDOWS_PATTERN.test(value);
}

/**
 * Get the display name for a file
 * @param file - The file to get the name for
 * @param cachedData - Optional cached file data containing frontmatter name
 * @param settings - Plugin settings to check if frontmatter is enabled
 * @returns The display name for the file
 */
export function getFileDisplayName(file: TFile, cachedData?: { fn?: string }, settings?: NotebookNavigatorSettings): string {
    // If we have cached frontmatter name and feature is enabled, use it
    if (cachedData?.fn && settings?.useFrontmatterMetadata) {
        return cachedData.fn;
    }

    // Strip .excalidraw suffix from Excalidraw files for cleaner display
    if (isExcalidrawFile(file)) {
        return stripExcalidrawSuffix(file.basename);
    }

    // Fall back to file basename
    return file.basename;
}
