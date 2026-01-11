'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Pencil, Trash2, MoreVertical, Shield } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: { id: string; name: string };
    isActive: boolean;
    createdAt: string;
}

interface Role {
    id: string;
    name: string;
}

interface Permission {
    id: string;
    code: string;
    name: string;
    action: string;
}

interface GroupedPermissions {
    [module: string]: Permission[];
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [permDialogOpen, setPermDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [permissionUser, setPermissionUser] = useState<User | null>(null);
    const [allPermissions, setAllPermissions] = useState<GroupedPermissions>({});
    const [userPermissionIds, setUserPermissionIds] = useState<string[]>([]);
    const [savingPerms, setSavingPerms] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: '',
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users', { params: { search } });
            setUsers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const fetchAllPermissions = async () => {
        try {
            const response = await api.get('/users/permissions/all');
            setAllPermissions(response.data);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        }
    };

    const fetchUserPermissions = async (userId: string) => {
        try {
            const response = await api.get(`/users/${userId}/permissions`);
            setUserPermissionIds(response.data.map((p: Permission) => p.id));
        } catch (error) {
            console.error('Failed to fetch user permissions:', error);
            setUserPermissionIds([]);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchAllPermissions();
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(debounce);
    }, [search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.patch(`/users/${editingUser.id}`, {
                    ...formData,
                    password: formData.password || undefined,
                });
            } else {
                await api.post('/users', formData);
            }
            setDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to save user:', error);
            alert(error.response?.data?.message || 'Failed to save user');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            roleId: user.role.id,
        });
        setDialogOpen(true);
    };

    const handlePermissions = async (user: User) => {
        setPermissionUser(user);
        await fetchUserPermissions(user.id);
        setPermDialogOpen(true);
    };

    const handleSavePermissions = async () => {
        if (!permissionUser) return;
        setSavingPerms(true);
        try {
            await api.put(`/users/${permissionUser.id}/permissions`, {
                permissionIds: userPermissionIds,
            });
            setPermDialogOpen(false);
            setPermissionUser(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save permissions');
        } finally {
            setSavingPerms(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', roleId: '' });
    };

    const togglePermission = (permissionId: string) => {
        setUserPermissionIds((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleModulePermissions = (module: string) => {
        const modulePermIds = allPermissions[module].map((p) => p.id);
        const allSelected = modulePermIds.every((id) => userPermissionIds.includes(id));

        setUserPermissionIds((prev) =>
            allSelected
                ? prev.filter((id) => !modulePermIds.includes(id))
                : [...new Set([...prev, ...modulePermIds])]
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Action labels for display
    const actionLabels: Record<string, string> = {
        view: 'ดู',
        create: 'เพิ่ม',
        edit: 'แก้ไข',
        delete: 'ลบ',
        print: 'พิมพ์',
        approve: 'อนุมัติ',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">User Management</h1>
                        <p className="text-sm text-muted-foreground">Manage system users and their permissions</p>
                    </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full px-6">
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                            <DialogDescription>
                                {editingUser ? 'Update user information' : 'Add a new user to the system'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password {editingUser && <span className="text-muted-foreground">(leave blank to keep)</span>}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    required
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Permissions Dialog - Toggle Matrix */}
            <Dialog open={permDialogOpen} onOpenChange={(open) => { setPermDialogOpen(open); if (!open) setPermissionUser(null); }}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            User Permissions: {permissionUser?.name}
                        </DialogTitle>
                        <DialogDescription>
                            กำหนดสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ สำหรับผู้ใช้นี้
                        </DialogDescription>
                    </DialogHeader>

                    {/* Permission Matrix Table */}
                    <div className="py-4">
                        <div className="rounded-lg border border-border overflow-hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-0 bg-muted/50 border-b border-border">
                                <div className="p-3 font-medium text-sm text-foreground">
                                    Module
                                </div>
                                {['view', 'create', 'edit', 'delete', 'print'].map((action) => (
                                    <div key={action} className="p-3 text-center font-medium text-sm text-muted-foreground">
                                        {actionLabels[action] || action}
                                    </div>
                                ))}
                            </div>

                            {/* Table Body */}
                            {Object.entries(allPermissions).map(([module, perms]) => {
                                const availableActions = ['view', 'create', 'edit', 'delete', 'print'];

                                return (
                                    <div
                                        key={module}
                                        className="grid grid-cols-6 gap-0 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                                    >
                                        {/* Module Name with checkbox to select all */}
                                        <div className="p-3 flex items-center gap-2">
                                            <Checkbox
                                                checked={perms.every((p) => userPermissionIds.includes(p.id))}
                                                onCheckedChange={() => toggleModulePermissions(module)}
                                                className="h-4 w-4"
                                            />
                                            <span className="font-medium text-sm capitalize text-foreground">
                                                {module}
                                            </span>
                                        </div>

                                        {/* Action Toggles */}
                                        {availableActions.map((action) => {
                                            const perm = perms.find((p) => p.action === action);

                                            return (
                                                <div key={action} className="p-3 flex items-center justify-center">
                                                    {perm ? (
                                                        <Switch
                                                            checked={userPermissionIds.includes(perm.id)}
                                                            onCheckedChange={() => togglePermission(perm.id)}
                                                            className="data-[state=checked]:bg-emerald-500"
                                                        />
                                                    ) : (
                                                        <span className="text-muted-foreground/30">—</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setPermDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSavePermissions} disabled={savingPerms}>
                            {savingPerms ? 'Saving...' : 'Save Permissions'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Search */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
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
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-foreground">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal">
                                                {user.role.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.isActive ? 'default' : 'secondary'} className="font-normal">
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handlePermissions(user)}>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Permissions
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-destructive focus:text-destructive"
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
