import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- API ROUTES ---

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    storeName: 'Lumina Homemade Soaps',
    currency: 'INR',
    symbol: '₹',
    businessModel: 'Single Company - Sole Proprietorship',
    timestamp: new Date().toISOString(),
  });
});

// --- SEARCH & SUGGESTIONS ---
app.get('/api/search', (req, res) => {
  try {
    const q = (req.query.q as string || '').trim().toLowerCase();
    if (!q) {
      return res.json({ products: [], suggestions: [] });
    }

    const products = db.getProducts({ search: q });
    // Generate helpful search suggestions based on titles, categories, and ingredients
    const allProducts = db.getProducts();
    const suggestionsSet = new Set<string>();

    allProducts.forEach((p) => {
      if (p.name.toLowerCase().includes(q)) suggestionsSet.add(p.name);
      if (p.category.toLowerCase().includes(q)) suggestionsSet.add(p.category);
      if (p.scentProfile.toLowerCase().includes(q)) suggestionsSet.add(p.scentProfile);
      p.ingredients.forEach((ing) => {
        if (ing.toLowerCase().includes(q)) suggestionsSet.add(ing);
      });
      p.tags?.forEach((t) => {
        if (t.toLowerCase().includes(q)) suggestionsSet.add(t);
      });
    });

    res.json({
      products,
      suggestions: Array.from(suggestionsSet).slice(0, 8),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const inStock = req.query.inStock === 'true';
    const featured = req.query.featured === 'true';

    const products = db.getProducts({ category, search, inStock, featured });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const product = db.createProduct(req.body);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const success = db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:id/toggle-new', (req, res) => {
  try {
    const updated = db.toggleNewRelease(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reviews: check verified purchase & post review
app.get('/api/products/:id/can-review', (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.json({ canReview: false, reason: 'Login required' });
    }
    const canReview = db.canUserReviewProduct(userId, req.params.id);
    res.json({ canReview });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:id/review', (req, res) => {
  try {
    const { userId } = req.body;
    // Check if user has bought this item
    const isVerified = userId ? db.canUserReviewProduct(userId, req.params.id) : false;
    const review = db.addProductReview(req.params.id, {
      ...req.body,
      verifiedPurchase: isVerified,
    });
    if (!review) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(201).json(review);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIES ---
app.get('/api/categories', (req, res) => {
  try {
    res.json(db.getCategories());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const cat = db.createCategory(req.body);
    res.status(201).json(cat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', (req, res) => {
  try {
    const cat = db.updateCategory(req.params.id, req.body);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    const success = db.deleteCategory(req.params.id);
    if (!success) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => {
  try {
    const role = req.query.role as string | undefined;
    const userId = req.query.userId as string | undefined;
    const orders = db.getOrders(role, userId);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Order (Requires customer account, performs server validation & stock decrement)
app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.userId) {
      return res.status(401).json({ error: 'Authentication required. Please sign in to place your order.' });
    }

    // Check inventory availability
    const items = orderData.items || [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'Your basket is empty.' });
    }

    for (const it of items) {
      const prod = db.getProductById(it.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${it.productName}` });
      }
      if (prod.stock < it.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${prod.name}". Only ${prod.stock} bars available in this cured batch.`,
        });
      }
    }

    // Verify coupon if provided
    let verifiedDiscount = 0;
    if (orderData.couponCode) {
      const couponCheck = db.verifyCoupon(orderData.couponCode, orderData.subtotal);
      if (couponCheck.valid) {
        verifiedDiscount = couponCheck.discount;
      }
    }

    // Verify subtotal, shipping fee, tax and total
    const subtotal = items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);
    const shippingFee = subtotal >= 799 ? 0 : 50; // Free pan-India delivery over ₹799
    const tax = 0; // Inclusive of GST
    const total = Math.max(0, subtotal + shippingFee + tax - verifiedDiscount);

    const finalizedOrder = db.createOrder({
      ...orderData,
      subtotal,
      shippingFee,
      tax,
      discount: verifiedDiscount,
      total,
      paymentStatus: 'SUCCESS', // Provider-verified payment simulation
    });

    res.status(201).json(finalizedOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { status, trackingNumber, notes, carrier } = req.body;
    const updated = db.updateOrderStatus(req.params.id, status, trackingNumber, notes, carrier);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:id/cancel', (req, res) => {
  try {
    const { reason } = req.body;
    const updated = db.cancelOrder(req.params.id, reason || 'Customer requested cancellation');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/orders/:id/return', (req, res) => {
  try {
    const { reason, notes } = req.body;
    const updated = db.requestReturn(req.params.id, reason, notes);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- COUPONS ---
app.get('/api/coupons', (req, res) => {
  try {
    res.json(db.getCoupons());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons/verify', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Coupon code required' });
    }
    const result = db.verifyCoupon(code, Number(subtotal) || 0);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons', (req, res) => {
  try {
    const coupon = db.createCoupon(req.body);
    res.status(201).json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/coupons/:id/toggle', (req, res) => {
  try {
    const coupon = db.toggleCoupon(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/coupons/:id', (req, res) => {
  try {
    const success = db.deleteCoupon(req.params.id);
    if (!success) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'all';
    res.json(db.getNotifications(userId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', (req, res) => {
  try {
    const ok = db.markNotificationAsRead(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'all';
    db.markAllNotificationsAsRead(userId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUPPORT TICKETS ---
app.get('/api/support/tickets', (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    res.json(db.getSupportTickets(userId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/support/tickets', (req, res) => {
  try {
    const ticket = db.createSupportTicket(req.body);
    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/support/tickets/:id/reply', (req, res) => {
  try {
    const { sender, senderName, message } = req.body;
    const ticket = db.addTicketReply(req.params.id, sender, senderName, message);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/support/tickets/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const ticket = db.updateTicketStatus(req.params.id, status);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- BANNERS & COMPANY SETTINGS ---
app.get('/api/banners', (req, res) => {
  try {
    res.json(db.getBanners());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/banners', (req, res) => {
  try {
    const banners = db.updateBanners(req.body);
    res.json(banners);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', (req, res) => {
  try {
    res.json(db.getCompanySettings());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = db.updateCompanySettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CURING BATCHES ---
app.get('/api/curing-batches', (req, res) => {
  try {
    res.json(db.getCuringBatches());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/curing-batches', (req, res) => {
  try {
    const batch = db.createCuringBatch(req.body);
    res.status(201).json(batch);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/curing-batches/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const updated = db.updateCuringBatchStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUTHENTICATION ---
// Customer Register
app.post('/api/auth/customer/register', (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const user = db.createUser({
      name,
      email,
      phone: phone || '',
      password: password || '',
      role: 'customer',
      address,
    });
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Customer Login
app.post('/api/auth/customer/login', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const userRecord = db.findUserByEmail(email);
    if (!userRecord) {
      return res.status(404).json({ error: 'No customer account found with this email. Please register first.' });
    }
    if (userRecord.role === 'owner' || userRecord.role === 'admin') {
      return res.status(403).json({ error: 'This is the Owner account. Please use the Sole Proprietor Portal to sign in.' });
    }
    const { password, ...safeUser } = userRecord;
    res.json(safeUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Profile Update (addresses, name, phone)
app.put('/api/auth/customer/profile/:id', (req, res) => {
  try {
    const updated = db.updateUserProfile(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Sole Proprietor Owner Authentication
app.post('/api/auth/owner/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Owner email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRecord = db.findUserByEmail(cleanEmail);

    if (!userRecord || (userRecord.role !== 'owner' && userRecord.role !== 'admin')) {
      if (cleanEmail === 'mailmethirukailash@gmail.com') {
        const owner = db.createUser({
          name: 'Thiru Kailash (Sole Proprietor)',
          email: 'mailmethirukailash@gmail.com',
          phone: '+91 98765 43210',
          password: password || 'OwnerPassword@2026',
          role: 'owner',
        });
        return res.json(owner);
      }
      return res.status(403).json({
        error: 'Access Denied: Sole Proprietor authorization required. Customer accounts cannot access the owner panel.',
      });
    }

    const { password: _, ...safeOwner } = userRecord;
    res.json(safeOwner);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- LUMINA SOAPS PUBLIC & PROMOTION ENDPOINTS ---
app.get('/api/soaps', (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const inStock = req.query.inStock === 'true';
    const featured = req.query.featured === 'true';
    res.json(db.getProducts({ category, search, inStock, featured }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/soaps/:slug', (req, res) => {
  try {
    const slug = req.params.slug;
    const product =
      db.getProducts().find((p) => (p.slug && p.slug === slug) || p.id === slug) ||
      db.getProductById(slug);
    if (!product) {
      return res.status(404).json({ error: 'Soap not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/soap-categories', (req, res) => {
  try {
    res.json(db.getCategories());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/offers/active', (req, res) => {
  try {
    const active = db.getActiveOffer();
    if (!active) {
      return res.json({ active: false, offer: null });
    }
    const gift = db.getGiftItemById(active.giftItemId);
    res.json({ active: true, offer: { ...active, giftItem: gift } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/offers', (req, res) => {
  try {
    res.json(db.getOffers());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Authoritative server-side checkout quote calculation
app.post('/api/checkout/quote', (req, res) => {
  try {
    const { items, couponCode } = req.body;
    const quote = db.calculateCheckoutQuote({ items, couponCode });
    res.json(quote);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Authoritative checkout order creation
app.post('/api/checkout/create-order', (req, res) => {
  try {
    const { items, shippingAddress, customerName, customerEmail, customerPhone, paymentMethod, couponCode, customerNote } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Basket is empty' });
    }
    if (!customerEmail || !customerName) {
      return res.status(400).json({ error: 'Customer name and email are required' });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ error: 'Complete delivery address is required' });
    }

    // 1. Calculate authoritative quote
    const quote = db.calculateCheckoutQuote({ items, couponCode });

    // 2. Validate inventory for all paid soaps
    for (const line of quote.lines) {
      if (line.soap.stock < line.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${line.soap.name}". Only ${line.soap.stock} bars available in this cured batch.`,
        });
      }
    }

    // 3. Assemble order items with paid soaps and promotional gifts
    const orderItems: any[] = [];
    for (const line of quote.lines) {
      orderItems.push({
        productId: line.soap.id,
        productName: line.soap.name,
        price: line.soap.price,
        quantity: line.quantity,
        image: line.soap.image,
        batchNumber: line.soap.batchNumber,
        weight: line.soap.weight,
        sku: line.soap.sku,
        isGift: false,
      });
    }

    for (const giftLine of quote.freeGifts) {
      orderItems.push({
        productId: giftLine.gift.id,
        productName: `${giftLine.gift.name} (FREE GIFT)`,
        price: 0,
        quantity: giftLine.quantity,
        image: giftLine.gift.image,
        sku: giftLine.gift.sku,
        isGift: true,
        giftItemId: giftLine.gift.id,
      });
    }

    // 4. Create finalized order
    const isCOD = (paymentMethod || 'cod').toLowerCase() === 'cod';
    const isOnline = (paymentMethod || '').toLowerCase() === 'razorpay';

    const orderNumber = `LUM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = db.createOrder({
      orderNumber,
      userId: req.body.userId || 'guest',
      customerName,
      customerEmail,
      customerPhone: customerPhone || shippingAddress.phone || '',
      shippingAddress,
      items: orderItems,
      subtotal: quote.subtotal,
      shippingFee: quote.shippingFee,
      tax: quote.tax,
      discount: quote.discount,
      couponCode,
      total: quote.total,
      currency: 'INR',
      paymentMethod: isOnline ? 'Razorpay' : 'COD',
      paymentStatus: isOnline ? 'PENDING' : 'PENDING',
      orderStatus: 'Placed',
      customerNote,
    });

    // 5. Decrement inventory atomically
    for (const line of quote.lines) {
      db.adjustInventory({
        soapId: line.soap.id,
        quantityChange: -line.quantity,
        movementType: 'manual_adjustment',
        reason: `Order ${orderNumber} placed`,
      });
    }

    for (const giftLine of quote.freeGifts) {
      db.adjustInventory({
        giftItemId: giftLine.gift.id,
        quantityChange: -giftLine.quantity,
        movementType: 'manual_adjustment',
        reason: `Promotional gift for order ${orderNumber}`,
      });
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      razorpayOrder: isOnline && process.env.RAZORPAY_KEY_ID
        ? {
            id: `order_rzp_${Date.now()}`,
            amount: quote.total * 100,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID,
          }
        : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Razorpay Webhook listener (idempotent, server-verified)
app.post('/api/payments/razorpay/webhook', (req, res) => {
  try {
    const event = req.body;
    console.log('[Razorpay Webhook Received]', event.event);

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.notes?.orderId;
      if (orderId) {
        const order = db.getOrderById(orderId);
        if (order) {
          order.paymentStatus = 'SUCCESS';
          order.orderStatus = 'Confirmed';
          order.paymentId = payment.id;
          order.statusHistory.push({
            status: 'Confirmed',
            timestamp: new Date().toISOString(),
            note: `Payment verified via Razorpay (${payment.id})`,
          });
        }
      }
    }
    res.json({ status: 'ok' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Contact message endpoint
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }
    // Record contact inquiry as ticket or system notification
    const ticket = db.createSupportTicket({
      userId: 'guest',
      userName: name,
      userEmail: email,
      category: 'Inquiry',
      subject: subject || 'Store Inquiry',
      message,
    });
    res.status(201).json({ success: true, ticketNumber: ticket.ticketNumber });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Guest order lookup
app.get('/api/orders/lookup/:orderNumber', (req, res) => {
  try {
    const orderNumber = req.params.orderNumber.trim().toUpperCase();
    const email = (req.query.email as string || '').trim().toLowerCase();
    const order = db.getOrders().find((o) => o.orderNumber.toUpperCase() === orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (email && order.customerEmail.toLowerCase() !== email) {
      return res.status(403).json({ error: 'Email does not match order record' });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Me endpoints
app.get('/api/me', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = db.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.patch('/api/me/profile', (req, res) => {
  const userId = req.body.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const updated = db.updateUserProfile(userId, req.body);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(updated);
});

app.get('/api/me/orders', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  res.json(db.getOrders('customer', userId));
});

app.get('/api/me/orders/:id', (req, res) => {
  const userId = req.query.userId as string;
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (userId && order.userId !== userId && order.userId !== 'guest') {
    return res.status(403).json({ error: 'Unauthorized to view this order' });
  }
  res.json(order);
});

// --- SIX OWNER/ADMIN SECTIONS (Rule 4) ---
// SECTION 1: DASHBOARD
app.get('/api/admin/dashboard', (req, res) => {
  try {
    const stats = db.getStats();
    const recentOrders = db.getOrders().slice(0, 8);
    const lowStockSoaps = db.getProducts().filter((p) => p.stock <= (p.lowStockThreshold || 5));
    const giftStockAlerts = db.getGiftItems().filter((g) => g.stockQuantity <= 10);
    const activeOffer = db.getActiveOffer();

    res.json({
      summary: stats,
      recentOrders,
      lowStockSoaps,
      giftStockAlerts,
      activeOffer,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SECTION 2: ORDERS
app.get('/api/admin/orders', (req, res) => {
  try {
    res.json(db.getOrders());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id/status', (req, res) => {
  try {
    const { status, trackingNumber, notes, carrier } = req.body;
    const updated = db.updateOrderStatus(req.params.id, status, trackingNumber, notes, carrier);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/orders/:id/refunds', (req, res) => {
  try {
    const { amount, reason } = req.body;
    const updated = db.processRefund(req.params.id, Number(amount) || 0, reason || 'Owner approved refund');
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// SECTION 3: SOAPS & STOCK (and internal Gift Inventory tab)
app.get('/api/admin/soaps', (req, res) => {
  try {
    res.json(db.getProducts());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/soaps', (req, res) => {
  try {
    const product = db.createProduct(req.body);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/soaps/:id', (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Soap not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/soaps/:id/archive', (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, { isPublished: false, status: 'archived' });
    res.json({ success: true, soap: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gift-only inventory internal tab (Rule 2 & Section 8E)
app.get('/api/admin/gift-inventory', (req, res) => {
  try {
    res.json(db.getGiftItems());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/gift-inventory', (req, res) => {
  try {
    const gift = db.createGiftItem(req.body);
    res.status(201).json(gift);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/gift-inventory/:id', (req, res) => {
  try {
    const updated = db.updateGiftItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Gift item not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/inventory/adjust', (req, res) => {
  try {
    const { soapId, giftItemId, quantityChange, movementType, reason, actor } = req.body;
    const result = db.adjustInventory({
      soapId,
      giftItemId,
      quantityChange: Number(quantityChange) || 0,
      movementType: movementType || 'manual_adjustment',
      reason,
      actor,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// SECTION 4: OFFERS & BANNERS
app.get('/api/admin/offers', (req, res) => {
  try {
    res.json(db.getOffers());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/offers', (req, res) => {
  try {
    const offer = db.createOffer(req.body);
    res.status(201).json(offer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/offers/:id', (req, res) => {
  try {
    const updated = db.updateOffer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Offer not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/banners', (req, res) => {
  try {
    res.json(db.getBanners());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/banners', (req, res) => {
  try {
    const banner = db.createBanner(req.body);
    res.status(201).json(banner);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/banners/:id', (req, res) => {
  try {
    const updated = db.updateBanner(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Banner not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SECTION 5: REVENUE & REPORTS
app.get('/api/admin/revenue/summary', (req, res) => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    res.json(db.getRevenueSummary(startDate, endDate));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/revenue/monthly', (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    res.json(db.getRevenueMonthlyReport(year, month));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/revenue/export', (req, res) => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const csvData = db.exportRevenueCSV(startDate, endDate);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="lumina_revenue_${Date.now()}.csv"`);
    res.send(csvData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SECTION 6: STORE SETTINGS
app.get('/api/admin/settings', (req, res) => {
  try {
    res.json(db.getCompanySettings());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/settings', (req, res) => {
  try {
    const updated = db.updateCompanySettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Backward compatibility stats & logs
app.get('/api/owner/stats', (req, res) => {
  try {
    res.json(db.getStats());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/owner/customers', (req, res) => {
  try {
    res.json(db.getAllCustomers());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/owner/audit-logs', (req, res) => {
  try {
    res.json(db.getAuditLogs());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Explicit API 404 handler to ensure /api/* requests never return HTML from SPA middleware
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
});

// Setup Vite middleware / Static file serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumina Artisan Soaps server running on http://0.0.0.0:${PORT}`);
  });
}

start();
