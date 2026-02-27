export const API_URL = "http://localhost:5000/api/v1";

export async function login(username, password) {
    const formData = new FormData();
    formData.append('username', username); // FastAPI OAuth2PasswordRequestForm expects 'username', not email
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login/access-token`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
}

export async function loginWithGoogle(credentialResponse) {
    const response = await fetch(`${API_URL}/auth/login/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialResponse),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Google Login failed');
    }

    return response.json();
}

export async function signup(userData) {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
    }

    return response.json();
}


export async function getGlobalForecast(days = 30, detailed = false, includeHistory = false) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/forecasting/global?days=${days}&detailed=${detailed}&include_history=${includeHistory}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch forecast');
    }
    return response.json();
}

export async function triggerTraining(autoTune = false) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/training/train?auto_tune=${autoTune}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Training request failed');
    }
    return response.json();
}

export async function getTrainingStatus() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/training/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error('Failed to get training status');
    }
    return response.json();
}

export async function getDashboardStats() {
    const token = localStorage.getItem('access_token');
    console.log("📡 Calling dashboard API with token:", token ? "✓ Present" : "✗ Missing");

    const response = await fetch(`${API_URL}/dashboard/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log("📥 Dashboard API response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType: response.headers.get('content-type')
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Dashboard API error:", errorText);
        throw new Error(`Failed to get dashboard stats: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("📊 Dashboard API returned data:", data);
    return data;
}

export async function uploadSalesData(file: File) {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error("No access token found");

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/ingestion/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
    }
    return response.json();
}

export async function getSalesTrend(days = 30) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/dashboard/trend?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
}

// User & Admin API
export async function getUsers() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get users');
    return response.json();
}

export async function deleteUser(userId: number) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
}

export async function updateUserRole(userId: number, role: string) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/users/${userId}/role?role=${role}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to update role');
    return response.json();
}

export async function createUser(userData: any) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create user');
    }
    return response.json();
}

export async function getMe() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const response = await fetch(`${API_URL}/users/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        // If 401, maybe clear token? 
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            return null;
        }
        throw new Error('Failed to fetch user profile');
    }
    return response.json();
}

// Inventory API
export async function getInventory(search?: string) {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams({ limit: "500" });
    if (search) params.set('search', search);
    const response = await fetch(`${API_URL}/inventory/?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get inventory');
    return response.json();
}

// Supply Chain API
export async function getSuppliers() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/supply-chain/suppliers`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get suppliers');
    return response.json();
}

export async function getOrders() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/supply-chain/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get orders');
    return response.json();
}

export async function getShipments() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/supply-chain/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get shipments');
    return response.json();
}

export async function createProduct(productData: any) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/inventory/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
}

export async function createSupplier(supplierData: any) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/supply-chain/suppliers`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierData)
    });
    if (!response.ok) throw new Error('Failed to create supplier');
    return response.json();
}

export async function createOrder(orderData: any) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/supply-chain/orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
}

export async function updateProduct(id: number, updates: any) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
}

export async function deleteProduct(id: number) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
}

export async function getDeadStock() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/inventory/dead-stock`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get dead stock');
    return response.json();
}

export async function updateMe(updates: any) {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    if (updates.full_name) params.append('full_name', updates.full_name);
    if (updates.email) params.append('email', updates.email);
    if (updates.password) params.append('password', updates.password);

    const response = await fetch(`${API_URL}/users/me?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
}


/**
 * Fetch all distinct dates that have sales records in the DB.
 * Used by the calendar to show blue dots on days with real data.
 * This always reflects the live database — not the ML model's training cutoff.
 */
export async function getSalesDates(): Promise<string[]> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/dashboard/sales-dates`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.dates ?? [];
}

export async function getSalesByDate(params: {
    date: string;
    store_id?: string;
    sku?: string;
    category?: string;
    onpromotion?: boolean | null;
}) {
    const token = localStorage.getItem('access_token');
    const query = new URLSearchParams({ date: params.date });
    if (params.store_id) query.set('store_id', params.store_id);
    if (params.sku) query.set('sku', params.sku);
    if (params.category) query.set('category', params.category);
    if (params.onpromotion !== null && params.onpromotion !== undefined)
        query.set('onpromotion', String(params.onpromotion));

    const response = await fetch(`${API_URL}/dashboard/sales-by-date?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch sales data');
    return response.json();
}
