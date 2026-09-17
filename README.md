# Smart Retail - Queue-less Shopping Application

A full-stack web application that enables queue-less shopping using QR codes, instant digital billing, secure exit verification, and QR-based product exchange.

## 🌟 Features

### Customer Experience
- **QR-Based Shopping**: Scan product QR codes to add items to cart
- **Real-time Cart Management**: Edit quantities, remove items, view totals with taxes
- **UPI Payment Integration**: Generate UPI QR for instant payment
- **Digital Bill**: Auto-generated PDF bill sent to email
- **Exit Verification**: QR code verification at store exit
- **Product Exchange**: Easy exchange within 24 hours with price difference calculation

### Admin Panel
- **Product Management**: CRUD operations with auto QR generation
- **Sales Dashboard**: Real-time sales analytics and trends
- **Order Monitoring**: View all orders and their status
- **Exchange History**: Track all product exchanges
- **Performance Metrics**: Product-wise sales performance

### Staff Features
- **Exit Verification Scanner**: Scan and verify customer exit QR codes
- **Order Validation**: Instant verification of payment and items

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router DOM
- Axios
- html5-qrcode (for scanning)
- qrcode.react (for display)
- Vite

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- QRCode (for generation)
- PDFKit (for bill generation)
- Nodemailer (for email)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd "Smart retail app"
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start MongoDB (if not running)
# On macOS with Homebrew:
brew services start mongodb-community

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 👤 Default Login Credentials

### Admin Account
- Email: `admin@smartretail.com`
- Password: `admin123`

### Staff Account
- Email: `staff@smartretail.com`
- Password: `staff123`

**Guest Shopping**: No login required for customers!

## 📱 User Flows

### Customer Flow

1. **Browse Products**
   - Visit `/shop` or scan product QR codes
   - View products with prices and taxes

2. **Add to Cart**
   - Scan QR or click "Add to Cart"
   - Manage quantities in cart

3. **Checkout**
   - Enter email and phone
   - Generate UPI payment QR
   - Confirm payment (demo mode)

4. **Order Success**
   - Receive verification QR code
   - Download digital bill
   - Show QR at exit

5. **Exit Verification**
   - Staff scans verification QR
   - System validates payment
   - Customer exits

### Exchange Flow

1. Scan original bill QR code
2. Select items to exchange
3. Choose new products
4. System calculates price difference:
   - Pay extra if new item costs more
   - Receive store credit if less
5. Complete exchange
6. Get new verification QR

### Admin Flow

1. Login with admin credentials
2. Access admin dashboard
3. Manage products (CRUD operations)
4. Monitor orders and sales
5. View exchange history
6. Track performance metrics

## 🔑 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders/create` - Create order
- `POST /api/orders/:orderId/confirm-payment` - Confirm payment
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders` - Get all orders

### Cart
- `GET /api/cart/:sessionId` - Get cart
- `POST /api/cart/:sessionId/add` - Add item
- `PUT /api/cart/:sessionId/item/:productId` - Update quantity
- `DELETE /api/cart/:sessionId/item/:productId` - Remove item

### Exchange
- `POST /api/exchange/initiate` - Start exchange
- `POST /api/exchange/process` - Process exchange
- `POST /api/exchange/:exchangeId/complete` - Complete exchange

### Verification
- `POST /api/verification/verify` - Verify exit QR (staff)
- `GET /api/verification/check/:orderId` - Check status

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/sales` - Sales report
- `GET /api/admin/exchanges` - Exchange history

## 🎨 Key Features Explained

### QR Code Generation
- Every product gets a unique QR code
- Verification QR generated after payment
- Exchange generates new QR codes

### Payment Flow (Demo)
- UPI QR displayed for payment
- Manual confirmation (in production, use Razorpay webhook)
- Instant bill generation

### Exit Verification
- Staff scans customer's QR
- System validates:
  - Payment completion
  - Order authenticity
  - Items purchased
- Prevents duplicate exits

### Product Exchange
- 24-hour exchange window
- Automatic price calculation
- Generates payment QR or store credit
- Updated invoice with new QR

## 📦 Project Structure

```
Smart retail app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Exchange.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── exchange.routes.js
│   │   ├── verification.routes.js
│   │   └── admin.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── utils/
│   │   ├── qrGenerator.js
│   │   └── pdfGenerator.js
│   ├── scripts/
│   │   └── seedData.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ShopPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderSuccessPage.jsx
│   │   │   ├── ExchangePage.jsx
│   │   │   ├── VerificationPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       └── AdminExchanges.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🔧 Environment Variables

Backend `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-retail
JWT_SECRET=your-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EXCHANGE_WINDOW_HOURS=24
```

## 🎯 Demo Workflow

1. **Start Application**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Customer Shopping**
   - Visit http://localhost:5173
   - Click "Start Shopping"
   - Add products to cart
   - Checkout and complete payment
   - Get verification QR

3. **Staff Verification**
   - Login as staff
   - Go to "Verify Exit"
   - Scan customer's QR
   - Verify and approve exit

4. **Product Exchange**
   - Go to "Exchange" page
   - Scan bill QR
   - Select items to exchange
   - Choose new products
   - Complete exchange

5. **Admin Panel**
   - Login as admin
   - View dashboard
   - Manage products
   - Monitor orders

## 🚀 Production Deployment

### Backend
1. Set environment variables
2. Use production MongoDB URI
3. Enable HTTPS
4. Configure CORS properly
5. Integrate real payment gateway (Razorpay)

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Update API base URL

## 🤝 Contributing

This is a hackathon project. Feel free to fork and enhance!

## 📝 License

MIT License

## 👨‍💻 Author

Built for Smart Retail Hackathon 2026

## 🎉 Acknowledgments

- QR code technology for seamless shopping
- Modern web technologies for fast, responsive UI
- MongoDB for flexible data storage
