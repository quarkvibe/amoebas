import { useState, useEffect } from 'react';

export type WidgetId = 'metrics' | 'terminal' | 'activity' | 'status' | 'charts' | 'queue';

export interface DashboardLayout {
    metrics: boolean;
    terminal: boolean;
    activity: boolean;
    status: boolean;
    charts: boolean;
    queue: boolean;
}

const DEFAULT_LAYOUT: DashboardLayout = {
    metrics: true,
    terminal: true,
    activity: true,
    status: true,
    charts: true,
    queue: true,
};

const STORAGE_KEY = 'amoeba_dashboard_layout';

export function useDashboardLayout() {
    const [layout, setLayout] = useState<DashboardLayout>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
        } catch (e) {
            console.error('Failed to load dashboard layout', e);
            return DEFAULT_LAYOUT;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
        } catch (e) {
            console.error('Failed to save dashboard layout', e);
        }
    }, [layout]);

    const toggleWidget = (widgetId: WidgetId) => {
        setLayout(prev => ({
            ...prev,
            [widgetId]: !prev[widgetId]
        }));
    };

    const resetLayout = () => {
        setLayout(DEFAULT_LAYOUT);
    };

    return {
        layout,
        toggleWidget,
        resetLayout
    };
}
