/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { App, Modal } from 'obsidian';
import { strings } from '../i18n';
import { runAsyncAction } from '../utils/async';

interface TagRenameModalOptions {
    tagPath: string;
    affectedCount: number;
    sampleFiles: string[];
    initialValue?: string;
    onSubmit: (newName: string) => Promise<boolean> | boolean;
}

/**
 * Modal dialog used to collect a new tag name and show affected files.
 * Displays a short preview list to highlight that the rename updates file content.
 */
export class TagRenameModal extends Modal {
    private readonly tagPath: string;
    private readonly affectedCount: number;
    private readonly sampleFiles: string[];
    private readonly initialValue: string;
    private readonly onSubmit: (newName: string) => Promise<boolean> | boolean;

    private inputEl!: HTMLInputElement;
    private submitBtn!: HTMLButtonElement;

    constructor(app: App, options: TagRenameModalOptions) {
        super(app);
        this.tagPath = options.tagPath;
        this.affectedCount = options.affectedCount;
        this.sampleFiles = options.sampleFiles;
        this.initialValue = options.initialValue ?? options.tagPath;
        this.onSubmit = options.onSubmit;
    }

    /**
     * Renders the modal content including input field, affected files preview, and action buttons
     */
    onOpen(): void {
        const tagLabel = `#${this.tagPath}`;
        const countLabel = this.affectedCount === 1 ? strings.modals.tagOperation.file : strings.modals.tagOperation.files;

        this.titleEl.setText(strings.modals.tagOperation.renameTitle.replace('{tag}', tagLabel));

        const description = this.contentEl.createDiv('nn-tag-rename-description');
        description.setText(
            strings.modals.tagOperation.renameWarning
                .replace('{oldTag}', tagLabel)
                .replace('{count}', this.affectedCount.toString())
                .replace('{files}', countLabel)
        );

        const inputContainer = this.contentEl.createDiv('nn-tag-rename-input-container');
        const label = inputContainer.createEl('label', { text: strings.modals.tagOperation.newTagPrompt });
        label.htmlFor = 'nn-tag-rename-input';

        this.inputEl = inputContainer.createEl('input', {
            type: 'text',
            attr: { id: 'nn-tag-rename-input' },
            value: this.initialValue,
            placeholder: strings.modals.tagOperation.newTagPlaceholder
        });
        this.inputEl.addClass('nn-input');
        this.inputEl.addEventListener('input', () => this.updateSubmitState());

        const warning = this.contentEl.createEl('p', {
            text: strings.modals.tagOperation.modificationWarning
        });
        warning.addClass('nn-tag-rename-warning');

        if (this.sampleFiles.length > 0) {
            const listContainer = this.contentEl.createDiv('nn-tag-rename-file-preview');
            listContainer.createEl('h4', { text: strings.modals.tagOperation.affectedFiles });
            const list = listContainer.createEl('ul');
            this.sampleFiles.forEach(fileName => {
                list.createEl('li', { text: fileName });
            });
            const remaining = this.affectedCount - this.sampleFiles.length;
            if (remaining > 0) {
                listContainer.createEl('p', {
                    text: strings.modals.tagOperation.andMore.replace('{count}', remaining.toString())
                });
            }
        }

        const buttonContainer = this.contentEl.createDiv('nn-button-container');
        const cancelBtn = buttonContainer.createEl('button', { text: strings.common.cancel });
        cancelBtn.addEventListener('click', () => this.close());

        this.submitBtn = buttonContainer.createEl('button', {
            text: strings.modals.tagOperation.confirmRename,
            cls: 'mod-cta'
        });
        this.submitBtn.addEventListener('click', () => {
            runAsyncAction(() => this.handleSubmit());
        });

        this.scope.register([], 'Enter', event => {
            if (document.activeElement === this.inputEl) {
                event.preventDefault();
                runAsyncAction(() => this.handleSubmit());
            }
        });

        this.updateSubmitState();
        this.inputEl.focus();
        this.inputEl.select();
    }

    /**
     * Cleans up modal content when closed
     */
    onClose(): void {
        this.contentEl.empty();
    }

    /**
     * Enables or disables submit button based on input validity
     */
    private updateSubmitState(): void {
        if (!this.submitBtn) {
            return;
        }
        const newValue = this.inputEl.value.trim();
        const disabled = newValue.length === 0 || newValue === this.tagPath;
        this.submitBtn.toggleClass('mod-disabled', disabled);
        this.submitBtn.disabled = disabled;
    }

    /**
     * Validates input and invokes the submit callback, closing modal on success
     */
    private async handleSubmit(): Promise<void> {
        const newName = this.inputEl.value.trim();
        if (newName.length === 0 || newName === this.tagPath) {
            return;
        }

        const shouldClose = await this.onSubmit(newName);
        if (shouldClose) {
            this.close();
        }
    }
}
