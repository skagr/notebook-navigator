/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { TFile, TFolder } from 'obsidian';
import { ListPaneItemType, NavigationPaneItemType, VirtualFolder } from '../types';
import type { SearchResultMeta } from './search';
import { TagTreeNode } from '../types/storage';
import type { SearchShortcut, ShortcutEntry } from '../types/shortcuts';
import type { NoteCountInfo } from '../types/noteCounts';

export interface VirtualItem<T> {
    type: string;
    data: T;
    key: string;
    level?: number; // For hierarchical items
}

export interface ListPaneItem {
    type: ListPaneItemType;
    data: TFile | string; // File or header text
    parentFolder?: string | null;
    key: string;
    // Pre-computed file index for stable onClick handlers
    fileIndex?: number;
    // Indicates if this file is pinned
    isPinned?: boolean;
    searchMeta?: SearchResultMeta;
    // Pre-computed flag indicating if file has tags (for height calculation optimization)
    hasTags?: boolean;
    // Marks files that are normally hidden (frontmatter or excluded folders) but shown via "show hidden items"
    isHidden?: boolean;
}

export interface FolderTreeItem {
    type: typeof NavigationPaneItemType.FOLDER;
    data: TFolder;
    level: number;
    path: string;
    key: string;
    color?: string;
    backgroundColor?: string;
    icon?: string;
    parsedExcludedFolders?: string[];
    isExcluded?: boolean;
}

export interface TagTreeItem {
    type: typeof NavigationPaneItemType.TAG;
    data: TagTreeNode;
    level: number;
    path?: string;
    key: string;
    color?: string;
    backgroundColor?: string;
    icon?: string;
    isHidden?: boolean; // Marks tags that are normally hidden but being shown
}

export interface UntaggedItem {
    type: typeof NavigationPaneItemType.UNTAGGED;
    data: TagTreeNode;
    level: number;
    key: string;
    color?: string;
    backgroundColor?: string;
    icon?: string;
}

export interface VirtualFolderItem {
    type: typeof NavigationPaneItemType.VIRTUAL_FOLDER;
    data: VirtualFolder;
    level: number;
    key: string;
    isSelectable?: boolean;
    isSelected?: boolean;
    tagCollectionId?: string;
    // Pre-computed child presence flag used for rendering the expander chevron and for keyboard expand/collapse decisions.
    // Some virtual folders are backed by dynamic data (e.g. recent notes, shortcuts), where the source list can contain
    // entries that do not render (deleted/missing items). This flag reflects whether expansion would render any children.
    hasChildren?: boolean;
    showFileCount?: boolean;
    noteCount?: NoteCountInfo;
}

interface ShortcutNavigationBase {
    shortcut: ShortcutEntry;
    level: number;
    key: string;
    icon?: string;
    color?: string;
    backgroundColor?: string;
    isExcluded?: boolean;
    isMissing?: boolean;
    missingLabel?: string;
}

export interface ShortcutHeaderItem {
    type: typeof NavigationPaneItemType.SHORTCUT_HEADER;
    key: string;
    level: number;
    count: number;
}

export interface ShortcutFolderNavItem extends ShortcutNavigationBase {
    type: typeof NavigationPaneItemType.SHORTCUT_FOLDER;
    folder: TFolder | null;
}

export interface ShortcutNoteNavItem extends ShortcutNavigationBase {
    type: typeof NavigationPaneItemType.SHORTCUT_NOTE;
    note: TFile | null;
}

export interface RecentNoteNavItem {
    type: typeof NavigationPaneItemType.RECENT_NOTE;
    note: TFile;
    level: number;
    key: string;
    icon?: string;
    color?: string;
}

export interface ShortcutSearchNavItem extends ShortcutNavigationBase {
    type: typeof NavigationPaneItemType.SHORTCUT_SEARCH;
    searchShortcut: SearchShortcut;
}

export interface ShortcutTagNavItem extends ShortcutNavigationBase {
    type: typeof NavigationPaneItemType.SHORTCUT_TAG;
    tagPath: string;
    displayName: string;
}

export interface NavigationBannerItem {
    type: typeof NavigationPaneItemType.BANNER;
    key: string;
    path: string;
}

export interface RootSpacerItem {
    type: typeof NavigationPaneItemType.ROOT_SPACER;
    key: string;
    spacing: number;
}

export interface TopSpacerItem {
    type: typeof NavigationPaneItemType.TOP_SPACER;
    key: string;
    hasSeparator?: boolean;
}

export interface BottomSpacerItem {
    type: typeof NavigationPaneItemType.BOTTOM_SPACER;
    key: string;
}

export interface ListSpacerItem {
    type: typeof NavigationPaneItemType.LIST_SPACER;
    key: string;
    hasSeparator?: boolean;
}

export type CombinedNavigationItem =
    | FolderTreeItem
    | VirtualFolderItem
    | TagTreeItem
    | UntaggedItem
    | ShortcutHeaderItem
    | ShortcutFolderNavItem
    | ShortcutNoteNavItem
    | RecentNoteNavItem
    | ShortcutSearchNavItem
    | ShortcutTagNavItem
    | NavigationBannerItem
    | RootSpacerItem
    | TopSpacerItem
    | BottomSpacerItem
    | ListSpacerItem;
