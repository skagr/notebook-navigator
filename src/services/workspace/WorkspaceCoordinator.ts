/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { TFile, WorkspaceLeaf } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { NOTEBOOK_NAVIGATOR_VIEW } from '../../types';
import { NotebookNavigatorView } from '../../view/NotebookNavigatorView';
import type { RevealFileOptions } from '../../hooks/useNavigatorReveal';

/**
 * Coordinates interactions with Obsidian's workspace that relate to the Notebook Navigator view.
 * Handles creation/focusing of the view and delegates reveal operations to the React layer.
 */
export default class WorkspaceCoordinator {
    private readonly plugin: NotebookNavigatorPlugin;

    constructor(plugin: NotebookNavigatorPlugin) {
        this.plugin = plugin;
    }

    /**
     * Ensures the navigator view exists in the workspace and returns the active leaf for it.
     */
    async activateNavigatorView(): Promise<WorkspaceLeaf | null> {
        const { workspace } = this.plugin.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_VIEW);

        if (leaves.length > 0) {
            // Navigator exists, reveal the first instance
            leaf = leaves[0];
            await workspace.revealLeaf(leaf);
        } else {
            // Create navigator in left sidebar
            leaf = workspace.getLeftLeaf(false);
            if (leaf) {
                await leaf.setViewState({ type: NOTEBOOK_NAVIGATOR_VIEW, active: true });
                await workspace.revealLeaf(leaf);
            }
        }

        return leaf;
    }

    /**
     * Retrieves all workspace leaves hosting the navigator view.
     */
    public getNavigatorLeaves(): WorkspaceLeaf[] {
        return this.plugin.app.workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_VIEW);
    }

    /**
     * Reveals a file in its actual parent folder across all navigator views.
     * This is a "manual" reveal that always navigates to the file's true location.
     */
    revealFileInActualFolder(file: TFile, options?: RevealFileOptions): void {
        this.getNavigatorLeaves().forEach(leaf => {
            const { view } = leaf;
            if (view instanceof NotebookNavigatorView) {
                view.navigateToFile(file, options);
            }
        });
    }

    /**
     * Reveals a file while attempting to preserve the current navigation context.
     * This is an "auto" reveal used during file opens and homepage loading.
     */
    revealFileInNearestFolder(file: TFile, options?: RevealFileOptions): void {
        this.getNavigatorLeaves().forEach(leaf => {
            const { view } = leaf;
            if (view instanceof NotebookNavigatorView) {
                view.revealFileInNearestFolder(file, options);
            }
        });
    }
}
