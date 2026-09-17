# 🏗️ Smart Retail - System Architecture

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER DEVICES                          │
│           (Mobile Browsers / Desktop Browsers)               │
│                 Mobile-First Responsive UI                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS / REST API
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  FRONTEND LAYER                              │
│                   (React + Vite)                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Customer   │  │    Staff     │  │    Admin     │     │
│  │     App      │  │  Verification│  │    Panel     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  • QR Scanning (html5-qrcode)                               │
│  • State Management (Context API)                           │
│  • Routing (React Router)                                   │
│  • Styling (Tailwind CSS)                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Axios HTTP Client
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  BACKEND LAYER                               │
│              (Node.js + Express.js)                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API ROUTES                               │  │
│  │                                                       │  │
│  │  • /api/auth      (Authentication)                   │  │
│  │  • /api/products  (Product Management)               │  │
│  │  • /api/cart      (Shopping Cart)                    │  │
│  │  • /api/orders    (Order Processing)                 │  │
│  │  • /api/exchange  (Product Exchange)                 │  │
│  │  • /api/verification (Exit Verification)             │  │
│  │  • /api/admin     (Admin Operations)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           MIDDLEWARE LAYER                            │  │
│  │                                                       │  │
│  │  • JWT Authentication                                 │  │
│  │  • Role-Based Access Control                         │  │
│  │  • Error Handling                                     │  │
│  │  • Request Validation                                 │  │
│  │  • CORS Configuration                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            UTILITY SERVICES                           │  │
│  │                                                       │  │
│  │  • QR Code Generator                                  │  │
│  │  • PDF Bill Generator                                 │  │
│  │  • Email Service (Optional)                           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Mongoose ODM
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  DATABASE LAYER                              │
│                     (MongoDB)                                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Products   │  │    Orders    │  │   Exchanges  │     │
│  │  Collection  │  │  Collection  │  │  Collection  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐                                           │
│  │    Users     │                                           │
│  │  Collection  │                                           │
│  └──────────────┘                                           │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagrams

### Customer Shopping Flow

```
Customer → Browse Products → Scan QR / Add Item
                ↓
           Shopping Cart
                ↓
         Enter Details → Create Order
                ↓
         Generate UPI QR
                ↓
        Customer Pays (UPI App)
                ↓
       Confirm Payment → Generate Verification QR
                ↓
        Generate Bill PDF
                ↓
    Show Success + Verification QR
                ↓
         Exit Store → Staff Scans QR
                ↓
        System Validates
                ↓
       Customer Exits
```

### Exit Verification Flow

```
Customer Reaches Exit
        ↓
Shows Verification QR
        ↓
Staff Opens Scanner
        ↓
Scans QR Code
        ↓
Backend Validates:
  • Order exists?
  • Payment completed?
  • Not already verified?
        ↓
    ┌───┴───┐
    │       │
  Valid   Invalid
    │       │
    ↓       ↓
  Allow   Deny
  Exit    Exit
```

### Product Exchange Flow

```
Customer Wants Exchange
        ↓
Scans Bill QR
        ↓
System Checks:
  • Within 24 hours?
  • Order valid?
  • Not exchanged before?
        ↓
     Valid
        ↓
Select Original Items
        ↓
Choose New Products
        ↓
Calculate Price Difference
        ↓
  ┌─────┴─────┐
  │           │
Extra   Less  │ Same
Amount  Amount│ Price
  │     │     │
  ↓     ↓     ↓
Generate Store  No Payment
Payment Credit  Needed
QR Code        │
  │     │      │
  └─────┼──────┘
        ↓
Complete Exchange
        ↓
Generate New Verification QR
        ↓
Update Invoice
```

## 🔐 Security Architecture

```
┌──────────────────────────────────────────┐
│         CLIENT REQUEST                    │
└─────────────┬────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│     JWT Token in Header                 │
│     Authorization: Bearer <token>       │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│     Auth Middleware                     │
│     • Verify Token                      │
│     • Check Expiration                  │
│     • Extract User Info                 │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│     Role-Based Access Control           │
│     • Admin-only routes                 │
│     • Staff-only routes                 │
│     • Public routes                     │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│     Request Validation                  │
│     • Input sanitization                │
│     • Schema validation                 │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│     Execute Business Logic              │
└─────────────────────────────────────────┘
```

