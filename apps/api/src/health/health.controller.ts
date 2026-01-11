import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
    constructor(private prisma: PrismaService) { }

    @Get('live')
    async liveness() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('ready')
    async readiness() {
        const checks = {
            database: false,
        };

        try {
            await this.prisma.$queryRaw`SELECT 1`;
            checks.database = true;
        } catch (e) {
            // Database not ready
        }

        const allReady = Object.values(checks).every(Boolean);

        return {
            status: allReady ? 'ready' : 'not_ready',
            checks,
            timestamp: new Date().toISOString(),
        };
    }

    @Get()
    async health() {
        return this.readiness();
    }
}
