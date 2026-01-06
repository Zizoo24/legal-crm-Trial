# Client Enquiry CRM System

A web-based Customer Relationship Management system designed for legal practices to manage client enquiries from initial contact through conversion and payment tracking.

## Live Demo

**Production URL:** https://legal-crm-production.up.railway.app

---

## Features

- **Enquiry Management** - Track client enquiries with auto-generated IDs (ENQ-0001)
- **Status Tracking** - Monitor enquiry distribution with visual indicators
- **KPI Dashboard** - View conversion rates, revenue metrics, and performance analytics
- **Payment Tracker** - Manage payment milestones (retainer, mid-payment, final)
- **Pipeline Forecast** - Weighted revenue projections by status probability
- **User Management** - Role-based access control (Admin/User)
- **Audit Logging** - Track all changes for compliance

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js, TypeScript 5.9 |
| **Backend** | Express.js, tRPC 11.6 |
| **Frontend** | React 19, Vite 7 |
| **Database** | MySQL 2, Drizzle ORM |
| **UI** | TailwindCSS 4.1, Radix UI, Shadcn/ui |
| **Validation** | Zod |

---

## Project Structure

```
legal-crm/
├── server/              # Express + tRPC API
│   ├── _core/           # Core server functionality
│   ├── routers.ts       # API routes
│   └── db.ts            # Database functions
├── client/src/          # React frontend
│   ├── pages/           # Page components
│   ├── components/      # Reusable UI components
│   └── lib/             # Utilities
├── shared/              # Shared types & constants
└── drizzle/             # Database schema & migrations
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | Yes |
| `NODE_ENV` | `production` or `development` | Yes |
| `JWT_SECRET` | Secret key for session tokens | Yes |
| `PORT` | Server port (default: 3000) | No |

---

## Deployment

### Railway (Recommended)

1. **Create Project**
   - Connect your GitHub repository
   - Add a MySQL database service

2. **Set Environment Variables** (in legal-crm service):
   ```
   DATABASE_URL=${{MySQL.MYSQL_URL}}
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   ```

3. **Configure Build & Start Commands**:
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm db:push && pnpm start`

4. **Generate Domain**:
   - Settings → Networking → Generate Domain

### Custom Domain

1. In Railway, add custom domain (e.g., `crm.yourdomain.com`)
2. Add CNAME record in your DNS:
   - Type: `CNAME`
   - Name: `crm`
   - Value: `your-app.up.railway.app`

---

## Local Development

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

---

## Recent Changes (v1.1)

### Standalone Deployment Support

The application has been updated to run independently without the Manus OAuth platform:

1. **Removed Manus OAuth Dependency**
   - App no longer requires Manus OAuth authentication
   - Works on any hosting platform (Railway, Render, VPS, etc.)

2. **Default Admin User**
   - Auto-creates an admin user on first run
   - Email: `admin@legalcrm.local`
   - Role: `admin`

3. **Simplified Authentication**
   - No login required - direct dashboard access
   - All users authenticated as default admin
   - Ready for future multi-user auth implementation

### Files Changed

| File | Change |
|------|--------|
| `server/_core/context.ts` | Uses default user instead of OAuth SDK |
| `server/db.ts` | Added `getOrCreateDefaultUser()` function |
| `client/src/const.ts` | `getLoginUrl()` redirects to dashboard |
| `client/src/pages/Home.tsx` | Removed sign-in buttons |
| `client/src/components/DashboardLayout.tsx` | Removed auth check gate |

---

## Database Schema

### Tables

- **users** - User accounts with roles and status
- **enquiries** - Client enquiries (40+ fields)
- **payments** - Payment milestones for converted clients
- **audit_logs** - Change tracking for compliance

### Auto-Generated IDs

- Enquiry ID: `ENQ-0001`, `ENQ-0002`, etc.
- Matter Code: `MAT-2025-001` (generated on conversion)

---

## API Endpoints (tRPC)

| Router | Procedures |
|--------|------------|
| `auth` | `me`, `logout` |
| `enquiries` | `list`, `get`, `create`, `update`, `delete`, `statusSummary`, `kpiMetrics`, `pipelineForecast` |
| `payments` | `list`, `getByEnquiry`, `create`, `update` |
| `users` | `list`, `updateRole`, `updateStatus`, `activityStats` |
| `auditLogs` | `byEnquiry`, `list` |

---

## Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm db:push    # Push schema to database
pnpm test       # Run tests
pnpm check      # TypeScript type check
```

---

## Future Enhancements

- [ ] Multi-user authentication (email/password or OAuth)
- [ ] User registration and invitation system
- [ ] Email notifications for enquiry updates
- [ ] Document upload and management
- [ ] Reporting and export features

---

## License

MIT

---

## Support

For issues and feature requests, please open an issue on GitHub.
