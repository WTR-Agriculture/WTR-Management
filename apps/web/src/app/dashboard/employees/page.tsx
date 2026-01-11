'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { UserCog, Plus, Search, Pencil, Trash2, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';
import { DocumentScanner } from '@/components/ui/document-scanner';

interface Branch {
    id: string;
    code: string;
    name: string;
}

interface Employee {
    id: string;
    empCode: string;
    title: string;
    firstName: string;
    lastName: string;
    firstNameEn?: string;
    lastNameEn?: string;
    fullName: string;
    gender: string;
    position: string;
    dailyWage: number;
    hireDate: string;
    resignDate: string | null;
    branch: Branch;
    isActive: boolean;
    createdAt: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        empCode: '',
        title: 'นาย',
        firstName: '',
        lastName: '',
        firstNameEn: '',
        lastNameEn: '',
        gender: 'M',
        nationalId: '',
        idCardImage: '',
        address: '',
        passport: '',
        passportImage: '',
        passportExpiry: '',
        visaNo: '',
        visaImage: '',
        visaExpiry: '',
        nationality: 'ไทย',
        birthDate: '',
        position: '',
        dailyWage: 0,
        hireDate: '',
        branchId: '',
    });

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees', { params: { search } });
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await api.get('/branches');
            setBranches(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch branches:', error);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchBranches();
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchEmployees();
        }, 300);
        return () => clearTimeout(debounce);
    }, [search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                empCode: formData.empCode,
                title: formData.title,
                firstName: formData.firstName,
                lastName: formData.lastName,
                firstNameEn: formData.firstNameEn || undefined,
                lastNameEn: formData.lastNameEn || undefined,
                gender: formData.gender,
                nationality: formData.nationality,
                position: formData.position,
                dailyWage: Number(formData.dailyWage),
                hireDate: formData.hireDate,
                branchId: formData.branchId,
            };
            // Only add birthDate if not empty
            if (formData.birthDate) {
                payload.birthDate = formData.birthDate;
            }
            if (formData.nationalId) {
                payload.nationalId = formData.nationalId;
            }
            if (formData.idCardImage) {
                payload.idCardImage = formData.idCardImage;
            }
            if (formData.passport) {
                payload.passport = formData.passport;
            }
            if (formData.passportImage) {
                payload.passportImage = formData.passportImage;
            }
            if (formData.passportExpiry) {
                payload.passportExpiry = formData.passportExpiry;
            }
            if (formData.visaNo) {
                payload.visaNo = formData.visaNo;
            }
            if (formData.visaImage) {
                payload.visaImage = formData.visaImage;
            }
            if (formData.visaExpiry) {
                payload.visaExpiry = formData.visaExpiry;
            }
            if (formData.address) {
                payload.address = formData.address;
            }
            if (editingEmployee) {
                await api.patch(`/employees/${editingEmployee.id}`, payload);
            } else {
                await api.post('/employees', payload);
            }
            setDialogOpen(false);
            resetForm();
            fetchEmployees();
        } catch (error: any) {
            console.error('Failed to save employee:', error);
            alert(error.response?.data?.message || 'Failed to save employee');
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            empCode: employee.empCode,
            title: employee.title,
            firstName: employee.firstName,
            lastName: employee.lastName,
            firstNameEn: employee.firstNameEn || '',
            lastNameEn: employee.lastNameEn || '',
            gender: employee.gender,
            nationalId: '',
            idCardImage: '',
            address: '',
            passport: '',
            passportImage: '',
            passportExpiry: '',
            visaNo: '',
            visaImage: '',
            visaExpiry: '',
            nationality: 'ไทย',
            birthDate: '',
            position: employee.position,
            dailyWage: Number(employee.dailyWage),
            hireDate: employee.hireDate?.split('T')[0] || '',
            branchId: employee.branch.id,
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ยืนยันการลบพนักงานนี้?')) return;
        try {
            await api.delete(`/employees/${id}`);
            fetchEmployees();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete employee');
        }
    };

    const resetForm = () => {
        setEditingEmployee(null);
        setFormData({
            empCode: '',
            title: 'นาย',
            firstName: '',
            lastName: '',
            firstNameEn: '',
            lastNameEn: '',
            gender: 'M',
            nationalId: '',
            idCardImage: '',
            address: '',
            passport: '',
            passportImage: '',
            passportExpiry: '',
            visaNo: '',
            visaImage: '',
            visaExpiry: '',
            nationality: 'ไทย',
            birthDate: '',
            position: '',
            dailyWage: 0,
            hireDate: '',
            branchId: '',
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH');
    };

    const formatWage = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <UserCog className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Employee Management</h1>
                        <p className="text-sm text-muted-foreground">จัดการข้อมูลพนักงาน</p>
                    </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full px-6">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                            <DialogDescription>
                                {editingEmployee ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่เข้าระบบ'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="empCode">รหัสพนักงาน</Label>
                                    <Input
                                        id="empCode"
                                        value={formData.empCode}
                                        onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                                        placeholder="EMP001"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">คำนำหน้า</Label>
                                    <select
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        required
                                    >
                                        <option value="นาย">นาย</option>
                                        <option value="นาง">นาง</option>
                                        <option value="น.ส.">น.ส.</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">ชื่อ (ไทย)</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">สกุล (ไทย)</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstNameEn">ชื่อ (อังกฤษ)</Label>
                                    <Input
                                        id="firstNameEn"
                                        value={formData.firstNameEn}
                                        onChange={(e) => setFormData({ ...formData, firstNameEn: e.target.value })}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastNameEn">สกุล (อังกฤษ)</Label>
                                    <Input
                                        id="lastNameEn"
                                        value={formData.lastNameEn}
                                        onChange={(e) => setFormData({ ...formData, lastNameEn: e.target.value })}
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>
                            {/* สัญชาติและเอกสารประจำตัว */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nationality">สัญชาติ</Label>
                                    <select
                                        id="nationality"
                                        value={formData.nationality}
                                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        required
                                    >
                                        <option value="ไทย">ไทย</option>
                                        <option value="พม่า">พม่า</option>
                                        <option value="กัมพูชา">กัมพูชา</option>
                                        <option value="ลาว">ลาว</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                    </select>
                                </div>
                                {formData.nationality === 'ไทย' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="nationalId">เลขบัตร ปชช.</Label>
                                        <Input
                                            id="nationalId"
                                            value={formData.nationalId}
                                            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                                            placeholder="x-xxxx-xxxxx-xx-x"
                                            maxLength={17}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="passport">Passport</Label>
                                            <Input
                                                id="passport"
                                                value={formData.passport}
                                                onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                                                placeholder="เลข Passport"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* OCR Document Scanner */}
                            {formData.nationality === 'ไทย' ? (
                                <div className="space-y-4">
                                    <DocumentScanner
                                        documentType="idCard"
                                        label="สแกนบัตรประชาชน (อ่านข้อมูลอัตโนมัติ)"
                                        onScanComplete={(data) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                nationalId: data.nationalId || prev.nationalId,
                                                firstName: data.firstName || prev.firstName,
                                                lastName: data.lastName || prev.lastName,
                                                firstNameEn: data.firstNameEn || prev.firstNameEn,
                                                lastNameEn: data.lastNameEn || prev.lastNameEn,
                                                birthDate: data.birthDate || prev.birthDate,
                                                address: data.address || prev.address,
                                                idCardImage: data.imageBase64 || prev.idCardImage,
                                            }));
                                        }}
                                    />
                                    <div className="space-y-2">
                                        <Label htmlFor="address">ที่อยู่ตามบัตร ปชช.</Label>
                                        <textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="ที่อยู่จะถูกอ่านจากบัตรอัตโนมัติ หรือกรอกเอง"
                                            className="w-full min-h-[60px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <DocumentScanner
                                        documentType="passport"
                                        label="สแกน Passport (อ่านข้อมูลอัตโนมัติ)"
                                        onScanComplete={(data) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                passport: data.passport || prev.passport,
                                                firstName: data.firstName || prev.firstName,
                                                lastName: data.lastName || prev.lastName,
                                                passportExpiry: data.passportExpiry || prev.passportExpiry,
                                                passportImage: data.imageBase64 || prev.passportImage,
                                            }));
                                        }}
                                    />
                                    <div className="space-y-2">
                                        <Label htmlFor="passportExpiry">วันหมดอายุ Passport</Label>
                                        <Input
                                            id="passportExpiry"
                                            type="date"
                                            value={formData.passportExpiry}
                                            onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                                        />
                                    </div>
                                    <DocumentScanner
                                        documentType="visa"
                                        label="สแกน Visa (อ่านข้อมูลอัตโนมัติ - ถ้ามี)"
                                        onScanComplete={(data) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                visaNo: data.visaNo || prev.visaNo,
                                                visaExpiry: data.visaExpiry || prev.visaExpiry,
                                                visaImage: data.imageBase64 || prev.visaImage,
                                            }));
                                        }}
                                    />
                                    <div className="space-y-2">
                                        <Label htmlFor="visaExpiry">วันหมดอายุ Visa</Label>
                                        <Input
                                            id="visaExpiry"
                                            type="date"
                                            value={formData.visaExpiry}
                                            onChange={(e) => setFormData({ ...formData, visaExpiry: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gender">เพศ</Label>
                                    <select
                                        id="gender"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        required
                                    >
                                        <option value="M">ชาย</option>
                                        <option value="F">หญิง</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position">ตำแหน่ง</Label>
                                    <Input
                                        id="position"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dailyWage">ค่าแรง/วัน</Label>
                                    <Input
                                        id="dailyWage"
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.dailyWage}
                                        onChange={(e) => setFormData({ ...formData, dailyWage: Number(e.target.value.replace(/[^0-9]/g, '')) })}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hireDate">วันเริ่มงาน</Label>
                                    <Input
                                        id="hireDate"
                                        type="date"
                                        value={formData.hireDate}
                                        onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="branchId">สาขา</Label>
                                <select
                                    id="branchId"
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    required
                                >
                                    <option value="">เลือกสาขา</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.code} - {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingEmployee ? 'Save Changes' : 'Add Employee'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาพนักงาน..."
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
                                <TableHead className="w-[80px]">รหัส</TableHead>
                                <TableHead className="w-[250px]">ชื่อ-สกุล</TableHead>
                                <TableHead>ตำแหน่ง</TableHead>
                                <TableHead>สาขา</TableHead>
                                <TableHead>วันเริ่มงาน</TableHead>
                                <TableHead className="text-right">ค่าแรง/วัน</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                        ไม่พบข้อมูลพนักงาน
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell className="font-mono text-sm">{emp.empCode}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                                                        {getInitials(emp.fullName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-foreground">{emp.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {emp.gender === 'M' ? 'ชาย' : 'หญิง'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{emp.position}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal">
                                                {emp.branch.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(emp.hireDate)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatWage(Number(emp.dailyWage))}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(emp)}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(emp.id)}
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
        </div >
    );
}
