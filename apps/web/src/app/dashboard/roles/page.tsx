'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Pencil, Trash2, MoreVertical, Users } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';

interface Permission {
    id: string;
    code: string;
    name: string;
    module: string;
}

interface Role {
    id: string;
    name: string;
    description: string | null;
    usersCount: number;
    permissions: Permission[];
    createdAt: string;
}

interface GroupedPermissions {
    [module: string]: Array<{ id: string; code: string; name: string }>;
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<GroupedPermissions>({});
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissionIds: [] as string[],
    });

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/roles/permissions');
            setAllPermissions(response.data);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await api.patch(`/roles/${editingRole.id}`, formData);
            } else {
                await api.post('/roles', formData);
            }
            setDialogOpen(false);
            resetForm();
            fetchRoles();
        } catch (error: any) {
            console.error('Failed to save role:', error);
            alert(error.response?.data?.message || 'Failed to save role');
        }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissionIds: role.permissions.map((p) => p.id),
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await api.delete(`/roles/${id}`);
            fetchRoles();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete role');
        }
    };

    const resetForm = () => {
        setEditingRole(null);
        setFormData({ name: '', description: '', permissionIds: [] });
    };

    const togglePermission = (permissionId: string) => {
        setFormData((prev) => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(permissionId)
                ? prev.permissionIds.filter((id) => id !== permissionId)
                : [...prev.permissionIds, permissionId],
        }));
    };

    const toggleModulePermissions = (module: string) => {
        const modulePermIds = allPermissions[module].map((p) => p.id);
        const allSelected = modulePermIds.every((id) => formData.permissionIds.includes(id));

        setFormData((prev) => ({
            ...prev,
            permissionIds: allSelected
                ? prev.permissionIds.filter((id) => !modulePermIds.includes(id))
                : [...new Set([...prev.permissionIds, ...modulePermIds])],
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Role Management</h1>
                        <p className="text-sm text-muted-foreground">Manage roles and permissions</p>
                    </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full px-6">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                            <DialogDescription>
                                {editingRole ? 'Update role and permissions' : 'Create a new role with permissions'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        disabled={editingRole?.name === 'admin'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            <div className="space-y-4">
                                <Label className="text-base">Permissions</Label>
                                <div className="grid gap-4">
                                    {Object.entries(allPermissions).map(([module, perms]) => {
                                        const allSelected = perms.every((p) => formData.permissionIds.includes(p.id));
                                        const someSelected = perms.some((p) => formData.permissionIds.includes(p.id));

                                        return (
                                            <Card key={module} className="border-border">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Checkbox
                                                            checked={allSelected}
                                                            onCheckedChange={() => toggleModulePermissions(module)}
                                                            className={someSelected && !allSelected ? 'opacity-50' : ''}
                                                        />
                                                        <span className="font-medium text-sm capitalize">{module}</span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {perms.filter((p) => formData.permissionIds.includes(p.id)).length}/{perms.length}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                        {perms.map((perm) => (
                                                            <label
                                                                key={perm.id}
                                                                className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground"
                                                            >
                                                                <Checkbox
                                                                    checked={formData.permissionIds.includes(perm.id)}
                                                                    onCheckedChange={() => togglePermission(perm.id)}
                                                                />
                                                                {perm.name}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingRole ? 'Save Changes' : 'Create Role'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Roles Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Role</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead className="w-[100px]">Users</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No roles found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-foreground">{role.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {role.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.slice(0, 3).map((perm) => (
                                                    <Badge key={perm.id} variant="secondary" className="text-xs font-normal">
                                                        {perm.code}
                                                    </Badge>
                                                ))}
                                                {role.permissions.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        +{role.permissions.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span className="text-sm">{role.usersCount}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(role)}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(role.id)}
                                                        className="text-destructive focus:text-destructive"
                                                        disabled={role.usersCount > 0}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
