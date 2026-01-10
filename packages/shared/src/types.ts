// ============================================
// Shared Type Definitions
// ============================================

// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    signature?: string;
    roleId: string;
    role?: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Permission {
    id: string;
    code: string;
    name: string;
    module: string;
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface TokenPayload {
    sub: string;  // userId
    email: string;
    roleId: string;
    permissions: string[];
    iat?: number;
    exp?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

// Pagination
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Audit Log
export interface AuditLog {
    id: string;
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    module: string;
    recordId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
