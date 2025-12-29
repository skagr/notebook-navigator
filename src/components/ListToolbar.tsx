/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { useSelectionState } from '../context/SelectionContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { strings } from '../i18n';
import { ServiceIcon } from './ServiceIcon';
import { useListActions } from '../hooks/useListActions';
import { runAsyncAction } from '../utils/async';
import { resolveUXIcon } from '../utils/uxIcons';

interface ListToolbarProps {
    isSearchActive?: boolean;
    onSearchToggle?: () => void;
}

export function ListToolbar({ isSearchActive, onSearchToggle }: ListToolbarProps) {
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const selectionState = useSelectionState();
    const settings = useSettingsState();
    const listVisibility = settings.toolbarVisibility.list;

    // Use the shared actions hook
    const {
        handleNewFile,
        handleAppearanceMenu,
        handleSortMenu,
        handleToggleDescendants,
        getCurrentSortOption,
        isCustomSort,
        hasCustomAppearance
    } = useListActions();

    const showSearchButton = listVisibility.search;
    const showDescendantsButton = listVisibility.descendants;
    const showSortButton = listVisibility.sort;
    const showAppearanceButton = listVisibility.appearance;
    const showNewNoteButton = listVisibility.newNote;

    const leftButtonCount = [showSearchButton, showDescendantsButton, showSortButton, showAppearanceButton].filter(Boolean).length;
    const totalButtonCount = leftButtonCount + (showNewNoteButton ? 1 : 0);
    const leftGroupClassName = leftButtonCount === 1 ? 'nn-mobile-toolbar-circle' : 'nn-mobile-toolbar-pill';
    const leftButtonBaseClassName =
        leftButtonCount === 1 ? 'nn-mobile-toolbar-button nn-mobile-toolbar-button-circle' : 'nn-mobile-toolbar-button';

    if (totalButtonCount === 0) {
        return null;
    }

    return (
        <div className="nn-mobile-toolbar">
            <div className="nn-mobile-toolbar-left">
                {leftButtonCount > 0 ? (
                    <div className={leftGroupClassName}>
                        {showSearchButton ? (
                            <button
                                className={`${leftButtonBaseClassName}${isSearchActive ? ' nn-mobile-toolbar-button-active' : ''}`}
                                aria-label={strings.paneHeader.search}
                                onClick={onSearchToggle}
                                disabled={!selectionState.selectedFolder && !selectionState.selectedTag}
                                tabIndex={-1}
                            >
                                <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-search')} />
                            </button>
                        ) : null}
                        {showDescendantsButton ? (
                            <button
                                className={`${leftButtonBaseClassName}${includeDescendantNotes ? ' nn-mobile-toolbar-button-active' : ''}`}
                                aria-label={strings.paneHeader.toggleDescendantNotes}
                                onClick={handleToggleDescendants}
                                disabled={!selectionState.selectedFolder && !selectionState.selectedTag}
                                tabIndex={-1}
                            >
                                <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-descendants')} />
                            </button>
                        ) : null}
                        {showSortButton ? (
                            <button
                                className={`${leftButtonBaseClassName}${isCustomSort ? ' nn-mobile-toolbar-button-active' : ''}`}
                                aria-label={strings.paneHeader.changeSortOrder}
                                onClick={handleSortMenu}
                                disabled={!selectionState.selectedFolder && !selectionState.selectedTag}
                                tabIndex={-1}
                            >
                                <ServiceIcon
                                    iconId={resolveUXIcon(
                                        settings.interfaceIcons,
                                        getCurrentSortOption().endsWith('-desc') ? 'list-sort-descending' : 'list-sort-ascending'
                                    )}
                                />
                            </button>
                        ) : null}
                        {showAppearanceButton ? (
                            <button
                                className={`${leftButtonBaseClassName}${hasCustomAppearance ? ' nn-mobile-toolbar-button-active' : ''}`}
                                aria-label={strings.paneHeader.changeAppearance}
                                onClick={handleAppearanceMenu}
                                disabled={!selectionState.selectedFolder && !selectionState.selectedTag}
                                tabIndex={-1}
                            >
                                <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-appearance')} />
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {showNewNoteButton ? (
                <div className="nn-mobile-toolbar-right">
                    <div className="nn-mobile-toolbar-circle">
                        <button
                            className="nn-mobile-toolbar-button nn-mobile-toolbar-button-circle"
                            aria-label={strings.paneHeader.newNote}
                            onClick={() => {
                                runAsyncAction(() => handleNewFile());
                            }}
                            disabled={!selectionState.selectedFolder}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-new-note')} />
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
