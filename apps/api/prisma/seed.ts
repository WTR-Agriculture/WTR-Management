import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Permission definitions
const permissions = [
    // Users
    { code: 'users.view', name: 'View Users', module: 'users' },
    { code: 'users.create', name: 'Create Users', module: 'users' },
    { code: 'users.update', name: 'Update Users', module: 'users' },
    { code: 'users.delete', name: 'Delete Users', module: 'users' },

    // Roles
    { code: 'roles.view', name: 'View Roles', module: 'roles' },
    { code: 'roles.create', name: 'Create Roles', module: 'roles' },
    { code: 'roles.update', name: 'Update Roles', module: 'roles' },
    { code: 'roles.delete', name: 'Delete Roles', module: 'roles' },

    // Inventory
    { code: 'inventory.view', name: 'View Inventory', module: 'inventory' },
    { code: 'inventory.create', name: 'Create Inventory', module: 'inventory' },
    { code: 'inventory.update', name: 'Update Inventory', module: 'inventory' },
    { code: 'inventory.delete', name: 'Delete Inventory', module: 'inventory' },

    // Sales
    { code: 'sales.view', name: 'View Sales', module: 'sales' },
    { code: 'sales.create', name: 'Create Sales', module: 'sales' },
    { code: 'sales.update', name: 'Update Sales', module: 'sales' },
    { code: 'sales.delete', name: 'Delete Sales', module: 'sales' },
    { code: 'sales.approve', name: 'Approve Sales', module: 'sales' },

    // Expense
    { code: 'expense.view', name: 'View Expense', module: 'expense' },
    { code: 'expense.create', name: 'Create Expense', module: 'expense' },
    { code: 'expense.update', name: 'Update Expense', module: 'expense' },
    { code: 'expense.delete', name: 'Delete Expense', module: 'expense' },
    { code: 'expense.approve', name: 'Approve Expense', module: 'expense' },

    // Investment
    { code: 'investment.view', name: 'View Investment', module: 'investment' },
    { code: 'investment.create', name: 'Create Investment', module: 'investment' },
    { code: 'investment.approve', name: 'Approve Investment', module: 'investment' },

    // Reports
    { code: 'reports.view', name: 'View Reports', module: 'reports' },
    { code: 'reports.export', name: 'Export Reports', module: 'reports' },

    // Settings
    { code: 'settings.view', name: 'View Settings', module: 'settings' },
    { code: 'settings.update', name: 'Update Settings', module: 'settings' },
];

async function main() {
    console.log('🌱 Starting seed...');

    // Create permissions
    console.log('📝 Creating permissions...');
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { code: perm.code },
            update: {},
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
        { name: 'finance', description: 'Finance team', modules: ['sales', 'expense', 'investment', 'reports'] },
        { name: 'sales', description: 'Sales team', modules: ['sales', 'inventory'] },
        { name: 'warehouse', description: 'Warehouse/Inventory team', modules: ['inventory'] },
        { name: 'employee', description: 'Regular employee', modules: [] },
        { name: 'investor', description: 'Investor (read-only)', modules: ['investment', 'reports'] },
    ];

    for (const role of defaultRoles) {
        const rolePermissions = await prisma.permission.findMany({
            where: {
                module: { in: role.modules },
                code: { contains: 'view' },
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
