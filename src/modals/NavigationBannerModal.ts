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
import { isImageFile } from '../utils/fileTypeUtils';

/**
 * Modal for selecting the navigation banner image.
 * Filters vault files to only show supported image formats.
 */
export class NavigationBannerModal extends BaseSuggestModal<TFile> {
    constructor(app: App, onChoose: (file: TFile) => void) {
        super(app, onChoose, strings.modals.navigationBanner.placeholder, {
            navigate: strings.modals.navigationBanner.instructions.navigate,
            action: strings.modals.navigationBanner.instructions.select,
            dismiss: strings.modals.navigationBanner.instructions.dismiss
        });
    }

    /**
     * Get all image files available in the vault, sorted by path.
     */
    getItems(): TFile[] {
        const files = this.app.vault.getFiles().filter(file => isImageFile(file));
        files.sort((first, second) => naturalCompare(first.path, second.path));
        return files;
    }

    /**
     * Display file path for each suggestion row.
     */
    getItemText(file: TFile): string {
        return file.path;
    }

    /**
     * Display path is identical to item text for consistency.
     */
    protected getDisplayPath(file: TFile): string {
        return file.path;
    }
}
