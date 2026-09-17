const express = require('express');
const router = express.Router();

// In-memory cart storage (for demo - in production use Redis or database)
const carts = new Map();

// Get cart
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const cart = carts.get(sessionId) || { items: [], total: 0 };

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add item to cart
router.post('/:sessionId/add', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, productName, price, quantity, taxRate } = req.body;

    let cart = carts.get(sessionId) || { items: [], subtotal: 0, totalTax: 0, total: 0 };

    // Check if item exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    const itemPrice = price * quantity;
    const itemTax = (itemPrice * taxRate) / 100;
    const itemTotal = itemPrice + itemTax;

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].itemPrice = price * cart.items[existingItemIndex].quantity;
      cart.items[existingItemIndex].itemTax = (cart.items[existingItemIndex].itemPrice * taxRate) / 100;
      cart.items[existingItemIndex].itemTotal = cart.items[existingItemIndex].itemPrice + cart.items[existingItemIndex].itemTax;
    } else {
      // Add new item
      cart.items.push({
        productId,
        productName,
        price,
        quantity,
        taxRate,
        itemPrice,
        itemTax,
        itemTotal
      });
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemPrice, 0);
    cart.totalTax = cart.items.reduce((sum, item) => sum + item.itemTax, 0);
    cart.total = cart.subtotal + cart.totalTax;

    carts.set(sessionId, cart);

    res.json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update cart item quantity
router.put('/:sessionId/item/:productId', (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    const { quantity } = req.body;

    let cart = carts.get(sessionId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].itemPrice = cart.items[itemIndex].price * quantity;
      cart.items[itemIndex].itemTax = (cart.items[itemIndex].itemPrice * cart.items[itemIndex].taxRate) / 100;
      cart.items[itemIndex].itemTotal = cart.items[itemIndex].itemPrice + cart.items[itemIndex].itemTax;
    }

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemPrice, 0);
    cart.totalTax = cart.items.reduce((sum, item) => sum + item.itemTax, 0);
    cart.total = cart.subtotal + cart.totalTax;

    carts.set(sessionId, cart);

    res.json({
      success: true,
      message: 'Cart updated',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Remove item from cart
router.delete('/:sessionId/item/:productId', (req, res) => {
  try {
    const { sessionId, productId } = req.params;

    let cart = carts.get(sessionId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item.productId !== productId);

    // Recalculate totals
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.itemPrice, 0);
    cart.totalTax = cart.items.reduce((sum, item) => sum + item.itemTax, 0);
    cart.total = cart.subtotal + cart.totalTax;

    carts.set(sessionId, cart);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Clear cart
router.delete('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    carts.delete(sessionId);

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
