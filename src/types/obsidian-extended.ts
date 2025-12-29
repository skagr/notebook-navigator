/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { App, Plugin, View, WorkspaceLeaf, TFile } from 'obsidian';

/** MIME type identifier for tag drag-and-drop operations */
export const TAG_DRAG_MIME = 'application/x-notebook-navigator-tag';

/**
 * Extended Obsidian type definitions for internal/undocumented APIs
 * These are based on actual Obsidian behavior but not part of the official API
 */

/**
 * Extended App interface with additional methods
 */
export interface ExtendedApp extends App {
    /**
     * Unique identifier for the vault/app instance
     */
    appId?: string;

    /**
     * Shows a file in the system file explorer (Finder/Explorer)
     * @param path - Vault-relative path to the file
     */
    showInFolder(path: string): Promise<void>;

    /**
     * View registry for accessing registered view types
     */
    viewRegistry?: {
        typeByExtension?: Record<string, string>;
    };

    /**
     * Metadata type manager for registered extensions
     */
    metadataTypeManager?: {
        registeredExtensions?: string[];
    };

    /**
     * Plugin registry for checking installed plugins
     */
    plugins?: {
        plugins?: Record<string, Plugin>;
        enabledPlugins?: Set<string>;
        disablePluginAndSave?(pluginId: string): Promise<void>;
        enablePluginAndSave?(pluginId: string): Promise<void>;
    };
}

/**
 * Drag payload metadata exposed by Obsidian's internal drag manager.
 * Defines all possible value types that can be stored in the drag payload.
 */
type DragManagerPayloadValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | TFile
    | TFile[]
    | DragManagerPayload
    | DragManagerPayload[]
    | HTMLElement
    | (() => void);

export interface DragManagerPayload {
    type?: 'file' | 'files' | 'link' | 'tag'; // Type of drag operation
    file?: TFile; // Single file being dragged
    files?: TFile[]; // Multiple files being dragged
    title?: string; // Display title for the drag operation
    [key: string]: DragManagerPayloadValue; // Additional arbitrary payload data
}

/**
 * Drag manager structure used by other plugins (e.g. Excalidraw)
 */
export interface DragManagerState {
    draggable: DragManagerPayload | null;
}

/**
 * App with internal drag manager available
 */
export interface AppWithDragManager extends App {
    dragManager: DragManagerState;
}

// Type guard that checks if a value is a non-null object
function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/**
 * Type guard that detects if the Obsidian app exposes the drag manager.
 * Uses reflection to safely check for the presence of internal drag manager API.
 */
export function hasDragManager(app: App): app is AppWithDragManager {
    // Validate app is a valid object
    if (typeof app !== 'object' || app === null) {
        return false;
    }

    // Check if dragManager property exists on app
    const candidate: object = app;
    if (!Reflect.has(candidate, 'dragManager')) {
        return false;
    }

    // Validate dragManager is an object
    const dragManager: unknown = Reflect.get(candidate, 'dragManager');
    if (!isObjectRecord(dragManager)) {
        return false;
    }

    // Check if draggable property exists on dragManager
    if (!Reflect.has(dragManager, 'draggable')) {
        return false;
    }

    // Validate draggable is null or an object (the payload)
    const draggableValue: unknown = Reflect.get(dragManager, 'draggable');
    return draggableValue === null || typeof draggableValue === 'object';
}

/**
 * Extended View interface with file property
 */
export interface FileView extends View {
    file?: TFile;
}

/**
 * Extended WorkspaceLeaf with typed view
 */
export interface ExtendedWorkspaceLeaf extends WorkspaceLeaf {
    view: FileView;
}

/**
 * Navigator-specific window extensions
 */
export interface NavigatorWindowFlags {
    notebookNavigatorOpeningVersionHistory?: boolean;
    notebookNavigatorOpeningFolderNote?: boolean;
}

/**
 * Common timeout values used throughout the plugin
 */
export const TIMEOUTS = {
    // Debounce Delays
    /** Debounce for keyboard, focus, and search input */
    DEBOUNCE_KEYBOARD: 100,
    /** Debounce for content processing and tree updates */
    DEBOUNCE_CONTENT: 300,
    /** Debounce for settings text input */
    DEBOUNCE_SETTINGS: 1000,

    // Throttle Delays
    /** Throttle delay for keyboard navigation (60fps) */
    KEYBOARD_THROTTLE: 16,

    // Operation Delays
    /** Delay for file system operations to complete */
    FILE_OPERATION_DELAY: 100,

    // Intervals
    /** Interval for cache statistics refresh (Advanced settings tab) */
    INTERVAL_STATISTICS: 5000,

    // Notice Durations
    /** Duration for error messages */
    NOTICE_ERROR: 2000,
    /** Duration for help messages */
    NOTICE_HELP: 10000,

    // Special
    /** Yields control to the event loop, allowing pending operations to complete */
    YIELD_TO_EVENT_LOOP: 0
} as const;

/**
 * Obsidian command IDs
 */
export const OBSIDIAN_COMMANDS = {
    EDIT_FILE_TITLE: 'workspace:edit-file-title',
    VERSION_HISTORY: 'sync:view-version-history'
} as const;

declare module 'obsidian' {
    interface FileManager {
        createNewMarkdownFile(folder: import('obsidian').TFolder, fileName: string): Promise<TFile>;
    }
}

/**
 * Extend the global Window interface for plugin state
 */
declare global {
    interface Window {
        notebookNavigatorOpeningVersionHistory?: boolean;
        notebookNavigatorOpeningFolderNote?: boolean;
    }
}
