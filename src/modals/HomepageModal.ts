/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { App, TFile } from 'obsidian';
import { BaseSuggestModal } from './BaseSuggestModal';
import { strings } from '../i18n';
import { naturalCompare } from '../utils/sortUtils';
import { isSupportedHomepageExtension } from '../utils/homepageUtils';

/**
 * Modal for selecting the homepage file.
 * Allows users to select a Markdown, Canvas, or Excalidraw file as their homepage.
 */
export class HomepageModal extends BaseSuggestModal<TFile> {
    constructor(app: App, onChoose: (file: TFile) => void) {
        super(app, onChoose, strings.modals.homepage.placeholder, {
            navigate: strings.modals.homepage.instructions.navigate,
            action: strings.modals.homepage.instructions.select,
            dismiss: strings.modals.homepage.instructions.dismiss
        });
    }

    /**
     * Get all files that can be used as a homepage
     * Filters for supported file extensions and sorts them alphabetically
     */
    getItems(): TFile[] {
        const files = this.app.vault.getFiles().filter(file => isSupportedHomepageExtension(file.extension));
        files.sort((a, b) => naturalCompare(a.path, b.path));
        return files;
    }

    /**
     * Get the text to display for a file in the suggestion list
     */
    getItemText(file: TFile): string {
        return file.path;
    }

    /**
     * Get the display path for a file (used for rendering)
     */
    protected getDisplayPath(file: TFile): string {
        return file.path;
    }
}
