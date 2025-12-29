/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { TFile, TFolder } from 'obsidian';

/**
 * Notebook Navigator Public API Types
 *
 * These types are exposed to external plugins through the API.
 * The API consistently uses Obsidian's native types (TFile, TFolder)
 * rather than string paths for better type safety and integration.
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

/**
 * Icon provider identifiers supported by the public API
 */
export type IconProviderId =
    | 'lucide'
    | 'bootstrap-icons'
    | 'fontawesome-solid'
    | 'material-icons'
    | 'phosphor'
    | 'rpg-awesome'
    | 'simple-icons';

/**
 * Icon string format for type-safe icon specifications
 * Must be provider-prefixed (e.g. 'phosphor:folder') or an emoji literal
 */
export type IconString = `${IconProviderId}:${string}` | `emoji:${string}`;

// ============================================================================
// METADATA TYPES
// ============================================================================

/**
 * Metadata for customizing folder appearance in the navigator
 */
export interface FolderMetadata {
    /** CSS color value (hex, rgb, hsl, named colors) */
    color?: string;
    /** CSS background color value */
    backgroundColor?: string;
    /** Icon identifier (e.g., 'lucide:folder' or 'emoji:📁') */
    icon?: IconString;
}

/**
 * Metadata for customizing tag appearance in the navigator
 */
export interface TagMetadata {
    /** CSS color value (hex, rgb, hsl, named colors) */
    color?: string;
    /** CSS background color value */
    backgroundColor?: string;
    /** Icon identifier (e.g., 'lucide:tag' or 'emoji:🏷️') */
    icon?: IconString;
}

// ============================================================================
// PIN CONTEXT TYPES
// ============================================================================

/**
 * Context where a note can be pinned
 * - 'folder': Pin appears when viewing folders
 * - 'tag': Pin appears when viewing tags
 * - 'all': Pin appears in both folder and tag views
 */
export type PinContext = 'folder' | 'tag' | 'all';

/**
 * Pinned file with context information
 */
export interface PinnedFile {
    /** The pinned file */
    file: TFile;
    /** Which context the file is pinned in */
    context: { folder: boolean; tag: boolean };
}

/**
 * Type alias for the Map structure returned by the API for pinned notes
 * Maps file paths to their pinning context states
 */
export type Pinned = Map<string, { folder: boolean; tag: boolean }>;

// ============================================================================
// EVENTS
// ============================================================================

/**
 * All available event types that can be subscribed to
 */
export type NotebookNavigatorEventType = keyof NotebookNavigatorEvents;

/**
 * Event payload definitions for each event type
 */
export interface NotebookNavigatorEvents {
    /** Fired when the storage system is ready for queries */
    'storage-ready': void;

    /** Fired when the navigation selection changes (folder, tag, or nothing) */
    'nav-item-changed': {
        item: NavItem;
    };

    /** Fired when selection changes in the list pane */
    'selection-changed': {
        state: SelectionState;
    };

    /** Fired when pinned files change */
    'pinned-files-changed': {
        /** All currently pinned files with their context information as a Map */
        files: Readonly<Pinned>;
    };

    /** Fired when folder metadata changes */
    'folder-changed': {
        folder: TFolder;
        metadata: FolderMetadata;
    };

    /** Fired when tag metadata changes */
    'tag-changed': {
        tag: string;
        metadata: TagMetadata;
    };
}

// ============================================================================
// SELECTION STATE
// ============================================================================

/**
 * Currently selected navigation item (folder or tag)
 * Discriminated union ensures only one can be selected at a time
 */
export type NavItem = { folder: TFolder; tag: null } | { folder: null; tag: string } | { folder: null; tag: null };

/**
 * Current file selection state
 */
export interface SelectionState {
    /** Array of currently selected files */
    files: readonly TFile[];
    /** The file that has keyboard focus (can be null) */
    focused: TFile | null;
}
