# UTEC Budget Builder

Full-stack web application for managing IT department budgets across 2025-2028. Import Excel workbooks, track budget items, monitor spending, and generate reports.

## Features

- **Excel Import**: Upload and import budget data from Excel workbooks with automatic column mapping
- **Dashboard**: View KPIs, status breakdowns, and visual charts
- **Status Board**: Kanban-style board for tracking item status with drag-and-drop
- **Budget Table**: Sortable, filterable table with inline edits and Excel export
- **Item Details**: Comprehensive item views with change history and extended fields
- **Category Preservation**: Maintains exact category taxonomy from your workbook

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Tables**: TanStack Table
- **File Processing**: SheetJS (xlsx)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# NextAuth (to be configured)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Azure AD (to be configured)
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID=""
```

3. Set up the database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (or run migrations)
npm run db:push

# Seed with sample data
npm run db:seed
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Using Supabase

1. Create a new Supabase project
2. Get your connection string from Project Settings > Database
3. Update `DATABASE_URL` and `DIRECT_URL` in `.env.local`
4. Run migrations:

```bash
npm run db:migrate
```

### Running Migrations

The project includes a SQL view `BudgetItemRollups` for aggregated data. After pushing the schema, you can manually create the view using the SQL in `prisma/migrations/create_rollups_view.sql`, or run it via your database client.

Note: The rollups API endpoint aggregates data manually, so the SQL view is optional but recommended for performance with large datasets.

## Importing Data

1. Navigate to `/import`
2. Upload your Excel workbook (.xlsx)
3. Review the column mapping - the system will auto-detect common columns
4. Adjust mappings if needed using the dropdown selectors
5. Click "Generate Preview" to see what will be imported
6. Review warnings and conflicts
7. Click "Import" to commit the data

### Supported Columns

The importer recognizes these common column names:
- Identity: Item, Sub-Item, Project, Program, Category, Sub-Category, Model
- Finance: Capex, Opex, Budget, Committed, Spent, Remaining, Unit Cost, Quantity
- Time: Year, Quarter
- Status: Status, % Complete, Notes
- Relations: Owner, Department, Location, Vendor, Cost Center, GL

All other columns are stored in `extendedFields` JSON and are visible on the item detail page.

## Project Structure

```
├── app/
│   ├── (dash)/          # Dashboard routes
│   ├── (status)/        # Status board routes
│   ├── (table)/         # Table routes
│   ├── api/             # API routes
│   ├── import/          # Import page
│   └── items/[id]/      # Item detail page
├── components/
│   ├── import/          # Import components
│   ├── ui/              # shadcn/ui components
│   └── charts/          # Chart components
├── lib/
│   ├── prisma.ts        # Prisma client
│   ├── validation.ts    # Zod schemas
│   ├── mappings.ts      # Column mapping utilities
│   └── import-helpers.ts # Import logic
└── prisma/
    ├── schema.prisma    # Database schema
    └── seed.ts          # Seed script
```

## API Endpoints

- `POST /api/import/preview` - Preview import without committing
- `POST /api/import/commit` - Commit import to database
- `GET /api/budget/rollups` - Get aggregated budget data
- `GET /api/budget/items` - Get budget items with pagination and filters
- `PATCH /api/budget/items/:id` - Update a budget item
- `GET /api/budget/items/:id` - Get item details with audit log
- `GET /api/lookups/:type` - Get lookup data (owners, vendors, etc.)

## Development

### Running Tests

```bash
npm test
npm run test:e2e
```

### Building for Production

```bash
npm run build
npm start
```

## Authentication (Future)

Authentication is scaffolded but disabled. To enable:

1. Configure NextAuth with Email and Microsoft Entra (Azure AD)
2. Update `.env.local` with OAuth credentials
3. Enable middleware in `middleware.ts`
4. Add role-based access control (RBAC)

## License

Private - Internal Use Only
