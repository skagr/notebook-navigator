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
import { runAsyncAction, type MaybePromise } from '../utils/async';

/**
 * Modal dialog for confirming destructive actions
 * Used primarily for delete confirmations with a warning-styled confirm button
 * Provides Cancel and Delete buttons with appropriate styling
 */
export class ConfirmModal extends Modal {
    private cancelBtn: HTMLButtonElement;
    private cancelHandler: () => void;
    private confirmBtn: HTMLButtonElement;
    private confirmHandler: () => void;

    /**
     * Creates a confirmation modal with title, message, and callback
     * @param app - The Obsidian app instance
     * @param title - Modal title (e.g., "Delete 'filename'?")
     * @param message - Confirmation message to display
     * @param onConfirm - Callback to execute when user confirms the action
     * @param confirmButtonText - Optional custom text for the confirm button (defaults to "Delete")
     */
    constructor(
        app: App,
        title: string,
        message: string,
        private onConfirm: () => MaybePromise,
        confirmButtonText?: string,
        options?: { buildContent?: (container: HTMLElement) => void }
    ) {
        super(app);
        this.titleEl.setText(title);
        if (message) {
            this.contentEl.createEl('p', { text: message });
        }

        if (options?.buildContent) {
            options.buildContent(this.contentEl);
        }

        const buttonContainer = this.contentEl.createDiv('nn-button-container');

        // Store references for cleanup
        this.cancelHandler = () => this.close();
        this.confirmHandler = () => {
            this.close();
            this.triggerConfirm();
        };

        this.cancelBtn = buttonContainer.createEl('button', { text: strings.common.cancel });
        this.cancelBtn.addEventListener('click', this.cancelHandler);

        this.confirmBtn = buttonContainer.createEl('button', {
            text: confirmButtonText || strings.common.delete,
            cls: 'mod-warning'
        });
        this.confirmBtn.addEventListener('click', this.confirmHandler);

        // Keyboard shortcuts
        this.scope.register([], 'Enter', evt => {
            evt.preventDefault();
            this.close();
            this.triggerConfirm();
        });
        this.scope.register([], 'Escape', evt => {
            evt.preventDefault();
            this.close();
        });
    }

    /**
     * Cleanup event listeners when modal is closed
     * Prevents memory leaks by removing all event listeners
     */
    onClose() {
        if (this.cancelBtn && this.cancelHandler) {
            this.cancelBtn.removeEventListener('click', this.cancelHandler);
        }
        if (this.confirmBtn && this.confirmHandler) {
            this.confirmBtn.removeEventListener('click', this.confirmHandler);
        }
    }

    /**
     * Executes the confirmation callback asynchronously
     */
    private triggerConfirm(): void {
        runAsyncAction(() => this.onConfirm());
    }
}
