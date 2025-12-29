/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { useCallback } from 'react';
import { TFile, WorkspaceLeaf } from 'obsidian';
import { useServices } from '../context/ServicesContext';
import { runAsyncAction } from '../utils/async';

interface OpenFileOptions {
    /** Optional target leaf for opening the file */
    leaf?: WorkspaceLeaf | null;
    /** Whether to activate the leaf after opening */
    active?: boolean;
}

/**
 * Provides a queue-aware helper for opening files in the workspace.
 * Uses the command queue when available to serialize operations.
 */
export function useFileOpener() {
    const { app, commandQueue } = useServices();

    return useCallback(
        (file: TFile | null, options?: OpenFileOptions) => {
            if (!file) {
                return;
            }

            const openFile = async () => {
                const targetLeaf = options?.leaf ?? app.workspace.getLeaf(false);
                if (!targetLeaf) {
                    return;
                }
                const active = options?.active ?? false;
                await targetLeaf.openFile(file, { active });
            };

            if (commandQueue) {
                // Use command queue to serialize file operations
                runAsyncAction(() => commandQueue.executeOpenActiveFile(file, openFile));
                return;
            }

            // Open file directly with async error handling
            runAsyncAction(() => openFile());
        },
        [app.workspace, commandQueue]
    );
}
