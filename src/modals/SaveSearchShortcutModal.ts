/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { App, Modal, Setting } from 'obsidian';
import { strings } from '../i18n';
import { runAsyncAction } from '../utils/async';
import { showNotice } from '../utils/noticeUtils';

/**
 * Options for initializing the SaveSearchShortcutModal
 */
interface SaveSearchShortcutModalOptions {
    initialName: string;
    onSubmit: (name: string) => Promise<boolean> | boolean;
}

/**
 * Modal for saving a search query as a shortcut.
 * Allows user to provide a custom name for the saved search.
 */
export class SaveSearchShortcutModal extends Modal {
    private name: string;
    private readonly onSubmitHandler: SaveSearchShortcutModalOptions['onSubmit'];

    constructor(app: App, { initialName, onSubmit }: SaveSearchShortcutModalOptions) {
        super(app);
        this.name = initialName;
        this.onSubmitHandler = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('nn-modal');

        contentEl.createEl('h2', { text: strings.searchInput.shortcutModalTitle });

        // Input field for shortcut name
        new Setting(contentEl).setName(strings.searchInput.shortcutNameLabel).addText(text => {
            text.setPlaceholder(strings.searchInput.shortcutNamePlaceholder)
                .setValue(this.name)
                .onChange(value => {
                    this.name = value;
                });
            // Submit on Enter key
            text.inputEl.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    runAsyncAction(() => this.handleSubmit());
                }
            });
            // Auto-focus and select text for easy editing
            text.inputEl.focus();
            text.inputEl.setSelectionRange(0, this.name.length);
        });

        // Action buttons
        const actions = new Setting(contentEl);
        actions.addButton(button =>
            button.setButtonText(strings.common.cancel).onClick(() => {
                this.close();
            })
        );
        actions.addButton(button =>
            button
                .setCta()
                .setButtonText(strings.common.submit)
                .onClick(() => {
                    runAsyncAction(() => this.handleSubmit());
                })
        );
    }

    /**
     * Validates input and calls the submit handler.
     * Shows an error notice if the name is empty.
     */
    private async handleSubmit(): Promise<void> {
        const trimmedName = this.name.trim();
        if (trimmedName.length === 0) {
            showNotice(strings.shortcuts.emptySearchName, { variant: 'warning' });
            return;
        }

        const result = await this.onSubmitHandler(trimmedName);
        if (result !== false) {
            this.close();
        }
    }
}
