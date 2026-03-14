# CoreInventory - Quick Start Guide

## 🚀 Get Running in 5 Minutes

Your inventory system is **already set up**! Server is running at: **http://localhost:3002**

## ✅ What's Already Done

- ✅ Next.js project configured
- ✅ MySQL database connected
- ✅ All tables created in database
- ✅ Dark/Light mode working
- ✅ Authentication system ready
- ✅ Development server running

## 📋 First Steps

### 1. Open the Application
```
http://localhost:3002
```

### 2. Create Your Account
- Click "Sign up"
- Enter your name, email, password
- Click "Sign Up"

### 3. Login
- Use the email and password you just created
- You'll be redirected to the Dashboard

### 4. Set Up Your First Warehouse
- Go to **Settings** (left sidebar)
- Click "Add Warehouse"
- Name: "Main Warehouse"
- Location: "Building A"
- Click "Create"

### 5. Add Your First Product
- Go to **Products** (left sidebar)
- Click "Add Product"
- Fill in:
  - Product Name: "Test Product"
  - SKU: "PROD-001"
  - Category: "General"
  - Unit of Measure: "pcs"
  - Reorder Level: 10
- Click "Create Product"

### 6. Receive Stock (Incoming)
- Go to **Operations → Receipts**
- Click "New Receipt"
- Fill in:
  - Supplier: "ABC Suppliers"
  - Warehouse: "Main Warehouse"
  - Click "Add Product"
  - Select your product
  - Quantity: 100
- Click "Create Receipt"
- Click "Validate Receipt" to increase stock

### 7. Check Stock Levels
- Go to **Dashboard**
- You'll see "Total Products in Stock: 1"
- Check "Move History" to see the receipt entry

### 8. Deliver Stock (Outgoing)
- Go to **Operations → Deliveries**
- Click "New Delivery"
- Fill in:
  - Customer: "XYZ Customer"
  - Warehouse: "Main Warehouse"
  - Select your product
  - Quantity: 20
- Click "Create Delivery"
- Click "Validate Delivery" to decrease stock

### 9. View Complete History
- Go to **Move History**
- See all stock movements (receipt + delivery)
- Filter by product, type, or reference

## 🎯 Demo Flow for Hackathon

**Perfect 3-minute demo:**

1. **Show Dashboard** (10 sec)
   - KPIs, Dark mode toggle

2. **Create Product** (30 sec)
   - Quick product creation
   - Show unique SKU validation

3. **Receive Stock** (45 sec)
   - Create receipt with multiple products
   - Validate → Show stock increase

4. **Deliver Stock** (45 sec)
   - Create delivery
   - Validate → Show stock decrease
   - Show stock validation (can't deliver more than available)

5. **Show History** (30 sec)
   - Complete audit trail
   - Real-time tracking
   - User attribution

6. **Bonus Features** (20 sec)
   - Multi-warehouse support
   - Search/Filter
   - Responsive design

## 🎨 Features to Highlight

### Real-Time Stock Updates
- Validate button automatically updates database
- Transaction-based (data consistency)
- Stock level calculations are automatic

### Complete Audit Trail
- Every movement logged
- Who, what, when, where
- Reference numbers for tracking

### Multi-Warehouse
- Manage multiple locations
- Independent stock levels per warehouse
- Transfer between warehouses (placeholder)

### Modern Tech Stack
- Next.js 15 + React 19
- TypeScript
- Prisma ORM
- Dark mode
- Custom fonts (Playfair + Inter)

## 📊 Sample Data Suggestions

**Products:**
- Steel Rods (SKU: STEEL-001, Unit: kg)
- Cement Bags (SKU: CEMENT-001, Unit: bags)
- Paint Cans (SKU: PAINT-001, Unit: liters)
- Screws (SKU: SCREW-001, Unit: pcs)

**Warehouses:**
- Main Warehouse - Building A
- Secondary Storage - Building B
- Production Floor - Factory

**Suppliers:**
- ABC Steel Co.
- XYZ Construction Supplies
- Prime Materials Ltd.

**Customers:**
- Construction Site Alpha
- Retail Store Beta
- Manufacturing Plant Gamma

## ⚡ Quick Troubleshooting

### Server Not Running?
```bash
cd C:\Users\saura\Desktop\coreinventory
npm run dev
```

### Database Connection Error?
- Make sure XAMPP MySQL is running
- Check database "coreinventory" exists
- Verify `.env` file has correct credentials

### Can't Login?
- Make sure you created an account first (Sign Up)
- Check email/password are correct
- Try creating a new account

### Dark Mode Not Working?
- Click the moon/sun icon in the header
- It's in the top-right corner next to actions

## 🔥 Advanced Features

### Stock Validation Logic
- **Receipts**: Adds stock to warehouse
- **Deliveries**: Checks availability before reducing
- **Transactions**: Ensures data consistency
- **Logging**: Every change tracked in StockMove table

### Database Schema
- 11 tables created
- Proper relationships and indexes
- Cascading deletes for data integrity
- Real-time stock calculation queries

### API Endpoints
All endpoints are RESTful and follow best practices:
- Authentication protected
- Error handling
- Validation
- Transaction support

## 📝 Presentation Tips

**Opening (30 sec):**
"CoreInventory is a modern inventory management system that replaces manual Excel tracking with real-time, automated stock management."

**Problem Statement (20 sec):**
"Businesses struggle with manual inventory tracking - Excel sheets, scattered data, no audit trail, and manual stock calculations lead to errors."

**Solution (30 sec):**
"Our system automates everything: receive stock → automatic updates → deliver stock → real-time tracking → complete history. Multi-warehouse support and dark mode included."

**Tech Stack (20 sec):**
"Built with Next.js 15, React 19, TypeScript, MySQL, Prisma ORM. Production-ready code with proper authentication and database transactions."

**Demo (3 min):**
[Follow demo flow above]

**Closing (20 sec):**
"Built in 6 hours. Fully functional core features. Ready for production deployment. Open to questions!"

## 🎯 Winning Points

1. **Fully Functional** - Not just a mockup, real database operations
2. **Real-Time** - Stock updates are instant and accurate
3. **Audit Trail** - Complete compliance and tracking
4. **Modern Stack** - Latest technologies, best practices
5. **Clean Code** - TypeScript, proper architecture
6. **Great UX** - Dark mode, responsive, intuitive
7. **Fast Development** - 6 hours to working product

## 🚀 Ready to Present!

Your system is complete and running. Good luck with the hackathon!

**Server URL:** http://localhost:3002
**Database:** coreinventory (MySQL)
**Status:** ✅ Ready for demo

---

**Need help?** Check the README.md for detailed documentation.
