import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { FloatingNewReleasesShowcase } from './FloatingNewReleasesShowcase';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Truck,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Package,
  Heart,
  Tag,
  Gift,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    products,
    banners,
    categories,
    activeOffer,
    setCurrentView,
    setFilters,
    setSelectedProduct,
  } = useStore();

  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Auto rotate banners if more than 1
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[activeBannerIdx] || {
    title: 'Pure Care. Natural Glow.',
    subtitle: 'Small-batch artisanal soaps cured 42 days for pure nourishment.',
    ctaText: 'Explore Collection',
    ctaLink: 'shop',
    imageUrl: 'https://images.unsplash.com/photo-1607006311820-d15873f8425b?auto=format&fit=crop&w=1600&q=80',
    tag: '100% Natural Cold Process',
  };

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const bundleProducts = products.filter(
    (p) => p.category.toLowerCase().includes('gift') || p.category.toLowerCase().includes('bundle')
  );

  const handleCategorySelect = (categoryName: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: [categoryName],
      newReleasesOnly: false,
      searchQuery: '',
    }));
    setCurrentView('shop');
  };

  return (
    <div className="w-full flex flex-col space-y-12 sm:space-y-16 pb-16 animate-fade-in">
      {/* 1. HERO BANNER SLIDER */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[380px] sm:min-h-[460px] flex items-center bg-[#1c2e1d] text-white">
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title}
              className="w-full h-full object-cover opacity-35 filter brightness-90 transition-transform duration-1000 scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#172b18]/95 via-[#1c2e1d]/85 to-transparent" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 p-6 sm:p-12 md:p-16 max-w-2xl flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8b5a2b]/80 border border-amber-400/30 text-amber-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeBanner.tag || 'Handmade in Bengaluru'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#faf7ef] leading-tight tracking-tight">
              {activeBanner.title}
            </h1>

            <p className="text-sm sm:text-base text-[#d1e0cf] max-w-lg leading-relaxed">
              {activeBanner.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="hero-shop-cta"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, selectedCategories: [], newReleasesOnly: false }));
                  setCurrentView('shop');
                }}
                className="px-6 py-3.5 rounded-xl bg-[#c8923a] hover:bg-[#b5802c] text-[#192b1a] font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{activeBanner.ctaText || 'Shop Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-new-releases-cta"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, newReleasesOnly: true, selectedCategories: [] }));
                  setCurrentView('shop');
                }}
                className="px-5 py-3.5 rounded-xl bg-[#28432a]/80 hover:bg-[#345837] text-white border border-[#4a724d] font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explore New Releases</span>
              </button>
            </div>
          </div>

          {/* Banner Slider Navigation Controls */}
          {banners.length > 1 && (
            <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2">
              <button
                aria-label="Previous banner"
                onClick={() =>
                  setActiveBannerIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
                }
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-white/80 px-1">
                {activeBannerIdx + 1} / {banners.length}
              </span>
              <button
                aria-label="Next banner"
                onClick={() => setActiveBannerIdx((prev) => (prev + 1) % banners.length)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Value Prop Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white border border-[#e8e4d8] rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1e341f]">100% Plant Based</p>
              <p className="text-[11px] text-gray-500">No sulfates, parabens, SLS</p>
            </div>
          </div>

          <div className="bg-white border border-[#e8e4d8] rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1e341f]">42-Day Cedar Curing</p>
              <p className="text-[11px] text-gray-500">Long lasting, hard & mild bar</p>
            </div>
          </div>

          <div className="bg-white border border-[#e8e4d8] rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1e341f]">Free Pan-India Delivery</p>
              <p className="text-[11px] text-gray-500">On all orders above ₹799</p>
            </div>
          </div>

          <div className="bg-white border border-[#e8e4d8] rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1e341f]">Sole Proprietorship</p>
              <p className="text-[11px] text-gray-500">Direct artisan to doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY NAVIGATION GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8b5a2b]">
              Botanical Formulations
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c2e1d]">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => {
              setFilters((prev) => ({ ...prev, selectedCategories: [] }));
              setCurrentView('shop');
            }}
            className="text-xs sm:text-sm font-semibold text-[#8b5a2b] hover:text-[#6f451f] flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.name)}
              className="group text-left bg-white border border-[#e5e1d5] hover:border-[#8b5a2b] rounded-2xl p-3.5 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[#f5f3ec]">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1c2e1d] group-hover:text-[#8b5a2b] transition-colors leading-tight mb-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-gray-500">
                  {products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length} Soaps
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. FLOATING NEW RELEASES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <FloatingNewReleasesShowcase />
      </section>

      {/* 4. FEATURED PRODUCTS CAROUSEL / GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8b5a2b]">
              Artisan Picks
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c2e1d]">
              Featured Artisan Soaps
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('shop')}
            className="text-xs sm:text-sm font-semibold text-[#8b5a2b] hover:text-[#6f451f] flex items-center gap-1 group"
          >
            <span>Explore Store</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8b5a2b]">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c2e1d]">
              Best Sellers in India
            </h2>
          </div>
          <button
            onClick={() => {
              setFilters((prev) => ({ ...prev, sortBy: 'bestselling' }));
              setCurrentView('shop');
            }}
            className="text-xs sm:text-sm font-semibold text-[#8b5a2b] hover:text-[#6f451f] flex items-center gap-1 group"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. FLAGSHIP COMBO PROMOTION: BUY 6 SOAPS, GET 1 FREE GIFT! */}
      {activeOffer && activeOffer.isActive && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#241c14] via-[#2f241a] to-[#3a2d20] rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-amber-900/40 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                  <Gift className="w-3.5 h-3.5 text-amber-300" />
                  <span>Flagship Studio Combo Offer</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-100 tracking-tight leading-tight">
                  BUY 6 SOAPS, GET 1 FREE GIFT!
                </h2>

                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                  {activeOffer.description ||
                    'Add any 6 eligible cold-process soap bars to your cart and automatically unlock our complimentary Artisan Cedarwood Soap Saver Dish. Every 6 soaps earns 1 free gift (up to 3 gifts per order).'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, selectedCategories: [], newReleasesOnly: false }));
                      setCurrentView('shop');
                    }}
                    className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>Shop Soaps & Unlock Free Gift</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-amber-200/90 font-medium">
                    1 Free Gift per 6 soaps • Automatically awarded in cart
                  </span>
                </div>
              </div>

              {/* Gift Item Showcase Card (Promotion-only item) */}
              <div className="md:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-stone-100 space-y-3">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-stone-900/40 relative">
                  <img
                    src={
                      activeOffer.giftItem?.image ||
                      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={activeOffer.giftItem?.name || 'Artisan Free Gift'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-amber-400 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                    FREE GIFT
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-white">
                    {activeOffer.giftItem?.name || 'Artisan Slotted Cedarwood Soap Saver Dish'}
                  </h4>
                  <p className="text-[11px] text-stone-300 mt-1 line-clamp-2">
                    {activeOffer.giftItem?.description ||
                      'Handcrafted from reclaimed aromatic cedarwood with self-draining channels to keep cold-process soaps dry and long-lasting.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-amber-300 font-bold">Payable Amount: ₹0 (FREE GIFT)</span>
                  <span className="text-stone-300 text-[11px]">Promotion-Only Item</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. COMPANY STORY & SOLE PROPRIETOR TRUST BADGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#1c2e1d] rounded-3xl p-8 sm:p-12 text-[#faf7ef] shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
            <Leaf className="w-96 h-96" />
          </div>

          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-400/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Authentic Sole Proprietor Craft</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold leading-tight mb-4">
              Hand-Poured by Thiru Kailash in Bengaluru
            </h2>

            <p className="text-sm sm:text-base text-[#d2ded1] leading-relaxed mb-6">
              "Lumina is not a generic marketplace or industrial factory. Every single batch is formulated, mixed at room temperature with pure lye and virgin plant oils, poured into wooden loaf molds, and hand-cut with steel wire right here in our studio. We cure our bars for a full 42 days on aromatic cedar racks to achieve rich lather and skin-comforting mildness."
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#314a33]">
              <div>
                <p className="text-xs text-[#9fc29b]">Maker & Founder</p>
                <p className="text-base font-bold text-white">Thiru Kailash</p>
                <p className="text-xs text-amber-300">Bengaluru, India</p>
              </div>
              <div>
                <p className="text-xs text-[#9fc29b]">Direct Contact</p>
                <p className="text-sm font-semibold text-white">mailmethirukailash@gmail.com</p>
                <p className="text-xs text-gray-400">Sole Proprietor Guarantee</p>
              </div>
              <div>
                <p className="text-xs text-[#9fc29b]">Curing Standard</p>
                <p className="text-base font-bold text-white">42 Days Aged</p>
                <p className="text-xs text-[#9fc29b]">pH Balanced 8.0 - 8.5</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. AUTHENTIC REVIEWS & RATINGS HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8b5a2b]">
            From Verified Customers
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c2e1d] mt-1">
            Real Experiences Across India
          </h2>
          <div className="flex items-center justify-center gap-1 mt-2 text-amber-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs font-bold text-[#1c2e1d] ml-2">4.9 / 5.0 (2,400+ Bars Shipped)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-[#e8e4d8] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h3 className="text-sm font-bold text-[#1c2e1d]">"My eczema completely settled down"</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The Raw Goat Milk & Wild Forest Honey bar is the gentlest cleanser I have ever tried. After two weeks of daily showers, my dry skin patches stopped itching. Truly natural!
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1c2e1d]">Dr. Priya Ramanathan</p>
                <p className="text-[10px] text-gray-400">Chennai • Verified Purchase</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white border border-[#e8e4d8] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h3 className="text-sm font-bold text-[#1c2e1d]">"The Mysore Sandalwood aroma is authentic"</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Most commercial soaps use harsh synthetic fragrance oils. Lumina's Saffron Sandalwood bar smells like authentic temple wood paste and leaves the bathroom smelling divine for hours.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1c2e1d]">Vikram Aditya K.</p>
                <p className="text-[10px] text-gray-400">Bengaluru • Verified Purchase</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white border border-[#e8e4d8] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h3 className="text-sm font-bold text-[#1c2e1d]">"Speedy delivery and great packaging"</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ordered the Gift Set for Diwali. Received it within 48 hours in Mumbai packed in eco-friendly jute and stamped wax paper. Beautiful craftsmanship by sole proprietor Thiru.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1c2e1d]">Ananya Sen</p>
                <p className="text-[10px] text-gray-400">Mumbai • Verified Purchase</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
