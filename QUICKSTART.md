# Smart Retail - Quick Reference

## 🚀 Quick Start Commands

### First Time Setup
```bash
chmod +x setup.sh
./setup.sh
```

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Reseed Database
```bash
cd backend
npm run seed
```

## 🔑 Login Credentials

**Admin:**
- Email: admin@smartretail.com
- Password: admin123

**Staff:**
- Email: staff@smartretail.com
- Password: staff123

**Customers:** No login required (guest checkout)

## 📱 Key URLs

- **Homepage:** http://localhost:5173
- **Shop:** http://localhost:5173/shop
- **Cart:** http://localhost:5173/cart
- **Exchange:** http://localhost:5173/exchange
- **Admin Panel:** http://localhost:5173/admin
- **Exit Verification:** http://localhost:5173/verification
- **API Health:** http://localhost:5000/health

## 🎯 Demo Flow

### Customer Shopping
1. Visit Shop page
2. Click "Scan Product QR" or add items directly
3. Manage cart
4. Proceed to checkout
5. Enter email and phone
6. "Complete payment" (demo mode)
7. Save verification QR
8. Show QR at exit

### Staff Verification
1. Login as staff
2. Go to "Verify Exit"
3. Click "Start Scanner"
4. Scan customer's verification QR
5. System shows verification result
6. Approve or reject

### Product Exchange
1. Go to Exchange page
2. Scan bill QR code
3. Select items to exchange
4. Choose new products
5. System calculates difference
6. Complete exchange
7. Get new verification QR

### Admin Operations
1. Login as admin
2. Dashboard: View stats and trends
3. Products: Add/edit/delete products
4. Orders: Monitor all orders
5. Exchanges: Track exchange history

## 🛠️ Troubleshooting

### MongoDB Not Running
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Reset Database
```bash
cd backend
npm run seed
```

### Clear Node Modules
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📊 Sample Products

The seed script creates 12 products across categories:
- Electronics (headphones, smartwatch, speaker)
- Clothing (t-shirt, jeans)
- Footwear (running shoes, sneakers)
- Accessories (water bottle, backpack, phone case)
- Stationery (notebooks, pens)

## 🔐 API Authentication

Most endpoints are public. Protected routes:
- Admin routes: Require admin role
- Staff routes: Require staff or admin role
- Verification: Requires staff or admin

Token format: `Authorization: Bearer <token>`

## 💡 Tips

1. **QR Scanning:** Allow camera permissions in browser
2. **Testing:** Use mobile view for best QR scanning experience
3. **Payment:** Demo mode - just click "I've Completed Payment"
4. **Exchange Window:** Products can be exchanged within 24 hours
5. **Multiple Carts:** Each browser session has separate cart

## 🎨 Customization

### Change Exchange Window
In backend `.env`:
```
EXCHANGE_WINDOW_HOURS=48
```

### Change Tax Rates
Edit product tax rates in admin panel

### Add Categories
Just create products with new category names

## 📝 Notes

- This is a hackathon/demo project
- Payment integration is mocked
- Email sending is optional (configured in .env)
- QR codes are generated automatically
- Bills are stored in backend/uploads/

## 🐛 Known Issues

1. QR scanner requires HTTPS in production
2. Camera permissions needed for QR scanning
3. PDF generation may fail without proper fonts
4. Session storage uses localStorage (not persistent across devices)

## 📞 Support

For issues or questions, check the main README.md file.
