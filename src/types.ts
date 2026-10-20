export type SoapCategory = string;

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imageUrl?: string;
  order: number;
  enabled: boolean;
  productCount?: number;
}

export type SkinType =
  | 'All Skin Types'
  | 'Dry & Sensitive'
  | 'Oily & Acne-Prone'
  | 'Eczema & Psoriasis Prone'
  | 'Mature & Nourishing'
  | 'Normal & Combination';

export type ScentProfile =
  | 'French Lavender & Sage'
  | 'Eucalyptus & Peppermint'
  | 'Sweet Orange & Lemongrass'
  | 'Wild Rose & Geranium'
  | 'Raw Honey & Toasted Almond'
  | 'Activated Charcoal & Tea Tree'
  | 'Warm Oatmeal & Vanilla'
  | 'Unscented Pure Castile'
  | 'Mysore Sandalwood & Vetiver'
  | 'Lemongrass & Neem'
  | 'Bergamot & Cedarwood'
  | string;

export interface ProductReview {
  id: string;
  userId?: string;
  userName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status?: 'approved' | 'pending' | 'rejected';
  images?: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  weight: string;
  packSize: number;
  price: number;
  originalPrice?: number;
  sku: string;
  stock: number;
}

export interface SoapProduct {
  id: string;
  sku?: string;
  name: string;
  slug?: string;
  tagline: string;
  category: SoapCategory;
  price: number;
  originalPrice?: number;
  pricePaise?: number;
  salePricePaise?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold?: number;
  batchNumber: string;
  cureDate: string;
  weight: string;
  weightGrams?: number;
  dimensions?: string;
  scentProfile: string;
  skinTypes: string[];
  ingredients: string[];
  benefits: string[];
  description?: string;
  directions?: string;
  warnings?: string;
  usageInstructions?: string;
  storageInstructions?: string;
  variants?: ProductVariant[];
  badge?: 'Bestseller' | 'New Release' | 'Limited Batch' | 'Maker Favorite' | 'Sole Proprietor Special' | string;
  isNewRelease: boolean;
  isFeatured?: boolean;
  featured?: boolean;
  isBestSeller?: boolean;
  isPublished?: boolean;
  status?: 'draft' | 'published' | 'archived';
  image: string;
  gallery: string[];
  tags?: string[];
  coldProcessDescription?: string;
  reviews: ProductReview[];
}

