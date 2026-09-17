const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');
const { generateProductQR } = require('../utils/qrGenerator');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-retail';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@smartretail.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 43210'
    });
    await admin.save();
    console.log('👤 Created admin user');

    // Create staff user
    const staff = new User({
      name: 'Staff Member',
      email: 'staff@smartretail.com',
      password: 'staff123',
      role: 'staff',
      phone: '+91 98765 43211'
    });
    await staff.save();
    console.log('👤 Created staff user');

    // Sample products
    const productsData = [
      {
        name: 'Premium Wireless Headphones',
        description: 'High-quality Bluetooth headphones with noise cancellation',
        price: 2999,
        category: 'Electronics',
        sku: 'ELEC-001',
        stock: 50,
        taxRate: 18
      },
      {
        name: 'Smart Watch Pro',
        description: 'Feature-rich smartwatch with health tracking',
        price: 4999,
        category: 'Electronics',
        sku: 'ELEC-002',
        stock: 30,
        taxRate: 18
      },
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt',
        price: 499,
        category: 'Clothing',
        sku: 'CLOTH-001',
        stock: 100,
        taxRate: 5
      },
      {
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans',
        price: 1299,
        category: 'Clothing',
        sku: 'CLOTH-002',
        stock: 75,
        taxRate: 5
      },
      {
        name: 'Running Shoes',
        description: 'Comfortable running shoes with cushioned sole',
        price: 2499,
        category: 'Footwear',
        sku: 'FOOT-001',
        stock: 40,
        taxRate: 12
      },
      {
        name: 'Casual Sneakers',
        description: 'Stylish casual sneakers for everyday wear',
        price: 1799,
        category: 'Footwear',
        sku: 'FOOT-002',
        stock: 60,
        taxRate: 12
      },
      {
        name: 'Water Bottle',
        description: 'Stainless steel insulated water bottle',
        price: 599,
        category: 'Accessories',
        sku: 'ACC-001',
        stock: 120,
        taxRate: 18
      },
      {
        name: 'Backpack',
        description: 'Durable backpack with multiple compartments',
        price: 1499,
        category: 'Accessories',
        sku: 'ACC-002',
        stock: 45,
        taxRate: 18
      },
      {
        name: 'Notebook Set',
        description: 'Set of 3 premium notebooks',
        price: 299,
        category: 'Stationery',
        sku: 'STAT-001',
        stock: 150,
        taxRate: 12
      },
      {
        name: 'Pen Set',
        description: 'Premium ballpoint pen set of 5',
        price: 199,
        category: 'Stationery',
        sku: 'STAT-002',
        stock: 200,
        taxRate: 12
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable Bluetooth speaker with bass boost',
        price: 1999,
        category: 'Electronics',
        sku: 'ELEC-003',
        stock: 35,
        taxRate: 18
      },
      {
        name: 'Phone Case',
        description: 'Protective phone case with card holder',
        price: 399,
        category: 'Accessories',
        sku: 'ACC-003',
        stock: 80,
        taxRate: 18
      }
    ];

    // Create products with QR codes
    for (const productData of productsData) {
      const product = new Product(productData);
      product.qrCode = await generateProductQR(product);
      await product.save();
    }

    console.log(`📦 Created ${productsData.length} products with QR codes`);
    console.log('\n✅ Seed data created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@smartretail.com / admin123');
    console.log('   Staff: staff@smartretail.com / staff123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
