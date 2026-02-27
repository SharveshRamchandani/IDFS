import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    IconCalendar,
    IconSearch,
    IconDownload,
    IconLoader2,
    IconFilter,
    IconShoppingCart,
    IconBuildingStore,
    IconBox,
    IconCurrencyDollar,
    IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { getSalesByDate, getSalesDates } from "@/lib/api";
import { exportToCSV } from "@/lib/exportCsv";

// ── helpers ──────────────────────────────────────────────────────────────────

function toIso(d: Date): string {
    return d.toISOString().split("T")[0];
}

function fmtDate(d: Date): string {
    return d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// ── component ─────────────────────────────────────────────────────────────────

export default function SalesByDate() {
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Filters
    const [storeFilter, setStoreFilter] = useState("");
    const [skuFilter, setSkuFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [promoFilter, setPromoFilter] = useState<"all" | "yes" | "no">("all");

    const dateStr = toIso(selectedDate);

    // Fetch sales-dates for calendar dots
    const { data: salesDatesRaw } = useQuery({
        queryKey: ["sales-dates"],
        queryFn: getSalesDates,
        staleTime: 60_000,
    });
    const salesDates = useMemo(
        () => (salesDatesRaw ?? []).map((d) => new Date(d + "T00:00:00")),
        [salesDatesRaw]
    );

    // Fetch sales for selected date (no server-side filters — client-side filter is fast enough)
    const { data, isLoading, error } = useQuery({
        queryKey: ["sales-by-date", dateStr],
        queryFn: () => getSalesByDate({ date: dateStr }),
        enabled: !!dateStr,
    });

    const allRecords: any[] = data?.records ?? [];
    const summary = data?.summary;

    // Client-side filtering
    const filtered = useMemo(() => {
        return allRecords.filter((r) => {
            if (storeFilter && !r.store_id.toLowerCase().includes(storeFilter.toLowerCase())) return false;
            if (skuFilter && !r.sku.toLowerCase().includes(skuFilter.toLowerCase())) return false;
            if (categoryFilter && !r.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
            if (promoFilter === "yes" && !r.onpromotion) return false;
            if (promoFilter === "no" && r.onpromotion) return false;
            return true;
        });
    }, [allRecords, storeFilter, skuFilter, categoryFilter, promoFilter]);

    const filteredQty = filtered.reduce((s, r) => s + r.quantity, 0);
    const filteredRevenue = filtered.reduce((s, r) => s + r.revenue, 0);

    const hasFilters = storeFilter || skuFilter || categoryFilter || promoFilter !== "all";

    const clearFilters = () => {
        setStoreFilter("");
        setSkuFilter("");
        setCategoryFilter("");
        setPromoFilter("all");
    };

    const handleExport = () => {
        exportToCSV(
            `sales_${dateStr}.csv`,
            filtered.map((r) => ({
                Date: dateStr,
                SKU: r.sku,
                Product: r.product_name,
                Category: r.category,
                Store: r.store_id,
                Region: r.region,
                Quantity: r.quantity,
                Price: r.price,
                Revenue: r.revenue,
                "On Promotion": r.onpromotion ? "Yes" : "No",
            }))
        );
    };

    return (
        <DashboardLayout title="Sales Explorer">
            <div className="space-y-5">

                {/* ── Top bar ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Daily Sales Records</h2>
                        <p className="text-sm text-muted-foreground">
                            Browse and filter all transactions for any date
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Date picker */}
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="gap-2 min-w-[200px] justify-start">
                                    <IconCalendar className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">{fmtDate(selectedDate)}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                {/* Legend */}
                                <div className="px-3 pt-2 pb-1 flex items-center gap-3 text-xs text-muted-foreground border-b">
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                                        Days with data
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                                        Today
                                    </span>
                                </div>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(d) => {
                                        if (d) { setSelectedDate(d); setCalendarOpen(false); }
                                    }}
                                    modifiers={{ hasSalesData: salesDates }}
                                    modifiersClassNames={{ hasSalesData: "has-sales-dot" }}
                                    className="p-3"
                                />
                            </PopoverContent>
                        </Popover>

                        <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
                            <IconDownload className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* ── KPI summary cards ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        {
                            icon: IconShoppingCart,
                            label: "Total Records",
                            value: isLoading ? "—" : (hasFilters ? filtered.length : summary?.total_records ?? 0).toLocaleString(),
                            sub: hasFilters ? `of ${summary?.total_records ?? 0} total` : "transactions",
                        },
                        {
                            icon: IconBox,
                            label: "Total Quantity",
                            value: isLoading ? "—" : (hasFilters ? filteredQty : summary?.total_quantity ?? 0).toLocaleString(),
                            sub: "units sold",
                        },
                        {
                            icon: IconCurrencyDollar,
                            label: "Total Revenue",
                            value: isLoading ? "—" : `$${(hasFilters ? filteredRevenue : summary?.total_revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            sub: "gross revenue",
                        },
                        {
                            icon: IconBuildingStore,
                            label: "Stores",
                            value: isLoading ? "—" : (hasFilters ? new Set(filtered.map((r) => r.store_id)).size : summary?.unique_stores ?? 0),
                            sub: `${summary?.unique_skus ?? 0} unique SKUs`,
                        },
                    ].map((kpi) => (
                        <Card key={kpi.label} className="bg-sidebar-background">
                            <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                                <CardDescription className="text-xs">{kpi.label}</CardDescription>
                                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Filters row ── */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <IconFilter className="h-4 w-4" />
                                Filters
                            </CardTitle>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs gap-1">
                                    <IconX className="h-3 w-3" /> Clear all
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="relative">
                                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="filter-store"
                                    placeholder="Store ID…"
                                    value={storeFilter}
                                    onChange={(e) => setStoreFilter(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <div className="relative">
                                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="filter-sku"
                                    placeholder="SKU…"
                                    value={skuFilter}
                                    onChange={(e) => setSkuFilter(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <div className="relative">
                                <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="filter-category"
                                    placeholder="Category…"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={promoFilter} onValueChange={(v) => setPromoFilter(v as any)}>
                                <SelectTrigger id="filter-promo">
                                    <SelectValue placeholder="Promotion" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="yes">On Promotion</SelectItem>
                                    <SelectItem value="no">Not on Promotion</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Results table ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Transactions for{" "}
                            <span className="text-primary">{fmtDate(selectedDate)}</span>
                        </CardTitle>
                        <CardDescription>
                            {isLoading
                                ? "Loading…"
                                : error
                                    ? "Failed to load data."
                                    : filtered.length === 0
                                        ? "No records match your filters for this date."
                                        : `Showing ${filtered.length.toLocaleString()} record${filtered.length !== 1 ? "s" : ""}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex h-52 items-center justify-center">
                                <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : error ? (
                            <div className="flex h-52 items-center justify-center text-destructive text-sm">
                                Failed to load sales data. Please try again.
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex h-52 flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                                <IconCalendar className="h-8 w-8 opacity-30" />
                                <p>No sales records found for this date{hasFilters ? " with the applied filters" : ""}.</p>
                                {hasFilters && (
                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/40">
                                        <tr>
                                            {["SKU", "Product", "Category", "Store", "Region", "Qty", "Price", "Revenue", "Promo"].map(
                                                (h) => (
                                                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((r, i) => (
                                            <tr
                                                key={r.id}
                                                className={`border-b transition-colors hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-muted/10"
                                                    }`}
                                            >
                                                <td className="px-4 py-2.5 font-mono text-xs font-medium">{r.sku}</td>
                                                <td className="px-4 py-2.5 max-w-[180px] truncate" title={r.product_name}>
                                                    {r.product_name}
                                                </td>
                                                <td className="px-4 py-2.5 text-muted-foreground">{r.category}</td>
                                                <td className="px-4 py-2.5 font-medium">{r.store_id}</td>
                                                <td className="px-4 py-2.5 text-muted-foreground">{r.region}</td>
                                                <td className="px-4 py-2.5 font-bold text-right">{r.quantity.toLocaleString()}</td>
                                                <td className="px-4 py-2.5 text-right text-muted-foreground">
                                                    {r.price > 0 ? `$${r.price.toFixed(2)}` : "—"}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-medium">
                                                    {r.revenue > 0 ? `$${r.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    {r.onpromotion ? (
                                                        <Badge variant="default" className="text-xs bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/20">
                                                            Yes
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs text-muted-foreground">
                                                            No
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {/* Totals footer */}
                                    <tfoot className="border-t bg-muted/20 font-semibold">
                                        <tr>
                                            <td colSpan={5} className="px-4 py-3 text-muted-foreground text-xs uppercase tracking-wide">
                                                Totals ({filtered.length} rows)
                                            </td>
                                            <td className="px-4 py-3 text-right">{filteredQty.toLocaleString()}</td>
                                            <td className="px-4 py-3" />
                                            <td className="px-4 py-3 text-right">
                                                ${filteredRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </DashboardLayout>
    );
}
