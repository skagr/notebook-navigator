/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { strings } from '../i18n';
import { TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../types';

// Constants for virtual tag collection identifiers
export const VIRTUAL_TAG_COLLECTION_IDS = {
    TAGGED: TAGGED_TAG_ID,
    UNTAGGED: UNTAGGED_TAG_ID
} as const;

// Union type of all virtual tag collection IDs
export type VirtualTagCollectionId = (typeof VIRTUAL_TAG_COLLECTION_IDS)[keyof typeof VIRTUAL_TAG_COLLECTION_IDS];

// Definition structure for a virtual tag collection
export interface VirtualTagCollectionDefinition {
    id: VirtualTagCollectionId;
    getLabel: () => string;
}

// Registry of all available virtual tag collections with their localized labels
const virtualTagCollections: Record<VirtualTagCollectionId, VirtualTagCollectionDefinition> = {
    [VIRTUAL_TAG_COLLECTION_IDS.TAGGED]: {
        id: VIRTUAL_TAG_COLLECTION_IDS.TAGGED,
        getLabel: () => strings.tagList.tags
    },
    [VIRTUAL_TAG_COLLECTION_IDS.UNTAGGED]: {
        id: VIRTUAL_TAG_COLLECTION_IDS.UNTAGGED,
        getLabel: () => strings.tagList.untaggedLabel
    }
};

// Type guard to check if a value is a valid virtual tag collection ID
export function isVirtualTagCollectionId(value: string | null | undefined): value is VirtualTagCollectionId {
    if (!value) {
        return false;
    }
    return value === VIRTUAL_TAG_COLLECTION_IDS.TAGGED || value === VIRTUAL_TAG_COLLECTION_IDS.UNTAGGED;
}

// Retrieves the definition for a virtual tag collection
export function getVirtualTagCollection(value: VirtualTagCollectionId): VirtualTagCollectionDefinition {
    return virtualTagCollections[value];
}
