/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

export type ExternalIconProviderId =
    | 'bootstrap-icons'
    | 'fontawesome-solid'
    | 'material-icons'
    | 'phosphor'
    | 'rpg-awesome'
    | 'simple-icons';

export interface ExternalIconManifest {
    version: string;
    font: string;
    metadata: string;
    fontMimeType?: string;
    metadataFormat?: 'json';
    checksum?: string;
}

export interface ExternalIconProviderConfig {
    id: ExternalIconProviderId;
    name: string;
    manifestUrl: string;
    fontFamily: string;
    catalogUrl: string;
}

export const EXTERNAL_ICON_PROVIDERS: Record<ExternalIconProviderId, ExternalIconProviderConfig> = {
    'bootstrap-icons': {
        id: 'bootstrap-icons',
        name: 'Bootstrap Icons',
        manifestUrl: 'https://raw.githubusercontent.com/johansan/notebook-navigator/main/icon-assets/bootstrap-icons/latest.json',
        fontFamily: 'NotebookNavigatorBootstrapIcons',
        catalogUrl: 'https://icons.getbootstrap.com/'
    },
    'fontawesome-solid': {
        id: 'fontawesome-solid',
        name: 'Font Awesome',
        manifestUrl: 'https://raw.githubusercontent.com/johansan/notebook-navigator/main/icon-assets/fontawesome/latest.json',
        fontFamily: 'NotebookNavigatorFontAwesomeSolid',
        catalogUrl: 'https://fontawesome.com/'
    },
    'material-icons': {
        id: 'material-icons',
        name: 'Material Icons',
        manifestUrl: 'https://raw.githubusercontent.com/johansan/notebook-navigator/main/icon-assets/material-icons/latest.json',
        fontFamily: 'NotebookNavigatorMaterialIcons',
        catalogUrl: 'https://fonts.google.com/icons'
    },
    phosphor: {
        id: 'phosphor',
        name: 'Phosphor Icons',
        manifestUrl: 'https://raw.githubusercontent.com/johansan/notebook-navigator/main/icon-assets/phosphor/latest.json',
        fontFamily: 'NotebookNavigatorPhosphorIcons',
        catalogUrl: 'https://phosphoricons.com/'
    },
    'rpg-awesome': {
        id: 'rpg-awesome',
        name: 'RPG Awesome',
        manifestUrl: 'https://raw.githubusercontent.com/johansan/notebook-navigator/main/icon-assets/rpg-awesome/latest.json',
        fontFamily: 'NotebookNavigatorRpgAwesome',
        catalogUrl: 'https://nagoshiashumari.github.io/Rpg-Awesome/'
    },
    'simple-icons': {
        id: 'simple-icons',
        name: 'Simple Icons',
        manifestUrl: 'https://raw.githubusercontent.com/johansan/notebook-navigator/main/icon-assets/simple-icons/latest.json',
        fontFamily: 'NotebookNavigatorSimpleIcons',
        catalogUrl: 'https://simpleicons.org/'
    }
};
