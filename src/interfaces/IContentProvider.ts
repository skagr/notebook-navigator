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
import { NotebookNavigatorSettings } from '../settings';

/**
 * Types of content that can be generated
 */
export type ContentType = 'preview' | 'featureImage' | 'metadata' | 'tags';

/**
 * Interface for content providers that generate specific types of content
 * Each provider is responsible for:
 * - Declaring which settings affect its content
 * - Determining when content needs regeneration
 * - Clearing and regenerating its content type
 */
export interface IContentProvider {
    /**
     * Gets the type of content this provider generates
     */
    getContentType(): ContentType;

    /**
     * Gets the list of settings that affect this content type
     * Used to monitor for changes that require regeneration
     */
    getRelevantSettings(): (keyof NotebookNavigatorSettings)[];

    /**
     * Determines if content needs to be regenerated based on settings changes
     * @param oldSettings - Previous settings
     * @param newSettings - New settings
     * @returns True if content should be cleared and regenerated
     */
    shouldRegenerate(oldSettings: NotebookNavigatorSettings, newSettings: NotebookNavigatorSettings): boolean;

    /**
     * Clears all content of this type from the database
     */
    clearContent(): Promise<void>;

    /**
     * Queues files for content generation
     * @param files - Files that need content generation
     */
    queueFiles(files: TFile[]): void;

    /**
     * Starts processing queued files
     * @param settings - Current plugin settings
     */
    startProcessing(settings: NotebookNavigatorSettings): void;

    /**
     * Stops any ongoing processing
     */
    stopProcessing(): void;

    /**
     * Notifies the provider that settings have changed
     * Used to update internal state if needed
     */
    onSettingsChanged(settings: NotebookNavigatorSettings): void;
}
