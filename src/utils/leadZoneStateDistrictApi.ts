const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL;
// Types for Zone and State
export interface Zone {
    id: string;
    name: string;
    code: string;
    state_count?: string;
}

export interface State {
    id: string;
    name: string;
    code: string;
    zone_id: string;
}

export interface District {
    id: string;
    name: string;
    state_id: string;
}

// Zone APIs
export const zoneApi = {
    getAll: async () => {
        const response = await fetch(`${AUTH_BASE_URL}/zones`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch zones');
        const data = await response.json();
        return data.data;
    },
    getById: async (id: string) => {
        const response = await fetch(`${AUTH_BASE_URL}/zones/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch zone');
        const data = await response.json();
        return data.data;
    }
};

// State APIs
export const stateApi = {
    getAll: async () => {
        const response = await fetch(`${AUTH_BASE_URL}/states`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch states');
        const data = await response.json();
        return data.data;
    },
    getById: async (id: string) => {
        const response = await fetch(`${AUTH_BASE_URL}/states/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch state');
        const data = await response.json();
        return data.data;
    }
};

// District APIs
export const districtApi = {
    getAll: async () => {
        const response = await fetch(`${AUTH_BASE_URL}/districts`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch districts');
        const data = await response.json();
        return data.data;
    },
    getById: async (id: string) => {
        const response = await fetch(`${AUTH_BASE_URL}/districts/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch district');
        const data = await response.json();
        return data.data;
    },
};
