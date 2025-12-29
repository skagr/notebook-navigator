/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 * All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NotebookNavigator-1.2
 *
 * Licensed under the Notebook Navigator License Agreement, Version 1.2.
 * See the LICENSE file in the repository root.
 */

import { useEffect, useRef } from 'react';
import { getIconService, useIconServiceVersion } from '../services/icons';

interface ServiceIconProps {
    iconId: string;
    size?: number;
    className?: string;
    'aria-label'?: string;
    'aria-hidden'?: boolean;
}

export function ServiceIcon({ iconId, size, className, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden }: ServiceIconProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const iconServiceVersion = useIconServiceVersion();

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        getIconService().renderIcon(ref.current, iconId, size);
    }, [iconId, iconServiceVersion, size]);

    return <span ref={ref} className={className} aria-label={ariaLabel} aria-hidden={ariaHidden} />;
}
