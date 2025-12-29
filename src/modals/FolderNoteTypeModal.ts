/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { App, Modal, TFolder } from 'obsidian';
import { strings } from '../i18n';
import { FolderNoteType } from '../types/folderNote';

interface ButtonBinding {
    button: HTMLButtonElement;
    handler: () => void;
}

/**
 * Modal for choosing folder note type when creating a new folder note
 */
class FolderNoteTypeModal extends Modal {
    private readonly buttonBindings: ButtonBinding[] = [];
    private hasResolved = false;

    constructor(
        app: App,
        private folder: TFolder,
        private onSelect: (value: FolderNoteType | null) => void
    ) {
        super(app);
    }

    onOpen(): void {
        this.modalEl.addClass('nn-folder-note-type-modal');
        this.titleEl.setText(strings.modals.folderNoteType.title);

        const infoEl = this.contentEl.createDiv('nn-folder-note-type-info');
        infoEl.setText(strings.modals.folderNoteType.folderLabel.replace('{name}', this.folder.name));

        const buttonContainer = this.contentEl.createDiv('nn-folder-note-type-buttons');

        const markdownButton = this.createTypeButton(buttonContainer, strings.settings.items.folderNoteType.options.markdown, 'markdown');

        this.createTypeButton(buttonContainer, strings.settings.items.folderNoteType.options.canvas, 'canvas');
        this.createTypeButton(buttonContainer, strings.settings.items.folderNoteType.options.base, 'base');

        const cancelButton = buttonContainer.createEl('button', {
            text: strings.common.cancel,
            cls: 'mod-warning'
        });
        this.bindButton(cancelButton, () => this.resolveAndClose(null));

        markdownButton.focus();

        this.scope.register([], 'Escape', evt => {
            evt.preventDefault();
            this.resolveAndClose(null);
        });
    }

    onClose(): void {
        for (const { button, handler } of this.buttonBindings) {
            button.removeEventListener('click', handler);
        }

        if (!this.hasResolved) {
            this.onSelect(null);
            this.hasResolved = true;
        }
    }

    private createTypeButton(container: HTMLElement, label: string, type: FolderNoteType): HTMLButtonElement {
        const button = container.createEl('button', { text: label });
        this.bindButton(button, () => this.resolveAndClose(type));
        return button;
    }

    private bindButton(button: HTMLButtonElement, handler: () => void): void {
        button.addEventListener('click', handler);
        this.buttonBindings.push({ button, handler });
    }

    private resolveAndClose(value: FolderNoteType | null): void {
        if (this.hasResolved) {
            return;
        }
        this.hasResolved = true;
        this.onSelect(value);
        this.close();
    }
}

/**
 * Opens folder note type modal and returns chosen type
 * @param app - Obsidian application instance
 * @param folder - Folder receiving new folder note
 * @returns Chosen folder note type or null if cancelled
 */
export function promptForFolderNoteType(app: App, folder: TFolder): Promise<FolderNoteType | null> {
    return new Promise(resolve => {
        const modal = new FolderNoteTypeModal(app, folder, resolve);
        modal.open();
    });
}
