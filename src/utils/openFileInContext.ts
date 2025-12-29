/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { App, PaneType, TFile } from 'obsidian';
import type { CommandQueueService } from '../services/CommandQueueService';

interface OpenFileInContextParams {
    app: App;
    commandQueue: CommandQueueService | null;
    file: TFile;
    context: PaneType;
    active?: boolean;
}

/**
 * Opens a file in a new workspace context (tab, split, window) while respecting the command queue.
 */
export async function openFileInContext({ app, commandQueue, file, context, active = true }: OpenFileInContextParams): Promise<void> {
    // Define the file opening operation
    const openFile = async () => {
        const leaf = app.workspace.getLeaf(context);
        if (!leaf) {
            throw new Error(`Unable to open file in ${context} context: leaf not available`);
        }
        await leaf.openFile(file, { active });
    };

    // Execute through command queue if available to track file open context
    if (commandQueue) {
        await commandQueue.executeOpenInNewContext(file, context, openFile);
        return;
    }

    // Otherwise open directly
    await openFile();
}
