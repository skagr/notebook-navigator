/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import React from 'react';
import type { DualPaneOrientation } from '../types';

interface SkeletonViewProps {
    paneSize: number;
    singlePane: boolean;
    searchActive: boolean;
    orientation: DualPaneOrientation;
}

export const SkeletonView = React.memo(function SkeletonView({ paneSize, singlePane, searchActive, orientation }: SkeletonViewProps) {
    const listPaneClass = searchActive ? 'nn-skeleton-list-pane nn-search-active' : 'nn-skeleton-list-pane';

    if (singlePane) {
        return (
            <div className={listPaneClass}>
                <div className="nn-skeleton-list-header" />
                {searchActive && <div className="nn-skeleton-search-bar" />}
                <div className="nn-skeleton-content" />
            </div>
        );
    }

    // Render vertical split layout
    if (orientation === 'vertical') {
        return (
            <>
                <div className="nn-skeleton-navigation-pane nn-skeleton-navigation-pane-vertical" style={{ flexBasis: `${paneSize}px` }}>
                    <div className="nn-skeleton-nav-header" />
                    <div className="nn-skeleton-content" />
                </div>
                <div className={`${listPaneClass} nn-skeleton-list-pane-vertical`}>
                    <div className="nn-skeleton-list-header" />
                    {searchActive && <div className="nn-skeleton-search-bar" />}
                    <div className="nn-skeleton-content" />
                </div>
            </>
        );
    }

    // Render horizontal split layout
    return (
        <>
            <div className="nn-skeleton-navigation-pane" style={{ width: `${paneSize}px` }}>
                <div className="nn-skeleton-nav-header" />
                <div className="nn-skeleton-content" />
            </div>
            <div className={listPaneClass}>
                <div className="nn-skeleton-list-header" />
                {searchActive && <div className="nn-skeleton-search-bar" />}
                <div className="nn-skeleton-content" />
            </div>
        </>
    );
});