## 🗃️ Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  sku: String (unique),
  qrCode: String (base64),
  stock: Number,
  taxRate: Number,
  imageUrl: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderId: String (unique),
  customerEmail: String,
  customerPhone: String,
  items: [
    {
      productId: ObjectId,
      productName: String,
      quantity: Number,
      price: Number,
      taxRate: Number,
      taxAmount: Number,
      totalAmount: Number
    }
  ],
  subtotal: Number,
  totalTax: Number,
  totalAmount: Number,
  paymentStatus: Enum,
  verificationQR: String,
  billPdfUrl: String,
  isVerified: Boolean,
  verifiedAt: Date,
  verifiedBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Exchanges Collection
```javascript
{
  _id: ObjectId,
  exchangeId: String (unique),
  originalOrderId: ObjectId,
  originalOrderNumber: String,
  items: [
    {
      originalProductId: ObjectId,
      originalProductName: String,
      originalQuantity: Number,
      originalPrice: Number,
      newProductId: ObjectId,
      newProductName: String,
      newQuantity: Number,
      newPrice: Number
    }
  ],
  priceDifference: Number,
  adjustmentType: Enum,
  paymentStatus: Enum,
  storeCreditAmount: Number,
  newOrderId: ObjectId,
  newVerificationQR: String,
  status: Enum,
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum (admin, staff, customer),
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 📦 Component Hierarchy

### Frontend Component Tree

```
App
├── Navbar
├── Routes
│   ├── HomePage
│   ├── ShopPage
│   │   └── ProductCard (multiple)
│   ├── CartPage
│   ├── CheckoutPage
│   ├── OrderSuccessPage
│   ├── ExchangePage
│   ├── VerificationPage
│   ├── LoginPage
│   └── Admin
│       ├── AdminDashboard
│       │   └── StatCard (multiple)
│       ├── AdminProducts
│       │   └── ProductFormModal
│       ├── AdminOrders
│       │   └── OrderDetailModal
│       └── AdminExchanges
└── LoadingSpinner (shared)
```

## 🔌 API Endpoint Structure

```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── GET /me
├── /products
│   ├── GET /
│   ├── GET /:id
│   ├── POST / (admin)
│   ├── PUT /:id (admin)
│   ├── DELETE /:id (admin)
│   └── GET /meta/categories
├── /cart
│   ├── GET /:sessionId
│   ├── POST /:sessionId/add
│   ├── PUT /:sessionId/item/:productId
│   ├── DELETE /:sessionId/item/:productId
│   └── DELETE /:sessionId
├── /orders
│   ├── POST /create
│   ├── POST /:orderId/confirm-payment
│   ├── GET /:orderId
│   ├── GET /
│   └── GET /:orderId/bill
├── /exchange
│   ├── POST /initiate
│   ├── POST /process
│   ├── POST /:exchangeId/complete
│   ├── GET /:exchangeId
│   └── GET /
├── /verification
│   ├── POST /verify (staff)
│   └── GET /check/:orderId
└── /admin
    ├── GET /dashboard
    ├── GET /sales
    ├── GET /exchanges
    └── GET /products/performance
```

## 🔄 State Management

```
AppContext (Global State)
├── user (authentication state)
├── cart
│   ├── items []
│   ├── subtotal
│   ├── totalTax
│   └── total
├── sessionId
└── Methods
    ├── login()
    ├── logout()
    ├── addToCart()
    ├── updateCartItem()
    ├── removeFromCart()
    └── clearCart()
```

## 🚀 Deployment Architecture (Production)

```
┌─────────────────────────────────────────┐
│         CDN / Edge Network              │
│         (Static Assets)                 │
└─────────────┬───────────────────────────┘
              │
┌─────────────┴───────────────────────────┐
│      Frontend Hosting                   │
│      (Vercel / Netlify)                 │
└─────────────┬───────────────────────────┘
              │ API Calls
              ↓
┌─────────────────────────────────────────┐
│      Backend Server                     │
│      (AWS / Heroku / DigitalOcean)      │
│      • Node.js App                      │
│      • Load Balancer                    │
│      • SSL/TLS                          │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│      Database                           │
│      (MongoDB Atlas)                    │
│      • Replica Set                      │
│      • Auto Scaling                     │
│      • Backups                          │
└─────────────────────────────────────────┘
```

## 📊 Performance Considerations

```
Frontend Optimizations:
• Code splitting (React.lazy)
• Image optimization
• CSS purging (Tailwind)
• Bundle size optimization (Vite)
• Browser caching

Backend Optimizations:
• Database indexing
• Query optimization
• Response compression
• Rate limiting
• Caching (Redis - future)

Database Optimizations:
• Compound indexes
• Projection queries
• Aggregation pipelines
• Connection pooling
```

---

**This architecture supports:**
- ✅ Horizontal scalability
- ✅ High availability
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Maintainable codebase
