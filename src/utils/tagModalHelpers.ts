/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import type { App, TFile } from 'obsidian';
import NotebookNavigatorPlugin from '../main';
import { TagOperations } from '../services/TagOperations';
import { TagSuggestModal } from '../modals/TagSuggestModal';
import { RemoveTagModal } from '../modals/RemoveTagModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import { strings } from '../i18n';
import { runAsyncAction } from './async';
import { showNotice } from './noticeUtils';

type TagAddResult = Awaited<ReturnType<TagOperations['addTagToFiles']>>;

interface AddTagModalOptions {
    includeUntagged?: boolean;
    allowTagCreation?: boolean;
    placeholderText?: string;
    actionText?: string;
    onComplete?: (result: TagAddResult) => void;
}

interface AddTagModalParams {
    app: App;
    plugin: NotebookNavigatorPlugin;
    tagOperations: TagOperations;
    files: TFile[];
    options?: AddTagModalOptions;
}

interface RemoveTagParams {
    app: App;
    tagOperations: TagOperations;
    files: TFile[];
    options?: {
        onComplete?: (removedCount: number) => void;
    };
}

interface RemoveAllTagsParams {
    app: App;
    tagOperations: TagOperations;
    files: TFile[];
    options?: {
        confirmActionLabel?: string;
        onComplete?: (clearedCount: number) => void;
    };
}

/**
 * Opens the add-tag modal and applies the selected tag to the provided files.
 */
export function openAddTagToFilesModal({ app, plugin, tagOperations, files, options }: AddTagModalParams): void {
    if (files.length === 0) {
        return;
    }

    // Ensure every file supports frontmatter tags before opening the modal
    const hasInvalidFile = files.some(file => file.extension !== 'md');
    if (hasInvalidFile) {
        showNotice(strings.fileSystem.notifications.tagsRequireMarkdown, { variant: 'warning' });
        return;
    }

    const includeUntagged = options?.includeUntagged ?? false;
    const allowTagCreation = options?.allowTagCreation ?? true;
    const placeholderText = options?.placeholderText ?? strings.modals.tagSuggest.addPlaceholder;
    const actionText = options?.actionText ?? strings.modals.tagSuggest.instructions.add;

    const modal = new TagSuggestModal(
        app,
        plugin,
        (tag: string) => {
            runAsyncAction(async () => {
                const result = await tagOperations.addTagToFiles(tag, files);

                if (result.added > 0) {
                    const successMessage =
                        result.added === 1
                            ? strings.fileSystem.notifications.tagAddedToNote
                            : strings.fileSystem.notifications.tagAddedToNotes.replace('{count}', result.added.toString());
                    showNotice(successMessage, { variant: 'success' });
                } else {
                    const skippedCount = result.skipped > 0 ? result.skipped : files.length;
                    const warningMessage = strings.dragDrop.notifications.filesAlreadyHaveTag.replace('{count}', skippedCount.toString());
                    showNotice(warningMessage, { variant: 'warning' });
                }

                options?.onComplete?.(result);
            });
        },
        placeholderText,
        actionText,
        includeUntagged,
        allowTagCreation
    );
    modal.open();
}

/**
 * Removes a tag from the provided files. If multiple tags exist, a modal is presented to choose which tag to remove.
 */
export async function removeTagFromFilesWithPrompt({ app, tagOperations, files, options }: RemoveTagParams): Promise<void> {
    if (files.length === 0) {
        return;
    }

    if (!files.every(file => file.extension === 'md')) {
        showNotice(strings.fileSystem.notifications.tagsRequireMarkdown, { variant: 'warning' });
        return;
    }

    const existingTags = tagOperations.getTagsFromFiles(files);
    if (existingTags.length === 0) {
        showNotice(strings.fileSystem.notifications.noTagsToRemove, { variant: 'warning' });
        return;
    }

    const showRemovalNotice = (removed: number) => {
        if (removed <= 0) {
            return;
        }
        const message =
            removed === 1
                ? strings.fileSystem.notifications.tagRemovedFromNote
                : strings.fileSystem.notifications.tagRemovedFromNotes.replace('{count}', removed.toString());
        showNotice(message, { variant: 'success' });
        options?.onComplete?.(removed);
    };

    if (existingTags.length === 1) {
        const removed = await tagOperations.removeTagFromFiles(existingTags[0], files);
        showRemovalNotice(removed);
        return;
    }

    const modal = new RemoveTagModal(app, existingTags, (tag: string) => {
        runAsyncAction(async () => {
            const removed = await tagOperations.removeTagFromFiles(tag, files);
            showRemovalNotice(removed);
        });
    });
    modal.open();
}

/**
 * Confirms and removes all tags from the provided files.
 */
export function confirmRemoveAllTagsFromFiles({ app, tagOperations, files, options }: RemoveAllTagsParams): void {
    if (files.length === 0) {
        return;
    }

    if (!files.every(file => file.extension === 'md')) {
        showNotice(strings.fileSystem.notifications.tagsRequireMarkdown, { variant: 'warning' });
        return;
    }

    const existingTags = tagOperations.getTagsFromFiles(files);
    if (existingTags.length === 0) {
        showNotice(strings.fileSystem.notifications.noTagsToRemove, { variant: 'warning' });
        return;
    }

    const confirmModal = new ConfirmModal(
        app,
        strings.modals.fileSystem.removeAllTagsTitle,
        files.length === 1
            ? strings.modals.fileSystem.removeAllTagsFromNote
            : strings.modals.fileSystem.removeAllTagsFromNotes.replace('{count}', files.length.toString()),
        () => {
            runAsyncAction(async () => {
                const cleared = await tagOperations.clearAllTagsFromFiles(files);
                if (cleared <= 0) {
                    return;
                }
                const message =
                    cleared === 1
                        ? strings.fileSystem.notifications.tagsClearedFromNote
                        : strings.fileSystem.notifications.tagsClearedFromNotes.replace('{count}', cleared.toString());
                showNotice(message, { variant: 'success' });
                options?.onComplete?.(cleared);
            });
        },
        options?.confirmActionLabel ?? strings.common.remove
    );
    confirmModal.open();
}
