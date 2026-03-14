# CoreInventory - Inventory Management System

A modern, full-stack inventory management system built for hackathons and real-world use.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Dark/Light Mode
- **Fonts**: Playfair Display (headings) + Inter (body)
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js (email/password)
- **Icons**: Lucide React
- **Charts**: Recharts (Dashboard KPIs)

## Features Implemented

### ✅ Core Features

1. **Authentication System**
   - Sign up / Login with email & password
   - Session management with NextAuth
   - Protected routes

2. **Dashboard**
   - Real-time KPI cards:
     - Total Products in Stock
     - Low Stock Items
     - Out of Stock Items
     - Pending Receipts
     - Pending Deliveries
     - Internal Transfers
   - Dark/Light mode toggle

3. **Product Management**
   - Create, Read, Update, Delete products
   - Product fields: Name, SKU, Category, Unit of Measure, Reorder Level
   - Search and filter products
   - Unique SKU validation

4. **Warehouse Settings**
   - Multi-warehouse support
   - Create, edit, delete warehouses
   - Active/Inactive status

5. **Receipts (Incoming Stock)**
   - Create receipts with multiple products
   - Supplier tracking
   - Draft → Done status flow
   - **Validate button**: Automatically increases stock levels
   - Real-time stock updates in database

6. **Deliveries (Outgoing Stock)**
   - Create deliveries with multiple products
   - Customer tracking
   - Draft → Done status flow
   - **Validate button**: Automatically decreases stock levels
   - Stock availability checking before validation
   - Real-time stock updates

7. **Move History (Stock Ledger)**
   - Complete audit trail of all stock movements
   - Shows: Receipts, Deliveries, Transfers, Adjustments
   - Filter by product, reference, or type
   - User tracking for all movements
   - Timestamp for every transaction

### 🚧 Placeholder Features (Coming Soon)
- Internal Transfers (warehouse to warehouse)
- Stock Adjustments (fix discrepancies)

## Database Schema

The system uses 11 database tables:

1. **User** - User authentication
2. **Product** - Product catalog
3. **Warehouse** - Warehouse/location management
4. **Stock** - Current stock levels per product/warehouse
5. **Receipt** - Incoming stock documents
6. **ReceiptLine** - Line items for receipts
7. **Delivery** - Outgoing stock documents
8. **DeliveryLine** - Line items for deliveries
9. **InternalTransfer** - Stock transfers between warehouses
10. **StockAdjustment** - Manual stock adjustments
11. **StockMove** - Complete stock movement ledger

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MySQL server running (XAMPP/MySQL Workbench)
- Git (optional)

### Installation

1. **Database Setup**
   ```bash
   # Start MySQL (XAMPP or standalone)
   # Create database: coreinventory
   ```

2. **Environment Configuration**
   - Update `.env` file:
   ```env
   DATABASE_URL="mysql://root@localhost:3306/coreinventory"
   NEXTAUTH_URL="http://localhost:3002"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Open browser: `http://localhost:3002`
   - Sign up for a new account
   - Start using the system!

## Usage Flow

### Quick Start Guide

1. **Sign Up** → Create your account
2. **Add Warehouse** → Settings → Add your first warehouse
3. **Add Products** → Products → Create products with SKU
4. **Receive Stock** → Receipts → New Receipt → Validate
5. **Deliver Stock** → Deliveries → New Delivery → Validate
6. **View History** → Move History → See all stock movements

### Example Workflow

```
1. Create Product: "Steel Rods" (SKU: STEEL-001)
2. Create Warehouse: "Main Warehouse"
3. Create Receipt:
   - Supplier: "ABC Steel Co"
   - Product: Steel Rods
   - Quantity: 100
   - Validate → Stock increases to 100
4. Create Delivery:
   - Customer: "XYZ Construction"
   - Product: Steel Rods
   - Quantity: 20
   - Validate → Stock decreases to 80
5. Check Move History → See both transactions
```

## Key Features Explained

### Real-Time Stock Calculation
- Stock levels are **automatically calculated** when you validate receipts/deliveries
- No manual stock entry needed
- Uses database transactions to ensure data consistency
- Prevents negative stock in deliveries

### Stock Movement Tracking
- Every stock change is logged in `StockMove` table
- Track who made the change, when, and why
- Reference numbers link back to original documents
- Complete audit trail for compliance

### Multi-Warehouse Support
- Manage stock across multiple locations
- Each warehouse has independent stock levels
- Transfer stock between warehouses (coming soon)

## Design Features

- **Typography**: Playfair Display for headings, Inter for body text
- **Theme**: Full dark/light mode support with next-themes
- **Responsive**: Mobile-friendly design
- **Accessibility**: Proper ARIA labels, keyboard navigation
- **Color Coding**:
  - Green: Receipts (incoming)
  - Red: Deliveries (outgoing)
  - Blue: Transfers
  - Yellow: Adjustments

## Project Structure

```
coreinventory/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── products/     # Product CRUD
│   │   ├── warehouses/   # Warehouse CRUD
│   │   ├── receipts/     # Receipt operations
│   │   ├── deliveries/   # Delivery operations
│   │   └── stock-moves/  # Stock ledger
│   ├── dashboard/        # Dashboard pages
│   │   ├── products/
│   │   ├── receipts/
│   │   ├── deliveries/
│   │   ├── history/
│   │   └── settings/
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── lib/                  # Utilities
├── prisma/              # Database schema
└── types/               # TypeScript types
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Warehouses
- `GET /api/warehouses` - List warehouses
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/[id]` - Update warehouse
- `DELETE /api/warehouses/[id]` - Delete warehouse

### Receipts
- `GET /api/receipts` - List receipts
- `POST /api/receipts` - Create receipt
- `GET /api/receipts/[id]` - Get receipt details
- `POST /api/receipts/[id]/validate` - Validate receipt (updates stock)

### Deliveries
- `GET /api/deliveries` - List deliveries
- `POST /api/deliveries` - Create delivery
- `GET /api/deliveries/[id]` - Get delivery details
- `POST /api/deliveries/[id]/validate` - Validate delivery (updates stock)

### Stock Moves
- `GET /api/stock-moves` - Get stock movement history
  - Query params: `productId`, `warehouseId`, `movementType`

## Security Features

- Password hashing with bcrypt
- JWT session tokens
- Protected API routes
- SQL injection prevention (Prisma ORM)
- XSS protection (React)

## Performance Optimizations

- Database indexes on frequently queried fields
- React Server Components
- Optimistic UI updates
- Lazy loading for large lists
- Efficient database queries with Prisma

## Future Enhancements

- Internal Transfers (complete implementation)
- Stock Adjustments (complete implementation)
- Barcode scanning
- PDF/Excel export
- Email notifications
- Low stock alerts
- Reports and analytics
- Role-based access control (Admin/Manager/Staff)
- OTP-based password reset

## Hackathon Notes

Built in **6 hours** for a hackathon challenge.

**Time Breakdown:**
- Hour 1-2: Setup, Database, Auth
- Hour 3-4: Dashboard, Products, Warehouses
- Hour 5-6: Receipts, Deliveries, Move History

**Features Prioritized for Demo:**
1. Complete inventory flow (receive → store → deliver)
2. Real-time stock updates
3. Audit trail
4. Multi-warehouse support
5. Dark mode

## License

MIT License - Free to use for hackathons and commercial projects

## Support

For issues or questions, check the code comments or create an issue in the repository.

---

**Built with ❤️ for efficient inventory management**
