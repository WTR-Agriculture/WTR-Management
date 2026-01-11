import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';
import { randomBytes } from 'crypto';

export interface TokenPayload {
    sub: string;
    email: string;
    roleId: string;
    permissions: string[];
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async login(loginDto: LoginDto) {
        try {
            const user = await this.validateUser(loginDto.email, loginDto.password);

            const tokens = await this.generateTokens(user);

            // Save refresh token to database
            await this.saveRefreshToken(user.id, tokens.refreshToken);

            // Log login action
            await this.prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'LOGIN',
                    module: 'auth',
                },
            });

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role.name,
                    permissions: user.role.permissions.map(p => p.code),
                },
                ...tokens,
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async refreshTokens(refreshToken: string) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: {
                user: {
                    include: {
                        role: {
                            include: {
                                permissions: true,
                            },
                        },
                    },
                },
            },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Delete old token
        await this.prisma.refreshToken.delete({
            where: { id: storedToken.id },
        });

        // Generate new tokens
        const tokens = await this.generateTokens(storedToken.user);

        // Save new refresh token
        await this.saveRefreshToken(storedToken.user.id, tokens.refreshToken);

        return tokens;
    }

    async logout(userId: string, refreshToken?: string) {
        // Delete refresh token(s)
        if (refreshToken) {
            await this.prisma.refreshToken.deleteMany({
                where: { token: refreshToken },
            });
        } else {
            // Delete all refresh tokens for user
            await this.prisma.refreshToken.deleteMany({
                where: { userId },
            });
        }

        // Log logout action
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'LOGOUT',
                module: 'auth',
            },
        });

        return { message: 'Logged out successfully' };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            signature: user.signature,
            role: user.role.name,
            permissions: user.role.permissions.map(p => p.code),
            createdAt: user.createdAt,
        };
    }

    private async generateTokens(user: any): Promise<AuthTokens> {
        const payload: TokenPayload = {
            sub: user.id,
            email: user.email,
            roleId: user.roleId,
            permissions: user.role.permissions.map((p: any) => p.code),
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
        });

        const refreshToken = randomBytes(32).toString('hex');

        return { accessToken, refreshToken };
    }

    private async saveRefreshToken(userId: string, token: string) {
        const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
        const expiresAt = new Date();

        // Parse expires in (e.g., '7d' -> 7 days)
        const match = expiresIn.match(/^(\d+)([dhms])$/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            switch (unit) {
                case 'd': expiresAt.setDate(expiresAt.getDate() + value); break;
                case 'h': expiresAt.setHours(expiresAt.getHours() + value); break;
                case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + value); break;
                case 's': expiresAt.setSeconds(expiresAt.getSeconds() + value); break;
            }
        } else {
            // Default to 7 days
            expiresAt.setDate(expiresAt.getDate() + 7);
        }

        await this.prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    }
}
