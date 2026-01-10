# WTR Management System

> ERP / Back-office System for SME - Agricultural Equipment Business

## 🏗️ Project Structure

```
wtr-management/
├── apps/
│   ├── web/              # Next.js (Frontend)
│   └── api/              # NestJS (Backend)
├── packages/
│   └── shared/           # Shared types/utils
├── docker-compose.yml    # Local development
├── docker-compose.prod.yml
└── .env.example
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose

### Local Development

```bash
# 1. Clone and install
git clone https://github.com/xxx/wtr-management.git
cd wtr-management
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Start with Docker (DB + MinIO)
npm run docker:dev

# 4. Run migrations
npm run db:migrate

# 5. Start development servers
npm run dev
```

### Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **MinIO Console:** http://localhost:9001

## 📦 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 + TypeScript |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Storage | MinIO (S3-compatible) |
| UI | Tailwind CSS + shadcn/ui |

## 🔐 Environment Variables

See `.env.example` for all required variables.

## 📚 Documentation

- [Architecture](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## 📝 License

Private - Unlicensed
