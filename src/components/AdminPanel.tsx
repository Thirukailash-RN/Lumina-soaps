import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Sparkles,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit,
  Clock,
  Printer,
  TrendingUp,
  Search,
  CheckCircle,
  Eye,
  Store,
  Layers,
  Calendar,
  IndianRupee,
  Gift,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Image as ImageIcon,
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '../context/StoreContext';
import {
  SoapProduct,
  SoapCategory,
  ScentProfile,
  Order,
  OrderStatus,
  formatPriceINR,
  GiftItem,
  ComboOffer,
  RevenueSummary,
} from '../types';
import { PackingSlipModal } from './PackingSlipModal';

type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'soaps-stock'
  | 'offers-banners'
  | 'revenue-reports'
  | 'store-settings';

const ALL_CATEGORIES: SoapCategory[] = [
  'Herbal & Botanical',
  'Goat Milk & Honey',
  'Exfoliating Scrub',
  'Aromatherapy & Calming',
  'Sensitive & Baby Care',
  'Artisan Swirl Gift Sets',
];

const ALL_SCENTS: ScentProfile[] = [
  'French Lavender & Sage',
  'Raw Honey & Toasted Almond',
  'Activated Charcoal & Tea Tree',
  'Eucalyptus & Peppermint',
  'Wild Rose & Geranium',
  'Sweet Orange & Lemongrass',
  'Warm Oatmeal & Vanilla',
  'Unscented Pure Castile',
];

