/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { App, Plugin, TFolder } from 'obsidian';
import { TEMPLATER_PLUGIN_ID } from '../constants/pluginIds';
import { getPluginById, getRecordValue, isRecord } from './typeGuards';

export type TemplaterCreateNewNoteFromTemplateFn = (folder?: TFolder) => void | Promise<void>;

interface TemplaterFuzzySuggesterApi {
    create_new_note_from_template: TemplaterCreateNewNoteFromTemplateFn;
}

interface TemplaterPluginApi extends Plugin {
    fuzzy_suggester: TemplaterFuzzySuggesterApi;
}

function isTemplaterPlugin(plugin: Plugin | null): plugin is TemplaterPluginApi {
    if (!plugin) {
        return false;
    }

    const fuzzySuggester = getRecordValue(plugin, 'fuzzy_suggester');
    if (!isRecord(fuzzySuggester)) {
        return false;
    }

    const createNewNoteFromTemplate = getRecordValue(fuzzySuggester, 'create_new_note_from_template');
    return typeof createNewNoteFromTemplate === 'function';
}

export function getTemplaterCreateNewNoteFromTemplate(app: App): TemplaterCreateNewNoteFromTemplateFn | null {
    if (!isTemplaterPlugin(getPluginById(app, TEMPLATER_PLUGIN_ID))) {
        return null;
    }

    return (folder?: TFolder) => {
        const plugin = getPluginById(app, TEMPLATER_PLUGIN_ID);
        if (!isTemplaterPlugin(plugin)) {
            return;
        }

        return plugin.fuzzy_suggester.create_new_note_from_template(folder);
    };
}
