// ============================================
// Shared Constants
// ============================================

// Permission Modules
export const MODULES = {
    AUTH: 'auth',
    USERS: 'users',
    ROLES: 'roles',
    MASTER_DATA: 'master-data',
    INVENTORY: 'inventory',
    SALES: 'sales',
    PURCHASE: 'purchase',
    EXPENSE: 'expense',
    PRODUCTION: 'production',
    REPORTS: 'reports',
    INVESTMENT: 'investment',
    SETTINGS: 'settings',
} as const;

// Permission Actions
export const ACTIONS = {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    APPROVE: 'approve',
    EXPORT: 'export',
} as const;

// Permission Codes (generated)
export const PERMISSIONS = {
    // Users
    USERS_VIEW: 'users.view',
    USERS_CREATE: 'users.create',
    USERS_UPDATE: 'users.update',
    USERS_DELETE: 'users.delete',

    // Roles
    ROLES_VIEW: 'roles.view',
    ROLES_CREATE: 'roles.create',
    ROLES_UPDATE: 'roles.update',
    ROLES_DELETE: 'roles.delete',

    // Inventory
    INVENTORY_VIEW: 'inventory.view',
    INVENTORY_CREATE: 'inventory.create',
    INVENTORY_UPDATE: 'inventory.update',
    INVENTORY_DELETE: 'inventory.delete',

    // Sales
    SALES_VIEW: 'sales.view',
    SALES_CREATE: 'sales.create',
    SALES_UPDATE: 'sales.update',
    SALES_DELETE: 'sales.delete',
    SALES_APPROVE: 'sales.approve',

    // Expense
    EXPENSE_VIEW: 'expense.view',
    EXPENSE_CREATE: 'expense.create',
    EXPENSE_UPDATE: 'expense.update',
    EXPENSE_DELETE: 'expense.delete',
    EXPENSE_APPROVE: 'expense.approve',

    // Investment
    INVESTMENT_VIEW: 'investment.view',
    INVESTMENT_CREATE: 'investment.create',
    INVESTMENT_APPROVE: 'investment.approve',

    // Reports
    REPORTS_VIEW: 'reports.view',
    REPORTS_EXPORT: 'reports.export',

    // Settings
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_UPDATE: 'settings.update',
} as const;

// Default Roles
export const DEFAULT_ROLES = {
    ADMIN: 'admin',
    FINANCE: 'finance',
    SALES: 'sales',
    WAREHOUSE: 'warehouse',
    PRODUCTION: 'production',
    EMPLOYEE: 'employee',
    INVESTOR: 'investor',
} as const;

// Audit Actions
export const AUDIT_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
} as const;