export const AdminPanel: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleNewRelease,
    orders,
    updateOrderStatus,
    curingBatches,
    addCuringBatch,
    updateCuringBatchStatus,
    giftItems,
    addGiftItem,
    updateGiftItem,
    deleteGiftItem,
    offers,
    activeOffer,
    createOffer,
    updateOffer,
    companySettings,
    updateCompanySettings,
    getRevenueSummary,
    getRevenueMonthlyReport,
    exportRevenueCSV,
    adjustInventory,
    processRefund,
    setCurrentView,
    showNotification,
  } = useStore();

  // Exactly six main admin sections mandated by Rule 4:
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Subtabs
  const [soapsSubtab, setSoapsSubtab] = useState<'soaps' | 'gifts' | 'curing' | 'adjust'>('soaps');
  const [offersSubtab, setOffersSubtab] = useState<'offers' | 'banners'>('offers');
  const [settingsSubtab, setSettingsSubtab] = useState<'profile' | 'shipping' | 'payments' | 'policies'>('profile');

  // Orders Section State
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedPackingSlipOrder, setSelectedPackingSlipOrder] = useState<Order | null>(null);

  // Tracking Dialog State
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('India Post Speed Post');
  const [trackingUrlInput, setTrackingUrlInput] = useState('');

  // Refund Dialog State
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('Customer cancellation before dispatch');

  // Add/Edit Soap Modal
  const [isAddSoapOpen, setIsAddSoapOpen] = useState(false);
  const [editingSoap, setEditingSoap] = useState<SoapProduct | null>(null);
  const [soapName, setSoapName] = useState('');
  const [soapTagline, setSoapTagline] = useState('');
  const [soapCategory, setSoapCategory] = useState<SoapCategory>('Herbal & Botanical');
  const [soapPrice, setSoapPrice] = useState<number>(299);
  const [soapSalePrice, setSoapSalePrice] = useState<number | undefined>(undefined);
  const [soapStock, setSoapStock] = useState<number>(24);
  const [soapThreshold, setSoapThreshold] = useState<number>(5);
  const [soapBatchNumber, setSoapBatchNumber] = useState('LUM-BATCH-2026-10');
  const [soapCureDate, setSoapCureDate] = useState('Cured 6 weeks on cedar racks');
  const [soapWeight, setSoapWeight] = useState('125g (Handmade Bar)');
  const [soapScent, setSoapScent] = useState<ScentProfile>('French Lavender & Sage');
  const [soapIngredients, setSoapIngredients] = useState('Saponified Coconut Oil, Sesame Oil, Pure Neem Oil, Raw Wild Honey');
  const [soapBenefits, setSoapBenefits] = useState('Gentle moisturizing lather, antibacterial protection, natural botanical aroma');
  const [soapImage, setSoapImage] = useState('https://images.unsplash.com/photo-1607006314597-9e7960787e95?auto=format&fit=crop&w=800&q=80');
  const [soapDirections, setSoapDirections] = useState('Work into a dense, creamy lather with warm water between hands. Massage gently and rinse thoroughly.');
  const [soapWarnings, setSoapWarnings] = useState('For external use only. Discontinue use if irritation occurs.');
  const [soapIsNewRelease, setSoapIsNewRelease] = useState(true);

  // Add/Edit Gift Inventory Item Modal (Promotion-only)
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  const [giftName, setGiftName] = useState('');
  const [giftDesc, setGiftDesc] = useState('');
  const [giftImage, setGiftImage] = useState('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80');
  const [giftStock, setGiftStock] = useState<number>(100);
  const [giftSku, setGiftSku] = useState('LUM-GIFT-01');

  // Add Curing Batch Modal
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [batchSoapName, setBatchSoapName] = useState('');
  const [batchNumber, setBatchNumber] = useState('LUM-BATCH-2026-10E');
  const [batchBarCount, setBatchBarCount] = useState(32);
  const [batchOils, setBatchOils] = useState('Sweet Orange & Lemongrass Essential Oils');

  // Stock Adjustment State
  const [adjustSoapId, setAdjustSoapId] = useState('');
  const [adjustGiftId, setAdjustGiftId] = useState('');
  const [adjustChange, setAdjustChange] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'restock' | 'damage' | 'waste' | 'manual_adjustment'>('restock');
  const [adjustReason, setAdjustReason] = useState('Finished curing on cedar racks');

  // Revenue & Reports State
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [monthlyReportData, setMonthlyReportData] = useState<any>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState(companySettings);

  useEffect(() => {
    setSettingsForm(companySettings);
  }, [companySettings]);

  // Load Revenue Summary on tab switch
  useEffect(() => {
    if (activeTab === 'revenue-reports') {
      loadRevenueData();
    }
  }, [activeTab, reportYear, reportMonth]);

  const loadRevenueData = async () => {
    setRevenueLoading(true);
    try {
      const summary = await getRevenueSummary();
      setRevenueSummary(summary);
      const monthly = await getRevenueMonthlyReport(reportYear, reportMonth);
      setMonthlyReportData(monthly);
    } catch (e) {
      console.error('Failed to load revenue data', e);
    } finally {
      setRevenueLoading(false);
    }
  };

  // Operational metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === 'SUCCESS' || o.paymentStatus === 'captured' || (o.paymentMethod.toLowerCase() === 'cod' && o.orderStatus === 'Delivered'))
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Placed' || o.orderStatus === 'Pending Payment' || o.orderStatus === 'Pending Review').length;
  const lowStockSoaps = products.filter((p) => p.stock <= (p.lowStockThreshold || 5));
  const outOfStockSoaps = products.filter((p) => p.stock === 0);
  const lowStockGifts = giftItems.filter((g) => g.stockQuantity <= 15);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.orderStatus !== orderFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Recent 7 days chart data
  const chartData = useMemo(() => {
    const days: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      days[key] = 0;
    }
    orders.forEach((o) => {
      const isPaid = o.paymentStatus === 'SUCCESS' || o.paymentStatus === 'captured' || (o.paymentMethod.toLowerCase() === 'cod' && o.orderStatus === 'Delivered');
      if (isPaid) {
        const d = new Date(o.createdAt || o.date);
        const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        if (days[key] !== undefined) {
          days[key] += o.total;
        }
      }
    });
    return Object.keys(days).map((day) => ({ day, sales: days[day] }));
  }, [orders]);

  // Handle Add/Edit Soap submission
  const handleSaveSoap = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<SoapProduct> = {
      name: soapName,
      tagline: soapTagline,
      category: soapCategory,
      price: Number(soapPrice),
      originalPrice: soapSalePrice ? soapPrice : undefined,
      stock: Number(soapStock),
      lowStockThreshold: Number(soapThreshold),
      batchNumber: soapBatchNumber,
      cureDate: soapCureDate,
      weight: soapWeight,
      scentProfile: soapScent,
      ingredients: soapIngredients.split(',').map((s) => s.trim()),
      benefits: soapBenefits.split(',').map((s) => s.trim()),
      image: soapImage,
      directions: soapDirections,
      warnings: soapWarnings,
      isNewRelease: soapIsNewRelease,
      status: 'published',
      isPublished: true,
    };

    if (editingSoap) {
      await updateProduct(editingSoap.id, payload);
    } else {
      await addProduct(payload);
    }

    setIsAddSoapOpen(false);
    setEditingSoap(null);
  };

  // Handle Add/Edit Gift submission
  const handleSaveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGift) {
      await updateGiftItem(editingGift.id, {
        name: giftName,
        description: giftDesc,
        image: giftImage,
        stockQuantity: Number(giftStock),
        sku: giftSku,
      });
    } else {
      await addGiftItem({
        name: giftName,
        description: giftDesc,
        image: giftImage,
        stockQuantity: Number(giftStock),
        sku: giftSku,
        isActive: true,
      });
    }
    setIsAddGiftOpen(false);
    setEditingGift(null);
  };

  // Handle Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCompanySettings(settingsForm);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2c241d] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#241c14] text-white px-6 py-4 border-b border-amber-900/40 sticky top-0 z-30 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white p-1 shadow flex items-center justify-center">
            <img src="/logo.svg" alt="Lumina Soaps" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-lg tracking-wide text-[#faf7f2]">
                LUMINA SOAPS
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-wider">
                Sole Proprietor Admin
              </span>
            </div>
            <p className="text-[11px] text-amber-200/70">
              Nature in Every Lather. • Owner: Thiru Kailash
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('home')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-900/60 text-amber-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-700/50"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Storefront Preview</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar & Content */}
      <div className="flex-1 flex">
        {/* Exactly 6 Main Navigation Sections (Rule 4) */}
        <aside className="w-64 bg-[#2b2219] text-[#e8dfd5] border-r border-[#3d3226] p-4 flex flex-col gap-1.5 select-none shrink-0">
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-200/60 px-3 py-1 mb-1">
            Owner Navigation
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-600 text-white shadow-md'
                : 'hover:bg-[#382d21] text-[#d5c7b7]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-300" />
            <span>1. Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-md'
                : 'hover:bg-[#382d21] text-[#d5c7b7]'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>2. Orders</span>
            </div>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-400 text-black font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('soaps-stock')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'soaps-stock'
                ? 'bg-amber-600 text-white shadow-md'
                : 'hover:bg-[#382d21] text-[#d5c7b7]'
            }`}
          >
            <Package className="w-4 h-4 text-amber-300" />
            <span>3. Soaps & Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('offers-banners')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'offers-banners'
                ? 'bg-amber-600 text-white shadow-md'
                : 'hover:bg-[#382d21] text-[#d5c7b7]'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-300" />
            <span>4. Offers & Banners</span>
          </button>

          <button
            onClick={() => setActiveTab('revenue-reports')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'revenue-reports'
                ? 'bg-amber-600 text-white shadow-md'
                : 'hover:bg-[#382d21] text-[#d5c7b7]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>5. Revenue & Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('store-settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'store-settings'
                ? 'bg-amber-600 text-white shadow-md'
                : 'hover:bg-[#382d21] text-[#d5c7b7]'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span>6. Store Settings</span>
          </button>

          <div className="mt-auto pt-6 border-t border-[#3d3226] text-[11px] text-[#a99887] space-y-1">
            <div className="font-semibold text-white">Lumina Cold Process Studio</div>
            <div>Database: Supabase PostgreSQL</div>
            <div>Payments: Razorpay + COD</div>
            <div className="text-[10px] text-amber-300/80 pt-1">
              Active Offer: Buy 6 Soaps, Get 1 Free Gift
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl overflow-y-auto">
          {/* ======================================================== */}
          {/* SECTION 1: DASHBOARD                                    */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#241c14]">Operational Dashboard</h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Real-time studio operations, sales volume, and inventory health for Lumina Soaps.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-xs text-stone-500 font-medium">Collected Revenue</div>
                  <div className="text-2xl font-serif font-bold text-[#203a1f] mt-1">
                    {formatPriceINR(totalRevenue)}
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Real confirmed payments</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-xs text-stone-500 font-medium">Orders to Fulfill</div>
                  <div className="text-2xl font-serif font-bold text-amber-900 mt-1">
                    {pendingOrdersCount}
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium mt-1">
                    {orders.length} total historical orders
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-xs text-stone-500 font-medium">Active Soap Listings</div>
                  <div className="text-2xl font-serif font-bold text-stone-800 mt-1">
                    {products.filter((p) => p.status !== 'archived').length}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    {products.reduce((sum, p) => sum + p.stock, 0)} total cured bars
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-xs text-stone-500 font-medium">Stock Alerts</div>
                  <div className="text-2xl font-serif font-bold text-rose-800 mt-1">
                    {lowStockSoaps.length + lowStockGifts.length}
                  </div>
                  <div className="text-[11px] text-rose-700 font-medium mt-1">
                    {lowStockSoaps.length} soaps • {lowStockGifts.length} gifts low
                  </div>
                </div>
              </div>

              {/* Sales Chart */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">Weekly Revenue Velocity</h3>
                    <p className="text-xs text-stone-500">Collected sales breakdown over the last 7 days (₹ INR)</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('revenue-reports')}
                    className="text-xs text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Revenue Reports</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5a2b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8b5a2b" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e9df" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#786e64' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#786e64' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']} />
                      <Area type="monotone" dataKey="sales" stroke="#8b5a2b" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders & Stock Alerts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-stone-900 text-base">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
                    >
                      View All Orders ({orders.length})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Order #</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Items</th>
                          <th className="py-2.5 px-3">Total</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-amber-50/40">
                            <td className="py-3 px-3 font-mono font-bold text-amber-950">{o.orderNumber}</td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-stone-800">{o.customerName}</div>
                              <div className="text-[10px] text-stone-400">{new Date(o.createdAt || o.date).toLocaleDateString()}</div>
                            </td>
                            <td className="py-3 px-3 text-stone-600">
                              {o.items.filter((i) => !i.isGift).reduce((sum, i) => sum + i.quantity, 0)} soaps
                              {o.items.some((i) => i.isGift) && (
                                <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold">
                                  +Gift
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-bold text-stone-800">{formatPriceINR(o.total)}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  o.orderStatus === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.orderStatus === 'Shipped'
                                    ? 'bg-sky-100 text-sky-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {o.orderStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrderDetails(o);
                                  setActiveTab('orders');
                                }}
                                className="text-amber-800 hover:text-amber-950 font-bold hover:underline cursor-pointer"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stock & Offer Alerts */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
                    <h3 className="font-serif font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Low Stock Warnings</span>
                    </h3>

                    <div className="space-y-2.5">
                      {lowStockSoaps.length === 0 && lowStockGifts.length === 0 ? (
                        <div className="text-xs text-stone-500 py-2">All soaps and gifts well-stocked!</div>
                      ) : (
                        <>
                          {lowStockSoaps.map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50 border border-stone-200">
                              <div>
                                <div className="font-semibold text-stone-800 line-clamp-1">{p.name}</div>
                                <div className="text-[10px] text-stone-500">Cured Bar Stock: {p.stock} units</div>
                              </div>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                              </span>
                            </div>
                          ))}
                          {lowStockGifts.map((g) => (
                            <div key={g.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                              <div>
                                <div className="font-semibold text-amber-900 line-clamp-1">{g.name} (Gift)</div>
                                <div className="text-[10px] text-amber-700">Stock: {g.stockQuantity} items</div>
                              </div>
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                Free Gift Low
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Active Offer Card */}
                  <div className="bg-[#241c14] text-white rounded-2xl p-5 shadow-xs">
                    <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1">
                      Current Flagship Combo
                    </div>
                    <h4 className="font-serif font-bold text-base text-amber-100">
                      {activeOffer?.title || 'BUY 6 SOAPS, GET 1 FREE GIFT!'}
                    </h4>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                      Every 6 eligible soaps added to cart unlocks 1 complimentary gift item automatically.
                    </p>
                    <button
                      onClick={() => setActiveTab('offers-banners')}
                      className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Combo & Gifts</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: ORDERS                                       */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#241c14]">Order Management</h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    View customer orders, verify items and free gifts, update dispatch tracking, and process refunds.
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search by order #, customer name, email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full text-xs outline-none bg-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">Filter Status:</span>
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value as any)}
                    className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 font-medium outline-none"
                  >
                    <option value="all">All Statuses ({orders.length})</option>
                    <option value="Placed">Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Soap Qty</th>
                      <th className="py-3 px-4">Free Gifts</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-stone-400">
                          No customer orders found matching filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const paidSoapsCount = o.items.filter((i) => !i.isGift).reduce((sum, i) => sum + i.quantity, 0);
                        const giftCount = o.items.filter((i) => i.isGift).reduce((sum, i) => sum + i.quantity, 0);
                        return (
                          <tr key={o.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-amber-950">
                              {o.orderNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-stone-900">{o.customerName}</div>
                              <div className="text-[10px] text-stone-500">{o.customerEmail}</div>
                            </td>
                            <td className="py-3 px-4 text-stone-500">
                              {new Date(o.createdAt || o.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-medium text-stone-800">
                              {paidSoapsCount} bars
                            </td>
                            <td className="py-3 px-4">
                              {giftCount > 0 ? (
                                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                  {giftCount} Free Gift{giftCount > 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="text-stone-400 text-[11px]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-stone-900">
                              {formatPriceINR(o.total)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  o.paymentStatus === 'SUCCESS' || o.paymentStatus === 'captured'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.paymentStatus === 'REFUNDED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {o.paymentMethod.toUpperCase()} ({o.paymentStatus})
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={o.orderStatus}
                                onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                                className="text-xs bg-stone-50 border border-stone-300 rounded px-2 py-1 font-medium cursor-pointer"
                              >
                                <option value="Placed">Placed</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Packed">Packed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Refunded">Refunded</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => setSelectedOrderDetails(o)}
                                className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                                title="View Order Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedPackingSlipOrder(o)}
                                className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                                title="Print Packing Slip"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Details Modal Drawer */}
              {selectedOrderDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-stone-200">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h3 className="text-lg font-serif font-bold text-stone-900">
                          Order Details: {selectedOrderDetails.orderNumber}
                        </h3>
                        <p className="text-xs text-stone-500">
                          Placed on {new Date(selectedOrderDetails.createdAt || selectedOrderDetails.date).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrderDetails(null)}
                        className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Customer & Shipping Details */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <div>
                        <div className="font-bold text-stone-700 mb-1">Customer Info:</div>
                        <div>{selectedOrderDetails.customerName}</div>
                        <div>{selectedOrderDetails.customerEmail}</div>
                        <div>{selectedOrderDetails.customerPhone}</div>
                      </div>
                      <div>
                        <div className="font-bold text-stone-700 mb-1">Delivery Address:</div>
                        <div>{selectedOrderDetails.shippingAddress.street}</div>
                        <div>
                          {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.state} -{' '}
                          {selectedOrderDetails.shippingAddress.zipCode || selectedOrderDetails.shippingAddress.pincode}
                        </div>
                      </div>
                    </div>

                    {/* Items Breakdown (Paid Soaps vs Free Gifts) */}
                    <div>
                      <h4 className="font-bold text-xs text-stone-700 mb-2">Order Line Items:</h4>
                      <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                        {selectedOrderDetails.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-3 flex items-center justify-between border-b last:border-b-0 ${
                              item.isGift ? 'bg-amber-50/60' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg" />
                              <div>
                                <div className="font-semibold text-stone-900 flex items-center gap-2">
                                  <span>{item.productName}</span>
                                  {item.isGift && (
                                    <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                      FREE GIFT
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  Qty: {item.quantity} {item.weight ? `• ${item.weight}` : ''}
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-bold text-stone-900">
                              {item.isGift ? '₹0 (FREE)' : formatPriceINR(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals Snapshot */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-1.5">
                      <div className="flex justify-between text-stone-600">
                        <span>Subtotal:</span>
                        <span>{formatPriceINR(selectedOrderDetails.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Delivery Fee:</span>
                        <span>{selectedOrderDetails.shippingFee === 0 ? 'FREE' : formatPriceINR(selectedOrderDetails.shippingFee)}</span>
                      </div>
                      {selectedOrderDetails.discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Discount Applied:</span>
                          <span>-{formatPriceINR(selectedOrderDetails.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                        <span>Final Total:</span>
                        <span>{formatPriceINR(selectedOrderDetails.total)}</span>
                      </div>
                    </div>

                    {/* Action buttons: Dispatch tracking & Refund */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => {
                          setTrackingOrder(selectedOrderDetails);
                          setTrackingNumberInput(selectedOrderDetails.trackingNumber || '');
                          setCarrierInput(selectedOrderDetails.carrier || 'India Post Speed Post');
                        }}
                        className="py-2 px-4 bg-stone-800 text-white text-xs font-bold rounded-xl hover:bg-stone-900 cursor-pointer flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Update Tracking Info</span>
                      </button>

                      <button
                        onClick={() => {
                          setRefundOrder(selectedOrderDetails);
                          setRefundAmount(selectedOrderDetails.total);
                        }}
                        className="py-2 px-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl hover:bg-rose-100 cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Initiate Refund</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Update Modal */}
              {trackingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200">
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      Update Dispatch Tracking ({trackingOrder.orderNumber})
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Courier / Carrier</label>
                        <input
                          type="text"
                          value={carrierInput}
                          onChange={(e) => setCarrierInput(e.target.value)}
                          placeholder="e.g. India Post Speed Post, Blue Dart, DTDC"
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Tracking Number / AWB</label>
                        <input
                          type="text"
                          value={trackingNumberInput}
                          onChange={(e) => setTrackingNumberInput(e.target.value)}
                          placeholder="e.g. IN892839210SP"
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Tracking URL (Optional)</label>
                        <input
                          type="url"
                          value={trackingUrlInput}
                          onChange={(e) => setTrackingUrlInput(e.target.value)}
                          placeholder="https://www.indiapost.gov.in/..."
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setTrackingOrder(null)}
                        className="py-2 px-3 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await updateOrderStatus(
                            trackingOrder.id,
                            'Shipped',
                            trackingNumberInput,
                            `Dispatched via ${carrierInput}`,
                            carrierInput
                          );
                          setTrackingOrder(null);
                        }}
                        className="py-2 px-4 bg-[#8b5a2b] text-white text-xs font-bold rounded-lg hover:bg-[#6e4620] cursor-pointer"
                      >
                        Save & Mark Shipped
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Refund Modal */}
              {refundOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-rose-200">
                    <h3 className="font-serif font-bold text-base text-rose-900 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                      <span>Process Refund: {refundOrder.orderNumber}</span>
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Refund Amount (₹ INR)</label>
                        <input
                          type="number"
                          max={refundOrder.total}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(Number(e.target.value))}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                        <span className="text-[10px] text-stone-500">Max refundable: ₹{refundOrder.total}</span>
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Refund Reason</label>
                        <textarea
                          rows={2}
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="w-full p-2 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setRefundOrder(null)}
                        className="py-2 px-3 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await processRefund(refundOrder.id, refundAmount, refundReason);
                          setRefundOrder(null);
                        }}
                        className="py-2 px-4 bg-rose-700 text-white text-xs font-bold rounded-lg hover:bg-rose-800 cursor-pointer"
                      >
                        Confirm & Record Refund
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: SOAPS & STOCK (and internal Gift Inventory)   */}
          {/* ======================================================== */}
          {activeTab === 'soaps-stock' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#241c14]">Soaps & Stock</h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Manage the only purchasable products (Soaps), promotion-only gift inventory, and cedar curing batches.
                  </p>
                </div>

                <div className="flex gap-2">
                  {soapsSubtab === 'soaps' && (
                    <button
                      onClick={() => {
                        setEditingSoap(null);
                        setSoapName('');
                        setSoapTagline('');
                        setSoapPrice(299);
                        setSoapStock(24);
                        setIsAddSoapOpen(true);
                      }}
                      className="py-2 px-4 bg-[#8b5a2b] hover:bg-[#6e4620] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Soap</span>
                    </button>
                  )}
                  {soapsSubtab === 'gifts' && (
                    <button
                      onClick={() => {
                        setEditingGift(null);
                        setGiftName('');
                        setGiftDesc('');
                        setGiftStock(100);
                        setIsAddGiftOpen(true);
                      }}
                      className="py-2 px-4 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Promotional Gift</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Subtabs */}
              <div className="flex gap-2 border-b border-stone-200 pb-2">
                <button
                  onClick={() => setSoapsSubtab('soaps')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    soapsSubtab === 'soaps' ? 'bg-[#8b5a2b] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  All Soaps Catalog ({products.length})
                </button>
                <button
                  onClick={() => setSoapsSubtab('gifts')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    soapsSubtab === 'gifts' ? 'bg-amber-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Promotion-Only Gift Inventory ({giftItems.length})</span>
                </button>
                <button
                  onClick={() => setSoapsSubtab('curing')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    soapsSubtab === 'curing' ? 'bg-[#8b5a2b] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  Cedar Rack Batches ({curingBatches.length})
                </button>
                <button
                  onClick={() => setSoapsSubtab('adjust')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    soapsSubtab === 'adjust' ? 'bg-[#8b5a2b] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  Stock Adjustment Tool
                </button>
              </div>

              {/* Subtab 1: All Soaps */}
              {soapsSubtab === 'soaps' && (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Soap</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border" />
                              <div>
                                <div className="font-semibold text-stone-900">{p.name}</div>
                                <div className="text-[10px] text-stone-400 font-mono">{p.sku || p.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-600">{p.category}</td>
                          <td className="py-3 px-4 font-bold text-stone-900">{formatPriceINR(p.price)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.stock <= (p.lowStockThreshold || 5)
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {p.stock} in stock
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold uppercase">
                              {p.status || 'published'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingSoap(p);
                                setSoapName(p.name);
                                setSoapTagline(p.tagline);
                                setSoapCategory(p.category);
                                setSoapPrice(p.price);
                                setSoapSalePrice(p.originalPrice);
                                setSoapStock(p.stock);
                                setSoapImage(p.image);
                                setIsAddSoapOpen(true);
                              }}
                              className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                              title="Edit Soap"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleNewRelease(p.id)}
                              className={`p-1 ${p.isNewRelease ? 'text-amber-600' : 'text-stone-300'} hover:text-amber-800 cursor-pointer`}
                              title="Toggle New Release Badge"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-1 text-rose-400 hover:text-rose-700 cursor-pointer"
                              title="Archive / Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Subtab 2: Promotion-Only Gift Inventory (Rule 2 & Section 8E) */}
              {soapsSubtab === 'gifts' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    <strong>Rule 2 Enforced:</strong> Free gifts are promotional items awarded during combo offers. They
                    are <em>never</em> independently purchasable in the shop catalog and customers can never pay for
                    them.
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                        <tr>
                          <th className="py-3 px-4">Gift Item</th>
                          <th className="py-3 px-4">SKU / Code</th>
                          <th className="py-3 px-4">Available Gift Stock</th>
                          <th className="py-3 px-4">Catalog Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {giftItems.map((g) => (
                          <tr key={g.id} className="hover:bg-amber-50/30">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img src={g.image} alt={g.name} className="w-10 h-10 object-cover rounded-lg border" />
                                <div>
                                  <div className="font-semibold text-stone-900">{g.name}</div>
                                  <div className="text-[10px] text-stone-500 line-clamp-1">{g.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-stone-600">{g.sku}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  g.stockQuantity <= 15 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {g.stockQuantity} gifts in stock
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                                Promotion-Only (FREE GIFT)
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setEditingGift(g);
                                  setGiftName(g.name);
                                  setGiftDesc(g.description);
                                  setGiftImage(g.image);
                                  setGiftStock(g.stockQuantity);
                                  setGiftSku(g.sku);
                                  setIsAddGiftOpen(true);
                                }}
                                className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteGiftItem(g.id)}
                                className="p-1 text-rose-400 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab 3: Curing Batches */}
              {soapsSubtab === 'curing' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-stone-600">
                      Cold-process soaps curing on cedar racks. Bars take 42-56 days to fully saponify and dry.
                    </p>
                    <button
                      onClick={() => setShowAddBatchModal(true)}
                      className="py-1.5 px-3 bg-[#8b5a2b] text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + Log Curing Batch
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {curingBatches.map((b) => (
                      <div key={b.id} className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                            {b.batchNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.status === 'Ready for Sale'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <div className="font-semibold text-stone-800 text-sm">{b.soapName}</div>
                        <div className="text-[11px] text-stone-500">
                          Pour Date: {b.pourDate} • Target Cure: {b.expectedCureDate}
                        </div>
                        <div className="text-[11px] text-stone-600 font-medium">Batch Volume: {b.barCount} bars</div>
                        <div className="pt-2 border-t flex justify-end gap-2">
                          <button
                            onClick={() => updateCuringBatchStatus(b.id, 'Curing on Racks')}
                            className="text-[10px] text-stone-600 hover:bg-stone-100 px-2 py-1 rounded"
                          >
                            Mark Curing
                          </button>
                          <button
                            onClick={() => updateCuringBatchStatus(b.id, 'Ready for Sale')}
                            className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded"
                          >
                            Mark Ready for Sale
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 4: Stock Adjustment Tool */}
              {soapsSubtab === 'adjust' && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 max-w-xl space-y-4">
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Record Inventory Movement & Audit Adjustment
                  </h3>
                  <p className="text-xs text-stone-500">
                    Adjust soap or gift stock with atomic consistency. Negative stock is strictly prevented.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Target Soap (or select Gift below)</label>
                      <select
                        value={adjustSoapId}
                        onChange={(e) => {
                          setAdjustSoapId(e.target.value);
                          if (e.target.value) setAdjustGiftId('');
                        }}
                        className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                      >
                        <option value="">-- Choose Soap to Adjust --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Current: {p.stock} bars)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Or Target Promotional Gift Item</label>
                      <select
                        value={adjustGiftId}
                        onChange={(e) => {
                          setAdjustGiftId(e.target.value);
                          if (e.target.value) setAdjustSoapId('');
                        }}
                        className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                      >
                        <option value="">-- Choose Gift Item to Adjust --</option>
                        {giftItems.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} (Current: {g.stockQuantity} gifts)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Quantity Change (+ / -)</label>
                        <input
                          type="number"
                          value={adjustChange}
                          onChange={(e) => setAdjustChange(Number(e.target.value))}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Movement Type</label>
                        <select
                          value={adjustType}
                          onChange={(e) => setAdjustType(e.target.value as any)}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        >
                          <option value="restock">Restock (+)</option>
                          <option value="damage">Damaged (-)</option>
                          <option value="waste">Trimming Waste (-)</option>
                          <option value="manual_adjustment">Manual Correction</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Reason / Batch Reference</label>
                      <input
                        type="text"
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        placeholder="e.g. Curing Rack 3 inspection completed"
                        className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (!adjustSoapId && !adjustGiftId) {
                        showNotification('Please select a soap or gift item to adjust', 'alert');
                        return;
                      }
                      await adjustInventory({
                        soapId: adjustSoapId || undefined,
                        giftItemId: adjustGiftId || undefined,
                        quantityChange: adjustChange,
                        movementType: adjustType,
                        reason: adjustReason,
                      });
                    }}
                    className="py-2.5 px-4 bg-[#8b5a2b] hover:bg-[#6e4620] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                  >
                    Commit Stock Adjustment
                  </button>
                </div>
              )}

              {/* Add/Edit Soap Modal */}
              {isAddSoapOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-stone-200">
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      {editingSoap ? `Edit Soap: ${editingSoap.name}` : 'Add Handcrafted Soap'}
                    </h3>

                    <form onSubmit={handleSaveSoap} className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Soap Name</label>
                        <input
                          type="text"
                          required
                          value={soapName}
                          onChange={(e) => setSoapName(e.target.value)}
                          placeholder="e.g. Kashmiri Saffron & Raw Honey Bar"
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Tagline</label>
                        <input
                          type="text"
                          value={soapTagline}
                          onChange={(e) => setSoapTagline(e.target.value)}
                          placeholder="e.g. Deeply nourishing royal complexion bar"
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Category / Soap Type</label>
                          <select
                            value={soapCategory}
                            onChange={(e) => setSoapCategory(e.target.value as any)}
                            className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                          >
                            {ALL_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Scent Profile</label>
                          <select
                            value={soapScent}
                            onChange={(e) => setSoapScent(e.target.value as any)}
                            className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                          >
                            {ALL_SCENTS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Price (₹ INR)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={soapPrice}
                            onChange={(e) => setSoapPrice(Number(e.target.value))}
                            className="w-full p-2.5 rounded-lg border border-stone-300 outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Initial Stock</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={soapStock}
                            onChange={(e) => setSoapStock(Number(e.target.value))}
                            className="w-full p-2.5 rounded-lg border border-stone-300 outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Weight</label>
                          <input
                            type="text"
                            value={soapWeight}
                            onChange={(e) => setSoapWeight(e.target.value)}
                            placeholder="135g"
                            className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Image URL (Supabase Storage)</label>
                        <input
                          type="url"
                          required
                          value={soapImage}
                          onChange={(e) => setSoapImage(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Ingredients (comma-separated)</label>
                        <textarea
                          rows={2}
                          value={soapIngredients}
                          onChange={(e) => setSoapIngredients(e.target.value)}
                          className="w-full p-2 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setIsAddSoapOpen(false)}
                          className="py-2 px-3 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2 px-4 bg-[#8b5a2b] hover:bg-[#6e4620] text-white font-bold rounded-lg cursor-pointer"
                        >
                          Save Soap Listing
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add/Edit Gift Modal */}
              {isAddGiftOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-amber-200">
                    <h3 className="font-serif font-bold text-base text-amber-950">
                      {editingGift ? `Edit Promotional Gift` : 'Add Promotion-Only Gift Item'}
                    </h3>
                    <p className="text-[11px] text-amber-800">
                      This item is for promotional combo fulfillment only. It will never have a buy button.
                    </p>

                    <form onSubmit={handleSaveGift} className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Gift Item Name</label>
                        <input
                          type="text"
                          required
                          value={giftName}
                          onChange={(e) => setGiftName(e.target.value)}
                          placeholder="e.g. Artisan Cedarwood Soap Saver Dish"
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={giftDesc}
                          onChange={(e) => setGiftDesc(e.target.value)}
                          className="w-full p-2 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">SKU</label>
                          <input
                            type="text"
                            value={giftSku}
                            onChange={(e) => setGiftSku(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-stone-700 block mb-1">Available Gift Stock</label>
                          <input
                            type="number"
                            min={0}
                            value={giftStock}
                            onChange={(e) => setGiftStock(Number(e.target.value))}
                            className="w-full p-2.5 rounded-lg border border-stone-300 outline-none font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Gift Photograph URL</label>
                        <input
                          type="url"
                          required
                          value={giftImage}
                          onChange={(e) => setGiftImage(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddGiftOpen(false)}
                          className="py-2 px-3 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-2 px-4 bg-amber-800 text-white font-bold rounded-lg hover:bg-amber-900 cursor-pointer"
                        >
                          Save Gift Inventory
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 4: OFFERS & BANNERS                             */}
          {/* ======================================================== */}
          {activeTab === 'offers-banners' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#241c14]">Offers & Banners</h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Configure combo promotions (Buy 6 Soaps, Get 1 Free Gift) and public hero banners.
                  </p>
                </div>
              </div>

              {/* Subtabs */}
              <div className="flex gap-2 border-b border-stone-200 pb-2">
                <button
                  onClick={() => setOffersSubtab('offers')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    offersSubtab === 'offers' ? 'bg-[#8b5a2b] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Combo Offers ({offers.length})</span>
                </button>
                <button
                  onClick={() => setOffersSubtab('banners')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    offersSubtab === 'banners' ? 'bg-[#8b5a2b] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Hero Banners</span>
                </button>
              </div>

              {/* Subtab 1: Combo Offers */}
              {offersSubtab === 'offers' && (
                <div className="space-y-4">
                  {offers.map((offer) => {
                    const assignedGift = giftItems.find((g) => g.id === offer.giftItemId);
                    return (
                      <div key={offer.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              Flagship Combo Promotion
                            </span>
                            <h3 className="font-serif font-bold text-lg text-stone-900 mt-1">{offer.title}</h3>
                          </div>
                          <button
                            onClick={() => updateOffer(offer.id, { isActive: !offer.isActive })}
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                              offer.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {offer.isActive ? 'Active on Storefront' : 'Inactive (Paused)'}
                          </button>
                        </div>

                        <p className="text-xs text-stone-600 leading-relaxed">{offer.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
                          <div>
                            <span className="text-stone-500 block">Eligibility Rule:</span>
                            <strong className="text-stone-800">
                              1 Free Gift per {offer.minimumQuantity} Soaps
                            </strong>
                          </div>
                          <div>
                            <span className="text-stone-500 block">Max Gifts Allowed / Order:</span>
                            <strong className="text-stone-800">{offer.maxGiftsPerOrder} Gifts</strong>
                          </div>
                          <div>
                            <span className="text-stone-500 block">Assigned Promotional Gift:</span>
                            <strong className="text-amber-900">{assignedGift?.name || offer.giftItemId}</strong>
                          </div>
                        </div>

                        {/* Gift preview */}
                        {assignedGift && (
                          <div className="flex items-center gap-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs">
                            <img src={assignedGift.image} alt={assignedGift.name} className="w-12 h-12 object-cover rounded-lg border" />
                            <div>
                              <div className="font-bold text-amber-950 flex items-center gap-2">
                                <span>{assignedGift.name}</span>
                                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                                  FREE GIFT
                                </span>
                              </div>
                              <div className="text-[11px] text-amber-800">
                                Current Gift Stock: {assignedGift.stockQuantity} items available for promotion
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Subtab 2: Hero Banners */}
              {offersSubtab === 'banners' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-100 border">
                        <img
                          src="https://images.unsplash.com/photo-1607006314597-9e7960787e95?auto=format&fit=crop&w=1200&q=80"
                          alt="Hero Banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                        BUY 6 SOAPS, GET 1 FREE GIFT!
                      </div>
                      <h4 className="font-serif font-bold text-stone-900 text-base">
                        Discover Your Everyday Soap Ritual
                      </h4>
                      <p className="text-xs text-stone-600">
                        Simple ingredients, delightful fragrances and a little everyday luxury.
                      </p>
                      <div className="text-[11px] text-emerald-700 font-medium">Status: Active on Storefront</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 5: REVENUE & REPORTS                            */}
          {/* ======================================================== */}
          {activeTab === 'revenue-reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#241c14]">Revenue & Financial Reports</h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Authoritative financial aggregation based on real verified payments and confirmed refunds.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => exportRevenueCSV()}
                    className="py-2 px-4 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={loadRevenueData}
                    className="p-2 border border-stone-300 rounded-xl hover:bg-stone-100 text-stone-600 cursor-pointer"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Revenue Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-xs text-stone-500 font-medium">Net Collected Revenue</div>
                  <div className="text-2xl font-serif font-bold text-[#203a1f] mt-1">
                    {formatPriceINR(revenueSummary?.netCollectedAmount || totalRevenue)}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1">
                    After refunds and discounts
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-xs text-stone-500 font-medium">Soap Units Sold</div>
                  <div className="text-2xl font-serif font-bold text-stone-800 mt-1">
                    {revenueSummary?.soapUnitsSold || 0} bars
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">Paid soap bars only</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-xs text-stone-500 font-medium">Confirmed Orders</div>
                  <div className="text-2xl font-serif font-bold text-stone-800 mt-1">
                    {revenueSummary?.confirmedOrdersCount || 0}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    AOV: {formatPriceINR(revenueSummary?.averageOrderValue || 0)}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-xs text-stone-500 font-medium">Processed Refunds</div>
                  <div className="text-2xl font-serif font-bold text-rose-800 mt-1">
                    {formatPriceINR(revenueSummary?.refunds || 0)}
                  </div>
                  <div className="text-[11px] text-rose-700 font-medium mt-1">Authoritative deductions</div>
                </div>
              </div>

              {/* Monthly Selector & Daily Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">Monthly Revenue Breakdown</h3>
                    <p className="text-xs text-stone-500">Select any month to inspect daily collected totals</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={reportMonth}
                      onChange={(e) => setReportMonth(Number(e.target.value))}
                      className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold outline-none cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>

                    <select
                      value={reportYear}
                      onChange={(e) => setReportYear(Number(e.target.value))}
                      className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold outline-none cursor-pointer"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                    </select>
                  </div>
                </div>

                {monthlyReportData?.dailyData && (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyReportData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e9df" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#786e64' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#786e64' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Collected Sales']} />
                        <Bar dataKey="sales" fill="#8b5a2b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 6: STORE SETTINGS                               */}
          {/* ======================================================== */}
          {activeTab === 'store-settings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#241c14]">Store Settings</h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Brand profile, shipping calculations, tax policies, and integration configuration.
                  </p>
                </div>
              </div>

              {/* Subtabs */}
              <div className="flex gap-2 border-b border-stone-200 pb-2">
                <button
                  onClick={() => setSettingsSubtab('profile')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settingsSubtab === 'profile' ? 'bg-[#8b5a2b] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  Store Profile & Brand
                </button>
                <button
                  onClick={() => setSettingsSubtab('shipping')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settingsSubtab === 'shipping' ? 'bg-[#8b5a2b] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  Shipping & Thresholds
                </button>
                <button
                  onClick={() => setSettingsSubtab('payments')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settingsSubtab === 'payments' ? 'bg-[#8b5a2b] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  Payment & SMTP Status
                </button>
                <button
                  onClick={() => setSettingsSubtab('policies')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settingsSubtab === 'policies' ? 'bg-[#8b5a2b] text-white shadow-xs' : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  Legal & Policies
                </button>
              </div>

              {/* Form Container */}
              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs max-w-2xl space-y-4 text-xs">
                {settingsSubtab === 'profile' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Company / Store Name</label>
                        <input
                          type="text"
                          value={settingsForm.companyName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Brand Tagline</label>
                        <input
                          type="text"
                          value={settingsForm.tagline}
                          onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Owner / Maker Name</label>
                        <input
                          type="text"
                          value={settingsForm.ownerName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Contact Email</label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Studio Address</label>
                      <input
                        type="text"
                        value={settingsForm.studioAddress}
                        onChange={(e) => setSettingsForm({ ...settingsForm, studioAddress: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-stone-300 outline-none"
                      />
                    </div>
                  </>
                )}

                {settingsSubtab === 'shipping' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Standard Delivery Fee (₹ INR)</label>
                        <input
                          type="number"
                          value={settingsForm.standardShippingFee}
                          onChange={(e) => setSettingsForm({ ...settingsForm, standardShippingFee: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Free Shipping Threshold (₹ INR)</label>
                        <input
                          type="number"
                          value={settingsForm.freeShippingThreshold}
                          onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-lg border border-stone-300 outline-none font-bold"
                        />
                        <span className="text-[10px] text-stone-500">Orders above this get free delivery</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                        <input
                          type="checkbox"
                          checked={settingsForm.codAvailable}
                          onChange={(e) => setSettingsForm({ ...settingsForm, codAvailable: e.target.checked })}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span>Enable Cash On Delivery (COD)</span>
                      </label>
                    </div>
                  </>
                )}

                {settingsSubtab === 'payments' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                      <div className="font-bold text-stone-800 flex items-center justify-between">
                        <span>Razorpay Online Gateway</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            settingsForm.razorpayKeyIdConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {settingsForm.razorpayKeyIdConfigured ? 'Configured & Active' : 'Awaiting Production Keys in .env'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Online payments accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.
                        Keys are kept secure in environment variables.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                      <div className="font-bold text-stone-800 flex items-center justify-between">
                        <span>Nodemailer SMTP Transactional Email</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            settingsForm.smtpConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {settingsForm.smtpConfigured ? 'Connected' : 'System Logs Active (SMTP Optional)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Sends dispatch notifications and order confirmation emails to customers.
                      </p>
                    </div>
                  </div>
                )}

                {settingsSubtab === 'policies' && (
                  <>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">About Lumina Soaps</label>
                      <textarea
                        rows={3}
                        value={settingsForm.aboutText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, aboutText: e.target.value })}
                        className="w-full p-2 rounded-lg border border-stone-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Shipping & Delivery Policy</label>
                      <textarea
                        rows={3}
                        value={settingsForm.shippingPolicy}
                        onChange={(e) => setSettingsForm({ ...settingsForm, shippingPolicy: e.target.value })}
                        className="w-full p-2 rounded-lg border border-stone-300 outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-[#8b5a2b] hover:bg-[#6e4620] text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Store Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Packing Slip Modal */}
      {selectedPackingSlipOrder && (
        <PackingSlipModal
          order={selectedPackingSlipOrder}
          onClose={() => setSelectedPackingSlipOrder(null)}
        />
      )}
    </div>
  );
};
