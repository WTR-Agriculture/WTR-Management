import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Permission definitions with actions
const modules = [
    { module: 'dashboard', name: 'Dashboard', actions: ['view'] },
    { module: 'users', name: 'Users', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'roles', name: 'Roles', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'employees', name: 'Employees', actions: ['view', 'create', 'edit', 'delete', 'print'] },
    { module: 'branches', name: 'Branches', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'inventory', name: 'Inventory', actions: ['view', 'create', 'edit', 'delete', 'print'] },
    { module: 'sales', name: 'Sales', actions: ['view', 'create', 'edit', 'delete', 'print', 'approve'] },
    { module: 'expense', name: 'Expense', actions: ['view', 'create', 'edit', 'delete', 'print', 'approve'] },
    { module: 'investment', name: 'Investment', actions: ['view', 'create', 'approve'] },
    { module: 'reports', name: 'Reports', actions: ['view', 'print'] },
    { module: 'settings', name: 'Settings', actions: ['view', 'edit'] },
];

// Generate permissions from modules
function generatePermissions() {
    const permissions: { code: string; name: string; module: string; action: string }[] = [];

    for (const mod of modules) {
        for (const action of mod.actions) {
            const actionName = action.charAt(0).toUpperCase() + action.slice(1);
            permissions.push({
                code: `${mod.module}.${action}`,
                name: `${actionName} ${mod.name}`,
                module: mod.module,
                action: action,
            });
        }
    }

    return permissions;
}

async function main() {
    console.log('🌱 Starting seed...');

    // Generate and create permissions
    const permissions = generatePermissions();
    console.log(`📝 Creating ${permissions.length} permissions...`);

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { code: perm.code },
            update: { action: perm.action },
            create: perm,
        });
    }
    console.log(`✅ Created ${permissions.length} permissions`);

    // Create Admin role with all permissions
    console.log('👤 Creating Admin role...');
    const allPermissions = await prisma.permission.findMany();
    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {
            permissions: {
                set: allPermissions.map(p => ({ id: p.id })),
            },
        },
        create: {
            name: 'admin',
            description: 'Administrator with full access',
            permissions: {
                connect: allPermissions.map(p => ({ id: p.id })),
            },
        },
    });
    console.log(`✅ Created Admin role with ${allPermissions.length} permissions`);

    // Create other default roles
    const defaultRoles = [
        { name: 'finance', description: 'Finance team', modules: ['dashboard', 'sales', 'expense', 'investment', 'reports'] },
        { name: 'sales', description: 'Sales team', modules: ['dashboard', 'sales', 'inventory'] },
        { name: 'warehouse', description: 'Warehouse/Inventory team', modules: ['dashboard', 'inventory'] },
        { name: 'employee', description: 'Regular employee', modules: ['dashboard'] },
        { name: 'investor', description: 'Investor (read-only)', modules: ['dashboard', 'investment', 'reports'] },
    ];

    for (const role of defaultRoles) {
        const rolePermissions = await prisma.permission.findMany({
            where: {
                module: { in: role.modules },
                action: 'view',
            },
        });

        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: {
                name: role.name,
                description: role.description,
                permissions: {
                    connect: rolePermissions.map(p => ({ id: p.id })),
                },
            },
        });
    }
    console.log(`✅ Created ${defaultRoles.length} default roles`);

    // Create Admin user
    console.log('🔐 Creating Admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@wtr.local' },
        update: {},
        create: {
            email: 'admin@wtr.local',
            passwordHash: hashedPassword,
            name: 'Administrator',
            roleId: adminRole.id,
            isActive: true,
        },
    });
    console.log('✅ Created Admin user (admin@wtr.local / admin123)');

    // Create default branches
    console.log('🏢 Creating default branches...');
    const defaultBranches = [
        { code: 'HQ', name: 'สำนักงานใหญ่', address: 'กรุงเทพมหานคร' },
        { code: 'BKK1', name: 'สาขากรุงเทพ 1', address: 'กรุงเทพมหานคร' },
        { code: 'CM', name: 'สาขาเชียงใหม่', address: 'เชียงใหม่' },
    ];

    for (const branch of defaultBranches) {
        await prisma.branch.upsert({
            where: { code: branch.code },
            update: {},
            create: branch,
        });
    }
    console.log(`✅ Created ${defaultBranches.length} default branches`);

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

