import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getInventory } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'lowstock_notified_ids';

function getNotifiedIds(): Set<string> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function saveNotifiedIds(ids: Set<string>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

/**
 * Polls the inventory endpoint every 5 minutes.
 * Shows a Sonner warning toast for each newly-detected low-stock or out-of-stock item.
 * Already-notified items are tracked in localStorage so the user isn't spammed.
 * Resets the "notified" list at midnight so fresh alerts appear next day.
 */
export function useLowStockNotifier() {
    const { isAuthenticated } = useAuth();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        const check = async () => {
            try {
                const items = await getInventory();
                const notified = getNotifiedIds();
                let newNotified = false;

                const lowItems = items.filter(
                    (i: { status: string }) => i.status === 'low-stock' || i.status === 'out-of-stock'
                );

                const grouped: Record<string, { status: string; names: string[] }> = {};

                for (const item of lowItems) {
                    const key = `${item.id}-${item.status}`;
                    if (!notified.has(key)) {
                        notified.add(key);
                        newNotified = true;

                        const bucket = item.status;
                        if (!grouped[bucket]) grouped[bucket] = { status: bucket, names: [] };
                        grouped[bucket].names.push(item.product_name || item.sku);
                    }
                }

                if (newNotified) {
                    saveNotifiedIds(notified);
                }

                // Fire one grouped toast per status type
                for (const bucket of Object.values(grouped)) {
                    const label = bucket.status === 'out-of-stock' ? '🚨 Out of Stock' : '⚠️ Low Stock';
                    const color = bucket.status === 'out-of-stock' ? 'error' : 'warning';
                    const itemList = bucket.names.slice(0, 5).join(', ');
                    const extra = bucket.names.length > 5 ? ` +${bucket.names.length - 5} more` : '';

                    if (color === 'error') {
                        toast.error(`${label}: ${itemList}${extra}`, {
                            description: 'Stock has reached zero. Reorder immediately.',
                            duration: 8000,
                            id: `out-of-stock-${Date.now()}`,
                        });
                    } else {
                        toast.warning(`${label}: ${itemList}${extra}`, {
                            description: 'Stock is below the reorder threshold.',
                            duration: 6000,
                            id: `low-stock-${Date.now()}`,
                        });
                    }
                }
            } catch {
                // Silently fail – don't disrupt the UI if the poll fails
            }
        };

        // Run immediately on mount, then on schedule
        check();
        timerRef.current = setInterval(check, POLL_INTERVAL_MS);

        // Midnight reset so alerts fire fresh next day
        const now = new Date();
        const msUntilMidnight =
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
        const midnightTimer = setTimeout(() => {
            localStorage.removeItem(STORAGE_KEY);
        }, msUntilMidnight);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            clearTimeout(midnightTimer);
        };
    }, [isAuthenticated]);
}
