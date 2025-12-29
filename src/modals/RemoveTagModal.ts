/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { App, FuzzySuggestModal } from 'obsidian';
import { strings } from '../i18n';

/**
 * Modal for selecting a tag to remove from files
 * Shows only the tags that exist in the selected files
 */
export class RemoveTagModal extends FuzzySuggestModal<string> {
    private tags: string[];
    private onChooseTag: (tag: string) => void;

    /**
     * Creates a new RemoveTagModal
     * @param app - The Obsidian app instance
     * @param tags - Array of tag strings to choose from
     * @param onChooseTag - Callback when a tag is selected
     */
    constructor(app: App, tags: string[], onChooseTag: (tag: string) => void) {
        super(app);
        this.tags = tags;
        this.onChooseTag = onChooseTag;
        this.setPlaceholder(strings.modals.tagSuggest.removePlaceholder);
        this.setInstructions([
            { command: '↑↓', purpose: strings.modals.tagSuggest.instructions.navigate },
            { command: '↵', purpose: strings.modals.tagSuggest.instructions.remove },
            { command: 'esc', purpose: strings.modals.tagSuggest.instructions.dismiss }
        ]);
    }

    /**
     * Gets all tags available for removal
     * @returns Array of tag strings
     */
    getItems(): string[] {
        return this.tags;
    }

    /**
     * Gets the display text for a tag
     * @param tag - The tag string
     * @returns The display text with # prefix
     */
    getItemText(tag: string): string {
        return `#${tag}`;
    }

    /**
     * Handles when a tag is selected
     * @param tag - The selected tag
     * @param evt - The event that triggered the selection
     */
    onChooseItem(tag: string, _evt: MouseEvent | KeyboardEvent): void {
        this.onChooseTag(tag);
    }
}
