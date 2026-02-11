import { API_URL } from "./api";

const getHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Suppliers
export async function getSuppliers(skip = 0, limit = 100) {
    const response = await fetch(`${API_URL}/supply-chain/suppliers?skip=${skip}&limit=${limit}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch suppliers');
    return response.json();
}

export async function createSupplier(data: any) {
    const response = await fetch(`${API_URL}/supply-chain/suppliers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create supplier');
    return response.json();
}

// Purchase Orders
export async function getPurchaseOrders(skip = 0, limit = 100) {
    const response = await fetch(`${API_URL}/supply-chain/orders?skip=${skip}&limit=${limit}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch purchase orders');
    return response.json();
}

export async function createPurchaseOrder(data: any) {
    const response = await fetch(`${API_URL}/supply-chain/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create purchase order');
    return response.json();
}

// Shipments
export async function getShipments(skip = 0, limit = 100) {
    const response = await fetch(`${API_URL}/supply-chain/shipments?skip=${skip}&limit=${limit}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch shipments');
    return response.json();
}

export async function createShipment(data: any) {
    const response = await fetch(`${API_URL}/supply-chain/shipments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create shipment');
    return response.json();
}
