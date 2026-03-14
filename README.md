# CoreInventory

Inventory management system built with Next.js for tracking stock, warehouses, and operations.

## Tech Stack

- Next.js 15 + React 19
- TypeScript
- MySQL + Prisma ORM
- NextAuth for authentication
- Tailwind CSS
- Recharts for analytics

## Setup

1. Clone the repo and install dependencies:
```bash
npm install
```

2. Configure your database in `.env`:
```env
DATABASE_URL="mysql://root@localhost:3306/coreinventory"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

3. Run Prisma migrations:
```bash
npx prisma generate
npx prisma db push
```

4. Start the dev server:
```bash
npm run dev
```

Open http://localhost:3000 and you're good to go.

## Features

### Authentication
- Signup/Login with email and password
- Password reset with OTP (check console for OTP in development)

### Inventory Management
- **Products** - Add, edit, delete products with SKU tracking
- **Warehouses** - Manage multiple warehouse locations
- **Receipts** - Record incoming stock from suppliers
- **Deliveries** - Process outgoing orders to customers
- **Internal Transfers** - Move stock between warehouses
- **Stock Adjustments** - Fix inventory discrepancies

### Dashboard
- Real-time KPIs (total products, low stock alerts, pending operations)
- Recent activity feed
- Filters by document type, status, warehouse, and category

### Other Features
- Dark mode support
- Mobile responsive design
- Stock movement history/audit trail
- Low stock alerts
- Multi-warehouse support

## How it Works

1. Create products and warehouses
2. Add stock via receipts (increases inventory)
3. Ship products via deliveries (decreases inventory)
4. Transfer stock between warehouses
5. All movements are logged automatically

## Database Schema

Main tables:
- User - authentication
- Product - product catalog
- Warehouse - locations
- Stock - current inventory levels
- Receipt/Delivery/Transfer - stock movements
- StockMove - complete audit trail

## Development Notes

The system uses Prisma for database operations and NextAuth for session management. Stock levels are automatically calculated when you validate receipts/deliveries/transfers.

For password reset, OTP is logged to console in development. For production, configure email settings in `.env`.

## License

MIT
