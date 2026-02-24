import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Calendar, Plane, Ship, Clock } from "lucide-react";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { getShipments } from "@/lib/api";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const SHIPMENT_STAGES = [
    { key: "Booked", label: "Booking Confirmed", description: "Shipment booked with carrier. Awaiting pickup." },
    { key: "Picked Up", label: "Picked Up", description: "Goods collected from supplier facility." },
    { key: "In Transit", label: "In Transit", description: "Shipment is in transit via the selected carrier." },
    { key: "Customs", label: "Customs Clearance", description: "Shipment undergoing customs inspection and clearance." },
    { key: "Out for Delivery", label: "Out for Delivery", description: "Shipment cleared and heading to your warehouse." },
    { key: "Arrived", label: "Arrived", description: "Goods received and checked into the warehouse." },
];

function getStageIndex(status: string) {
    const mapping: Record<string, string> = {
        "In Transit": "In Transit",
        "Arrived": "Arrived",
        "Delayed": "In Transit",
        "Processing": "Customs",
    };
    const mapped = mapping[status] ?? status;
    const idx = SHIPMENT_STAGES.findIndex(s => s.key === mapped);
    return idx === -1 ? 0 : idx;
}

function shipmentBadge(status: string): "default" | "secondary" | "destructive" | "outline" {
    if (status === "Arrived") return "secondary";
    if (status === "Delayed") return "destructive";
    if (status === "In Transit") return "default";
    return "outline";
}

function ShipmentTracker({ shipment, open, onClose }: { shipment: any; open: boolean; onClose: () => void }) {
    const currentIdx = getStageIndex(shipment?.status ?? "In Transit");
    const isDelayed = shipment?.status === "Delayed";

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {shipment?.mode === "Air"
                            ? <Plane className="h-5 w-5 text-primary" />
                            : <Ship className="h-5 w-5 text-primary" />}
                        Shipment Tracking — {shipment?.tracking_number || shipment?.id}
                    </DialogTitle>
                    <DialogDescription>
                        {shipment?.origin} → {shipment?.destination} via{" "}
                        <span className="font-medium">{shipment?.carrier}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                    <div>
                        <p className="text-xs text-muted-foreground">Mode</p>
                        <p className="font-medium flex items-center gap-1">
                            {shipment?.mode === "Air"
                                ? <><Plane className="h-3 w-3" /> Air</>
                                : <><Ship className="h-3 w-3" /> Sea</>}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">ETA</p>
                        <p className="font-medium">{shipment?.eta}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge variant={shipmentBadge(shipment?.status)} className="text-xs mt-0.5">{shipment?.status}</Badge>
                    </div>
                </div>

                {isDelayed && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm text-destructive flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        This shipment is delayed. Contact your carrier for updates.
                    </div>
                )}

                {/* 🎬 Animated timeline — key forces remount on every open */}
                <TrackingTimeline
                    key={`${shipment?.id}-${open}`}
                    stages={SHIPMENT_STAGES}
                    currentIndex={currentIdx}
                    isDelayed={isDelayed}
                />

                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.min(currentIdx + 1, SHIPMENT_STAGES.length)} of {SHIPMENT_STAGES.length} stages complete</span>
                    <span>Updated just now</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const InboundShipments = () => {
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [trackShipment, setTrackShipment] = useState<any | null>(null);
    const [trackOpen, setTrackOpen] = useState(false);

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const data = await getShipments();
                setShipments(data);
            } catch (error) {
                console.error("Failed to fetch shipments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShipments();
    }, []);

    return (
        <DashboardLayout title="Supply Chain > Inbound Shipments">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Inbound Shipments</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                            <Ship className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{shipments.filter(s => s.status === 'In Transit').length}</div>
                            <p className="text-xs text-muted-foreground">Active sea/air freight</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Arriving Today</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {shipments.filter(s => s.eta === new Date().toISOString().split("T")[0]).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Due at warehouse today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{shipments.filter(s => s.status === 'Delayed').length}</div>
                            <p className="text-xs text-muted-foreground">Require attention</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Shipments</CardTitle>
                        <CardDescription>Monitor status and ETA of incoming inventory.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tracking ID</TableHead>
                                    <TableHead>Origin</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Mode</TableHead>
                                    <TableHead>Carrier</TableHead>
                                    <TableHead>ETA</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={8} className="text-center">Loading shipments...</TableCell></TableRow>
                                ) : (
                                    shipments.map((shipment) => (
                                        <TableRow key={shipment.id}>
                                            <TableCell className="font-medium">{shipment.tracking_number || shipment.id}</TableCell>
                                            <TableCell>{shipment.origin}</TableCell>
                                            <TableCell>{shipment.destination}</TableCell>
                                            <TableCell>
                                                {shipment.mode === "Air" ? <Plane className="h-4 w-4" /> : <Ship className="h-4 w-4" />}
                                            </TableCell>
                                            <TableCell>{shipment.carrier}</TableCell>
                                            <TableCell>{shipment.eta}</TableCell>
                                            <TableCell>
                                                <Badge variant={shipmentBadge(shipment.status)}>{shipment.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline" size="sm"
                                                        className="gap-1.5 text-primary border-primary/40 hover:bg-primary/5"
                                                        onClick={() => { setTrackShipment(shipment); setTrackOpen(true); }}
                                                    >
                                                        <MapPin className="h-3.5 w-3.5" /> Track
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedShipment(shipment); setDetailsOpen(true); }}>
                                                        Details
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {trackShipment && <ShipmentTracker shipment={trackShipment} open={trackOpen} onClose={() => setTrackOpen(false)} />}

                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Shipment Details</DialogTitle>
                            <DialogDescription>Detailed view of inbound shipment</DialogDescription>
                        </DialogHeader>
                        {selectedShipment && (
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Tracking ID</span><p className="font-medium">{selectedShipment.tracking_number || selectedShipment.id}</p></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Status</span><div><Badge variant={shipmentBadge(selectedShipment.status)}>{selectedShipment.status}</Badge></div></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Origin</span><p className="font-medium">{selectedShipment.origin}</p></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Destination</span><p className="font-medium">{selectedShipment.destination}</p></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Mode</span><p className="font-medium">{selectedShipment.mode}</p></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">Carrier</span><p className="font-medium">{selectedShipment.carrier}</p></div>
                                    <div className="space-y-1"><span className="text-sm text-muted-foreground">ETA</span><p className="font-medium">{selectedShipment.eta}</p></div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default InboundShipments;
