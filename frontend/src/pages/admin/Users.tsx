import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconUsers,
  IconShield,
  IconBuildingStore,
  IconTruckDelivery,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconSearch,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";



function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("store_manager");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/users/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Show all users regardless of role
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvitation = async () => {
    if (!inviteEmail) {
      toast.error("Email is required");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("User created successfully", {
          description: `${inviteEmail} has been added with ${inviteRole} role.`,
        });
        setInviteDialogOpen(false);
        setInviteEmail("");
        setInviteRole("store_manager");
        // Refresh user list
        fetchUsers();
      } else {
        toast.error("Failed to create user", {
          description: data.msg || "An error occurred",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user", {
        description: "An error occurred. Please try again.",
      });
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/users/${userId}/role?role=${newRole}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setUsers(users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
        toast.success("Role updated successfully");
      } else {
        toast.error("Failed to update role", {
          description: data.msg || "An error occurred",
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role", {
        description: "An error occurred. Please try again.",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const userToDelete = users.find(u => u.id === userId);

    if (!confirm(`Are you sure you want to delete ${userToDelete?.email}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        toast.success("User deleted successfully");
      } else {
        toast.error("Failed to delete user", {
          description: data.msg || "An error occurred",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user", {
        description: "An error occurred. Please try again.",
      });
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="size-5" />
              User Management
            </CardTitle>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <IconPlus className="size-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to add a new member to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@yourcompany.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Select role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="store_manager">Store Manager</SelectItem>
                      <SelectItem value="inventory_analyst">Inventory Analyst</SelectItem>
                      <SelectItem value="staff">Warehouse Staff</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleSendInvitation}
                  disabled={!inviteEmail}
                  className="w-full sm:w-auto"
                >
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          {filteredUsers.length} members
        </div>
        <ul className="divide-y divide-border">
          {filteredUsers.map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar>
                  <AvatarImage src={user.avatar_url} alt={user.username || user.email} />
                  <AvatarFallback>{(user.username || user.email).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.username || user.email}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  defaultValue={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                >
                  <SelectTrigger className="w-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="store_manager">Store Manager</SelectItem>
                    <SelectItem value="inventory_analyst">Inventory Analyst</SelectItem>
                    <SelectItem value="staff">Warehouse Staff</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="size-8">
                      <IconDotsVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive">
                      <IconTrash className="size-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// function RoleManagement() {
//   return (
//     <Card className="overflow-hidden">
//       <CardHeader>
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               <IconShield className="size-5" />
//               Role & Permission Management
//             </CardTitle>
//           </div>
//           <Button className="gap-2">
//             <IconPlus className="size-4" />
//             Create Role
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Role Name</TableHead>
//               <TableHead className="hidden sm:table-cell">Description</TableHead>
//               <TableHead>Permissions</TableHead>
//               <TableHead>Users</TableHead>
//               <TableHead className="w-12"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {mockRoles.map((role) => (
//               <TableRow key={role.id}>
//                 <TableCell className="font-medium">{role.name}</TableCell>
//                 <TableCell className="hidden sm:table-cell text-muted-foreground">
//                   {role.description}
//                 </TableCell>
//                 <TableCell>
//                   <Badge variant="secondary">{role.permissions} permissions</Badge>
//                 </TableCell>
//                 <TableCell>{role.users} users</TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" className="size-8">
//                         <IconDotsVertical className="size-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem>
//                         <IconEdit className="size-4 mr-2" />
//                         Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem className="text-destructive">
//                         <IconTrash className="size-4 mr-2" />
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }

// function StoreManagement() {
//   return (
//     <Card className="overflow-hidden">
//       <CardHeader>
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               <IconBuildingStore className="size-5" />
//               Store Management
//             </CardTitle>
//           </div>
//           <Button className="gap-2">
//             <IconPlus className="size-4" />
//             Add Store
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Store Name</TableHead>
//               <TableHead className="hidden md:table-cell">Location</TableHead>
//               <TableHead className="hidden sm:table-cell">Manager</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="w-12"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {mockStores.map((store) => (
//               <TableRow key={store.id}>
//                 <TableCell className="font-medium">{store.name}</TableCell>
//                 <TableCell className="hidden md:table-cell text-muted-foreground">
//                   {store.location}
//                 </TableCell>
//                 <TableCell className="hidden sm:table-cell">{store.manager}</TableCell>
//                 <TableCell>
//                   <Badge variant={store.status === "Active" ? "default" : "secondary"}>
//                     {store.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" className="size-8">
//                         <IconDotsVertical className="size-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem>
//                         <IconEdit className="size-4 mr-2" />
//                         Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem className="text-destructive">
//                         <IconTrash className="size-4 mr-2" />
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }

// function SupplierManagement() {
//   return (
//     <Card className="overflow-hidden">
//       <CardHeader>
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               <IconTruckDelivery className="size-5" />
//               Supplier Management
//             </CardTitle>

//           </div>
//           <Button className="gap-2">
//             <IconPlus className="size-4" />
//             Add Supplier
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Supplier Name</TableHead>
//               <TableHead className="hidden sm:table-cell">Contact</TableHead>
//               <TableHead className="hidden md:table-cell">Email</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="w-12"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {mockSuppliers.map((supplier) => (
//               <TableRow key={supplier.id}>
//                 <TableCell className="font-medium">{supplier.name}</TableCell>
//                 <TableCell className="hidden sm:table-cell">{supplier.contact}</TableCell>
//                 <TableCell className="hidden md:table-cell text-muted-foreground">
//                   {supplier.email}
//                 </TableCell>
//                 <TableCell>
//                   <Badge
//                     variant={supplier.status === "Active" ? "default" : "outline"}
//                   >
//                     {supplier.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" className="size-8">
//                         <IconDotsVertical className="size-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem>
//                         <IconEdit className="size-4 mr-2" />
//                         Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem className="text-destructive">
//                         <IconTrash className="size-4 mr-2" />
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }

export default function AdminPage() {
  return (
    <DashboardLayout title="Admin Access">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
        </div>
        <UserManagement />
      </div>
    </DashboardLayout>
  );
}

