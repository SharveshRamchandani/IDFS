import { API_URL } from './api';

export interface ForecastData {
    ds: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
}

export interface DemandForecastResponse {
    forecast: ForecastData[];
    method: string;
    components?: {
        trend?: { ds: string, trend: number }[];
        yearly?: { ds: string, yearly: number }[];
        weekly?: { ds: string, weekly: number }[];
    }
}

export interface AccuracyMetrics {
    RMSE: number;
    MAE: number;
    MAPE?: string; // Sometimes formatted as string "12.5%" or number
}

export interface AccuracyResponse {
    status: "evaluated" | "not_evaluated";
    metrics?: AccuracyMetrics;
    message?: string;
}

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
}

export const forecastingApi = {
    getGlobalForecast: async (days: number = 30, detailed: boolean = false) => {
        return fetchWithAuth<DemandForecastResponse>(`/forecasting/global?days=${days}&detailed=${detailed}`);
    },

    getAccuracy: async () => {
        return fetchWithAuth<AccuracyResponse>('/forecasting/accuracy');
    },

    simulateScenario: async (days: number, promotionSchedule: number[]) => {
        return fetchWithAuth<{ scenario_forecast: ForecastData[] }>('/forecasting/simulate', {
            method: 'POST',
            body: JSON.stringify({
                days,
                promotion_schedule: promotionSchedule
            })
        });
    }
};
