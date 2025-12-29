/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { FileView, Platform, type TFile, type WorkspaceLeaf } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { isSupportedHomepageFile } from '../../utils/homepageUtils';
import type { RevealFileOptions } from '../../hooks/useNavigatorReveal';
import WorkspaceCoordinator from './WorkspaceCoordinator';
import { getSupportedLeaves } from '../../types';

// Indicates what triggered the homepage opening
type HomepageTrigger = 'startup' | 'command';

interface WorkspaceReadyOptions {
    // Whether to activate the navigator view during workspace initialization
    shouldActivateOnStartup: boolean;
}

/**
 * Handles homepage resolution and opening behaviour, including deferred triggers
 * while the workspace is loading.
 */
export default class HomepageController {
    private readonly plugin: NotebookNavigatorPlugin;
    private readonly workspace: WorkspaceCoordinator;
    // Tracks whether workspace layout has finished loading
    private isWorkspaceReady = false;
    // Stores a deferred homepage trigger to execute once workspace is ready
    private pendingTrigger: HomepageTrigger | null = null;
    constructor(plugin: NotebookNavigatorPlugin, workspace: WorkspaceCoordinator) {
        this.plugin = plugin;
        this.workspace = workspace;
    }

    /**
     * Resolves the configured homepage path to a file object if valid
     */
    resolveHomepageFile(): TFile | null {
        const { homepage, mobileHomepage, useMobileHomepage } = this.plugin.settings;
        const useMobileOverride = Platform.isMobile && useMobileHomepage;

        const resolvePath = (path: string | null): TFile | null => {
            if (!path) {
                return null;
            }

            const candidate = this.plugin.app.vault.getAbstractFileByPath(path);
            if (!isSupportedHomepageFile(candidate)) {
                return null;
            }

            return candidate;
        };

        const primaryFile = resolvePath(useMobileOverride ? mobileHomepage : homepage);
        if (primaryFile) {
            return primaryFile;
        }

        if (useMobileOverride) {
            const fallbackFile = resolvePath(homepage);
            if (fallbackFile) {
                return fallbackFile;
            }
        }

        return null;
    }

    /**
     * Marks the workspace as ready and processes the pending homepage trigger.
     */
    async handleWorkspaceReady(options: WorkspaceReadyOptions): Promise<void> {
        this.isWorkspaceReady = true;

        if (this.plugin.isShuttingDown()) {
            return;
        }

        // Activate navigator view if configured to show on startup
        if (options.shouldActivateOnStartup) {
            await this.workspace.activateNavigatorView();
        }

        // Execute any deferred homepage trigger or default to startup
        const trigger = this.pendingTrigger ?? 'startup';
        this.pendingTrigger = null;
        await this.open(trigger);
    }

    /**
     * Opens the configured homepage file if it exists and conditions are met
     */
    async open(trigger: HomepageTrigger): Promise<boolean> {
        if (this.plugin.isShuttingDown()) {
            return false;
        }

        // Defer opening until workspace is ready
        if (!this.isWorkspaceReady && trigger !== 'startup') {
            this.pendingTrigger = trigger;
            return false;
        }

        const homepageFile = this.resolveHomepageFile();
        if (!homepageFile) {
            return false;
        }

        const shouldRevealInNavigator = trigger !== 'startup' || this.plugin.settings.autoRevealActiveFile;
        const revealOptions: RevealFileOptions = {
            source: trigger === 'startup' ? 'startup' : 'manual',
            isStartupReveal: trigger === 'startup',
            preserveNavigationFocus: this.plugin.settings.startView === 'navigation' && trigger === 'startup'
        };

        if (trigger === 'startup') {
            const existingLeaf = this.findExistingHomepageLeaf(homepageFile);
            if (existingLeaf) {
                const { workspace } = this.plugin.app;
                await workspace.revealLeaf(existingLeaf);
                workspace.setActiveLeaf(existingLeaf, { focus: true });
                if (shouldRevealInNavigator) {
                    this.workspace.revealFileInNearestFolder(homepageFile, revealOptions);
                }
                return true;
            }
        }

        // Reveal homepage in navigator
        if (shouldRevealInNavigator) {
            this.workspace.revealFileInNearestFolder(homepageFile, revealOptions);
        }

        // Open homepage file in the editor
        // Use command queue to track the homepage open operation if available
        const { commandQueue } = this.plugin;
        if (commandQueue) {
            const result = await commandQueue.executeHomepageOpen(homepageFile, () =>
                this.plugin.app.workspace.openLinkText(homepageFile.path, '', false)
            );

            return result.success;
        }

        // Fallback for when command queue is not available
        await this.plugin.app.workspace.openLinkText(homepageFile.path, '', false);
        return true;
    }

    /**
     * Finds an open workspace leaf that already hosts the configured homepage file.
     * Restricting this check to supported file leaves avoids iterating every workspace tab.
     */
    private findExistingHomepageLeaf(homepageFile: TFile): WorkspaceLeaf | null {
        const leaves = getSupportedLeaves(this.plugin.app);
        const targetPath = homepageFile.path;

        for (const leaf of leaves) {
            const resolvedPath = this.getLeafFilePath(leaf);
            if (resolvedPath === targetPath) {
                return leaf;
            }
        }
        return null;
    }

    /**
     * Gets the file path currently associated with a workspace leaf, falling back to stored view state.
     */
    private getLeafFilePath(leaf: WorkspaceLeaf): string | null {
        const { view } = leaf;
        if (view instanceof FileView && view.file) {
            return view.file.path;
        }

        const liveState = view?.getState?.();
        const liveStateFile = this.extractFilePath(liveState);
        if (liveStateFile) {
            return liveStateFile;
        }

        const persistedState = leaf.getViewState();
        return this.extractFilePath(persistedState.state);
    }

    /**
     * Extracts a file path from a view state object when available.
     */
    private extractFilePath(state: unknown): string | null {
        if (typeof state !== 'object' || state === null) {
            return null;
        }

        if (!Object.prototype.hasOwnProperty.call(state, 'file')) {
            return null;
        }

        const stateRecord = state as Record<string, unknown>;
        const fileValue = stateRecord.file;
        return typeof fileValue === 'string' ? fileValue : null;
    }
}
