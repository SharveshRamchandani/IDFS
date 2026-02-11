
import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Star, Truck, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useEffect, useState } from "react";
import { getSuppliers, createSupplier } from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";


export default function Suppliers() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // New Supplier State
    const [newSupplier, setNewSupplier] = useState({
        name: "",
        contact: "",
        email: ""
    });

    const fetchSuppliers = async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("Failed to fetch suppliers:", error);
            // Removed hardcoded fallback, assuming API will eventually work or error handling is external
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleCreate = async () => {
        try {
            await createSupplier(newSupplier);
            toast.success("Supplier added successfully");
            setOpen(false);
            fetchSuppliers(); // Refresh list
            setNewSupplier({ name: "", contact: "", email: "" });
        } catch (error) {
            console.error(error);
            toast.error("Failed to add supplier");
        }
    };

    return (
        <DashboardLayout title="Supply Chain > Suppliers">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Suppliers Directory</h2>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Supplier
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Supplier</DialogTitle>
                                <DialogDescription>Register a new supplier in the system.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input
                                        id="name"
                                        value={newSupplier.name}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="contact" className="text-right">Contact Person</Label>
                                    <Input
                                        id="contact"
                                        value={newSupplier.contact}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input
                                        id="email"
                                        value={newSupplier.email}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate}>Save System Supplier</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* ... Cards can remain static for now or calculate from suppliers list ... */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{suppliers.length}</div>
                            <p className="text-xs text-muted-foreground">+2 from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4.8</div>
                            <p className="text-xs text-muted-foreground">+0.2 from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Supplier List</CardTitle>
                                <CardDescription>Manage your supplier relationships.</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search suppliers..." className="pl-8" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">Loading suppliers...</TableCell>
                                    </TableRow>
                                ) : (
                                    suppliers.map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell className="font-medium">
                                                <div>{supplier.name}</div>
                                                <div className="text-xs text-muted-foreground">{supplier.email}</div>
                                            </TableCell>
                                            <TableCell>{supplier.contact}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    {supplier.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                                    {supplier.rating}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};


