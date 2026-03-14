import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.stockMove.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.transferLine.deleteMany();
  await prisma.internalTransfer.deleteMany();
  await prisma.deliveryLine.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.receiptLine.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log("👤 Creating users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@coreinventory.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Warehouse Manager",
      email: "manager@coreinventory.com",
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("✅ Users created");

  // Create Warehouses
  console.log("🏭 Creating warehouses...");
  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: {
        name: "Main Warehouse",
        location: "Delhi, India",
        isActive: true,
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "North Regional Hub",
        location: "Chandigarh, Punjab",
        isActive: true,
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "South Distribution Center",
        location: "Bangalore, Karnataka",
        isActive: true,
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "East Storage Facility",
        location: "Kolkata, West Bengal",
        isActive: false,
      },
    }),
  ]);

  console.log("✅ Warehouses created");

  // Create Products
  console.log("📦 Creating products...");
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: "Laptop Battery",
        sku: "LABA-2024",
        category: "Electronics",
        unitOfMeasure: "pcs",
        reorderLevel: 50,
        price: 2500,
      },
    }),
    prisma.product.create({
      data: {
        name: "USB Cable Type-C",
        sku: "USBC-3001",
        category: "Electronics",
        unitOfMeasure: "pcs",
        reorderLevel: 100,
        price: 150,
      },
    }),
    prisma.product.create({
      data: {
        name: "Wireless Mouse",
        sku: "WIMO-4521",
        category: "Electronics",
        unitOfMeasure: "pcs",
        reorderLevel: 30,
        price: 450,
      },
    }),
    prisma.product.create({
      data: {
        name: "LED Monitor 24 inch",
        sku: "LEMO-7890",
        category: "Electronics",
        unitOfMeasure: "pcs",
        reorderLevel: 20,
        price: 8500,
      },
    }),

    // Office Supplies
    prisma.product.create({
      data: {
        name: "A4 Paper Ream",
        sku: "A4PA-1001",
        category: "Office Supplies",
        unitOfMeasure: "ream",
        reorderLevel: 200,
        price: 250,
      },
    }),
    prisma.product.create({
      data: {
        name: "Ball Pen Blue",
        sku: "BAPE-2301",
        category: "Office Supplies",
        unitOfMeasure: "box",
        reorderLevel: 50,
        price: 120,
      },
    }),
    prisma.product.create({
      data: {
        name: "Stapler Heavy Duty",
        sku: "STAP-5501",
        category: "Office Supplies",
        unitOfMeasure: "pcs",
        reorderLevel: 25,
        price: 350,
      },
    }),

    // Raw Materials
    prisma.product.create({
      data: {
        name: "Steel Rods 10mm",
        sku: "STRO-6601",
        category: "Raw Materials",
        unitOfMeasure: "kg",
        reorderLevel: 500,
        price: 55,
      },
    }),
    prisma.product.create({
      data: {
        name: "Aluminum Sheets",
        sku: "ALSH-7701",
        category: "Raw Materials",
        unitOfMeasure: "kg",
        reorderLevel: 300,
        price: 180,
      },
    }),
    prisma.product.create({
      data: {
        name: "Plastic Granules",
        sku: "PLGR-8801",
        category: "Raw Materials",
        unitOfMeasure: "kg",
        reorderLevel: 1000,
        price: 45,
      },
    }),

    // Packaging
    prisma.product.create({
      data: {
        name: "Cardboard Boxes Large",
        sku: "CABO-9901",
        category: "Packaging",
        unitOfMeasure: "pcs",
        reorderLevel: 150,
        price: 35,
      },
    }),
    prisma.product.create({
      data: {
        name: "Bubble Wrap Roll",
        sku: "BUWR-1101",
        category: "Packaging",
        unitOfMeasure: "roll",
        reorderLevel: 40,
        price: 280,
      },
    }),
    prisma.product.create({
      data: {
        name: "Packing Tape",
        sku: "PATA-1201",
        category: "Packaging",
        unitOfMeasure: "roll",
        reorderLevel: 80,
        price: 45,
      },
    }),

    // Chemicals
    prisma.product.create({
      data: {
        name: "Industrial Adhesive",
        sku: "INAD-1301",
        category: "Chemicals",
        unitOfMeasure: "liter",
        reorderLevel: 60,
        price: 450,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cleaning Solution",
        sku: "CLSO-1401",
        category: "Chemicals",
        unitOfMeasure: "liter",
        reorderLevel: 100,
        price: 180,
      },
    }),
  ]);

  console.log("✅ Products created");

  // Create Receipts (Stock IN)
  console.log("📥 Creating receipts...");

  // Receipt 1 - Main Warehouse
  const receipt1 = await prisma.receipt.create({
    data: {
      receiptNo: "REC-2024-001",
      warehouseId: warehouses[0].id,
      supplier: "Tech Supplies India",
      userId: user1.id,
      status: "done",
      validatedAt: new Date("2024-01-15"),
      lines: {
        create: [
          { productId: products[0].id, quantity: 200 },
          { productId: products[1].id, quantity: 500 },
          { productId: products[2].id, quantity: 150 },
          { productId: products[3].id, quantity: 80 },
        ],
      },
    },
  });

  // Create stock entries for receipt 1
  await Promise.all([
    prisma.stock.create({
      data: {
        productId: products[0].id,
        warehouseId: warehouses[0].id,
        quantity: 200,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[1].id,
        warehouseId: warehouses[0].id,
        quantity: 500,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[2].id,
        warehouseId: warehouses[0].id,
        quantity: 150,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[3].id,
        warehouseId: warehouses[0].id,
        quantity: 80,
      },
    }),
  ]);

  // Receipt 2 - Main Warehouse (Office Supplies)
  const receipt2 = await prisma.receipt.create({
    data: {
      receiptNo: "REC-2024-002",
      warehouseId: warehouses[0].id,
      supplier: "Office Mart",
      userId: user1.id,
      status: "done",
      validatedAt: new Date("2024-01-20"),
      lines: {
        create: [
          { productId: products[4].id, quantity: 800 },
          { productId: products[5].id, quantity: 200 },
          { productId: products[6].id, quantity: 100 },
        ],
      },
    },
  });

  await Promise.all([
    prisma.stock.create({
      data: {
        productId: products[4].id,
        warehouseId: warehouses[0].id,
        quantity: 800,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[5].id,
        warehouseId: warehouses[0].id,
        quantity: 200,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[6].id,
        warehouseId: warehouses[0].id,
        quantity: 100,
      },
    }),
  ]);

  // Receipt 3 - North Regional Hub (Raw Materials)
  const receipt3 = await prisma.receipt.create({
    data: {
      receiptNo: "REC-2024-003",
      warehouseId: warehouses[1].id,
      supplier: "Steel & Metal Corp",
      userId: user2.id,
      status: "done",
      validatedAt: new Date("2024-02-01"),
      lines: {
        create: [
          { productId: products[7].id, quantity: 2000 },
          { productId: products[8].id, quantity: 1200 },
          { productId: products[9].id, quantity: 3500 },
        ],
      },
    },
  });

  await Promise.all([
    prisma.stock.create({
      data: {
        productId: products[7].id,
        warehouseId: warehouses[1].id,
        quantity: 2000,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[8].id,
        warehouseId: warehouses[1].id,
        quantity: 1200,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[9].id,
        warehouseId: warehouses[1].id,
        quantity: 3500,
      },
    }),
  ]);

  // Receipt 4 - South Distribution Center (Packaging)
  const receipt4 = await prisma.receipt.create({
    data: {
      receiptNo: "REC-2024-004",
      warehouseId: warehouses[2].id,
      supplier: "Packaging Solutions Ltd",
      userId: user1.id,
      status: "done",
      validatedAt: new Date("2024-02-10"),
      lines: {
        create: [
          { productId: products[10].id, quantity: 600 },
          { productId: products[11].id, quantity: 150 },
          { productId: products[12].id, quantity: 300 },
        ],
      },
    },
  });

  await Promise.all([
    prisma.stock.create({
      data: {
        productId: products[10].id,
        warehouseId: warehouses[2].id,
        quantity: 600,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[11].id,
        warehouseId: warehouses[2].id,
        quantity: 150,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[12].id,
        warehouseId: warehouses[2].id,
        quantity: 300,
      },
    }),
  ]);

  // Receipt 5 - South Distribution Center (Chemicals)
  const receipt5 = await prisma.receipt.create({
    data: {
      receiptNo: "REC-2024-005",
      warehouseId: warehouses[2].id,
      supplier: "Chemical Industries",
      userId: user2.id,
      status: "done",
      validatedAt: new Date("2024-02-15"),
      lines: {
        create: [
          { productId: products[13].id, quantity: 250 },
          { productId: products[14].id, quantity: 400 },
        ],
      },
    },
  });

  await Promise.all([
    prisma.stock.create({
      data: {
        productId: products[13].id,
        warehouseId: warehouses[2].id,
        quantity: 250,
      },
    }),
    prisma.stock.create({
      data: {
        productId: products[14].id,
        warehouseId: warehouses[2].id,
        quantity: 400,
      },
    }),
  ]);

  // Receipt 6 - Pending (Not validated yet)
  const receipt6 = await prisma.receipt.create({
    data: {
      receiptNo: "REC-2024-006",
      warehouseId: warehouses[0].id,
      supplier: "Tech Supplies India",
      userId: user1.id,
      status: "draft",
      lines: {
        create: [
          { productId: products[0].id, quantity: 100 },
          { productId: products[2].id, quantity: 75 },
        ],
      },
    },
  });

  console.log("✅ Receipts created");

  // Create Deliveries (Stock OUT)
  console.log("📤 Creating deliveries...");

  // Delivery 1 - From Main Warehouse
  const delivery1 = await prisma.delivery.create({
    data: {
      deliveryNo: "DEL-2024-001",
      warehouseId: warehouses[0].id,
      customer: "ABC Corporation",
      userId: user1.id,
      status: "done",
      validatedAt: new Date("2024-02-05"),
      lines: {
        create: [
          { productId: products[0].id, quantity: 50 },
          { productId: products[1].id, quantity: 100 },
          { productId: products[2].id, quantity: 30 },
        ],
      },
    },
  });

  // Update stock for delivery 1
  await prisma.stock.update({
    where: {
      productId_warehouseId: {
        productId: products[0].id,
        warehouseId: warehouses[0].id,
      },
    },
    data: { quantity: { decrement: 50 } },
  });
  await prisma.stock.update({
    where: {
      productId_warehouseId: {
        productId: products[1].id,
        warehouseId: warehouses[0].id,
      },
    },
    data: { quantity: { decrement: 100 } },
  });
  await prisma.stock.update({
    where: {
      productId_warehouseId: {
        productId: products[2].id,
        warehouseId: warehouses[0].id,
      },
    },
    data: { quantity: { decrement: 30 } },
  });

  // Delivery 2 - From North Regional Hub
  const delivery2 = await prisma.delivery.create({
    data: {
      deliveryNo: "DEL-2024-002",
      warehouseId: warehouses[1].id,
      customer: "XYZ Manufacturing",
      userId: user2.id,
      status: "done",
      validatedAt: new Date("2024-02-12"),
      lines: {
        create: [
          { productId: products[7].id, quantity: 500 },
          { productId: products[9].id, quantity: 800 },
        ],
      },
    },
  });

  await prisma.stock.update({
    where: {
      productId_warehouseId: {
        productId: products[7].id,
        warehouseId: warehouses[1].id,
      },
    },
    data: { quantity: { decrement: 500 } },
  });
  await prisma.stock.update({
    where: {
      productId_warehouseId: {
        productId: products[9].id,
        warehouseId: warehouses[1].id,
      },
    },
    data: { quantity: { decrement: 800 } },
  });

  // Delivery 3 - Pending (Not validated)
  const delivery3 = await prisma.delivery.create({
    data: {
      deliveryNo: "DEL-2024-003",
      warehouseId: warehouses[2].id,
      customer: "Retail Store Chain",
      userId: user1.id,
      status: "draft",
      lines: {
        create: [
          { productId: products[10].id, quantity: 100 },
          { productId: products[11].id, quantity: 20 },
        ],
      },
    },
  });

  console.log("✅ Deliveries created");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   👤 Users: 2`);
  console.log(`   🏭 Warehouses: 4`);
  console.log(`   📦 Products: 15`);
  console.log(`   📥 Receipts: 6 (5 validated, 1 pending)`);
  console.log(`   📤 Deliveries: 3 (2 validated, 1 pending)`);
  console.log(`   📊 Stock Entries: Multiple across warehouses`);
  console.log("\n✅ Login credentials:");
  console.log("   Email: admin@coreinventory.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