// Promotion-only Gift Inventory item (NEVER purchasable independently)
export interface GiftItem {
  id: string;
  name: string;
  description: string;
  image: string;
  storagePath?: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Combo Offer (e.g. Buy 6 Soaps, Get 1 Free Gift)
export interface ComboOffer {
  id: string;
  title: string;
  description: string;
  minimumQuantity: number; // e.g. 6
  giftsPerThreshold: number; // e.g. 1
  maxGiftsPerOrder: number; // e.g. 3
  startsAt: string;
  endsAt?: string;
  isActive: boolean;
  eligibleSoapIds?: string[]; // empty means all soaps
  giftItemId: string;
  giftItem?: GiftItem;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'Pending Payment'
  | 'Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refund Pending'
  | 'Refunded'
  | 'Pending Review'
  | 'Accepted & Preparing'
  | 'Handcrafted & Packaged'
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT FOR DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURNED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type PaymentStatus =
  | 'pending'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  batchNumber?: string;
  weight?: string;
  sku?: string;
  isGift?: boolean;
  giftItemId?: string;
  unitPricePaise?: number;
  lineTotalPaise?: number;
}

export interface ShippingAddress {
  id?: string;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode?: string;
  pincode?: string;
  phone: string;
  isDefault?: boolean;
  type?: 'Home' | 'Work' | 'Other';
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  changedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  createdAt?: string;
  userId?: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  subtotalPaise?: number;
  shippingFee: number;
  shippingPaise?: number;
  tax: number;
  taxPaise?: number;
  discount: number;
  discountPaise?: number;
  couponCode?: string;
  total: number;
  totalPaise?: number;
  currency?: string;
  paymentMethod: 'Razorpay' | 'COD' | 'razorpay' | 'cod' | 'UPI' | 'Card' | 'NetBanking' | string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  customerNote?: string;
  proprietorInternalNotes?: string;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  cancellationReason?: string;
  refundReason?: string;
  returnReason?: string;
  returnNotes?: string;
  refundedAmountPaise?: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: ShippingAddress;
  addresses?: ShippingAddress[];
  role: 'customer' | 'admin' | 'owner';
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
  status?: 'Active' | 'Suspended';
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  description: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  orderId?: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'delivery' | 'system' | 'return' | 'offer';
  timestamp?: string;
  createdAt?: string;
  read: boolean;
  link?: string;
}

export interface SupportTicketMessage {
  id: string;
  sender: 'customer' | 'admin' | string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  message?: string;
  orderId?: string;
  orderNumber?: string;
  status: 'OPEN' | 'IN PROGRESS' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt?: string;
  messages: SupportTicketMessage[];
  replies?: Array<{ id?: string; sender: string; senderName?: string; message: string; timestamp?: string }>;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  tag?: string;
  ctaText?: string;
  ctaLabel?: string;
  linkAction?: string;
  targetUrl?: string;
  imageUrl: string;
  imagePath?: string;
  badge?: string;
  active: boolean;
  isActive?: boolean;
  displayOrder: number;
  sortOrder?: number;
  startsAt?: string;
  endsAt?: string;
}

export interface StoreSettings {
  companyName: string;
  brandStory: string;
  tagline: string;
  logoUrl: string;
  ownerName: string;
  email: string;
  phone: string;
  studioAddress: string;
  businessHours: string;
  gstNumber: string;
  currency: string;
  timeZone: string;
  standardShippingFee: number;
  freeShippingThreshold: number;
  codAvailable: boolean;
  taxPercentage: number;
  razorpayKeyIdConfigured: boolean;
  smtpConfigured: boolean;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  aboutText: string;
  shippingPolicy: string;
  privacyPolicy: string;
  termsAndConditions: string;
}

// Backward compatibility alias
export type CompanySettings = StoreSettings;

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  details: string;
}

export type SortOption =
  | 'relevance'
  | 'newest'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'bestselling'
  | 'featured';

export const CURRENCY_SYMBOL = '₹';

export const formatPriceINR = (amount: number): string => {
  return `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export const paiseToINR = (paise: number): number => {
  return Math.round((paise || 0) / 100);
};

export const inrToPaise = (inr: number): number => {
  return Math.round((inr || 0) * 100);
};

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedSkinTypes: string[];
  selectedScents: string[];
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  newReleasesOnly: boolean;
  sortBy: SortOption;
}

export interface CuringBatch {
  id: string;
  soapName: string;
  batchNumber: string;
  barCount: number;
  pourDate: string;
  expectedCureDate: string;
  status: 'Pouring' | 'Saponifying' | 'Curing on Racks' | 'Ready for Sale';
  essentialOilsUsed: string;
}

export interface CartItem extends OrderItem {
  selectedVariant?: ProductVariant;
}

export interface SaveForLaterItem {
  id: string;
  product: SoapProduct;
  savedAt: string;
}

export type StoreView =
  | 'home'
  | 'shop'
  | 'store'
  | 'orders'
  | 'orders-history'
  | 'cart'
  | 'account'
  | 'profile'
  | 'admin'
  | 'about'
  | 'contact'
  | 'faq'
  | 'shipping-policy'
  | 'privacy-policy'
  | 'terms';

// The exact six main admin sections mandated by Rule 4:
export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'soaps-stock'
  | 'offers-banners'
  | 'revenue-reports'
  | 'store-settings';

export interface RevenueSummary {
  grossSoapSales: number;
  discounts: number;
  shippingCollected: number;
  taxCollected: number;
  confirmedPaymentsCollected: number;
  pendingPaymentsAmount: number;
  refunds: number;
  netCollectedAmount: number;
  confirmedOrdersCount: number;
  soapUnitsSold: number;
  averageOrderValue: number;
}
