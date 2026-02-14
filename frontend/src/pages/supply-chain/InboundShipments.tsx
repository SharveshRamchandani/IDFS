
import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Calendar, Plane, Ship } from "lucide-react";

import { useEffect, useState } from "react";
import { getShipments } from "@/lib/api"; // Updated import

const InboundShipments = () => {
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const data = await getShipments();
                setShipments(data);
            } catch (error) {
                console.error("Failed to fetch shipments:", error);
                // toast.error("Failed to load shipments");
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
                    <Button>
                        <Truck className="mr-2 h-4 w-4" /> Track Shipment
                    </Button>
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
                    {/* ... other cards can remain static or calculate if data available ... */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Arriving Today</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">To Warehouse A, B</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{shipments.filter(s => s.status === 'Delayed').length}</div>
                            <p className="text-xs text-muted-foreground">Due to Customs Hold</p>
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
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">Loading shipments...</TableCell>
                                    </TableRow>
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
                                                <Badge variant={shipment.status === "Arrived" ? "secondary" : shipment.status === "Delayed" ? "destructive" : "outline"}>
                                                    {shipment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Details</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout >
    );
};

export default InboundShipments;
