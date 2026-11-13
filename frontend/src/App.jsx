import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import OrdersModal from './components/OrdersModal';
import HealthModal from './components/HealthModal';
import AuthModal from './components/AuthModal';
import AddProductModal from './components/AddProductModal';
import Toast from './components/Toast';
import MobileBottomNav from './components/MobileBottomNav';
import { api, getUserId } from './services/api';
import './App.css';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cloudretail_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cloudretail_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cloudretail_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    addToast(
      `Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} mode.`,
      'info',
      'Theme Changed'
    );
  };

  const activeUserId = currentUser?.userId || getUserId();

  // Products & Catalog State
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Cart State (Redis backend)
  const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

  // Auth & Retailer Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      addToast('Could not load catalog from product-service.', 'error', 'Catalog Warning');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadCart = async (uid) => {
    try {
      const data = await api.getCart(uid);
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  const loadHealth = async () => {
    try {
      const data = await api.getSystemHealth();
      setHealthData(data);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  // Initial Data Fetching
  useEffect(() => {
    let ignore = false;
    async function initData() {
      try {
        const [prods, cartData, health] = await Promise.allSettled([
          api.getProducts(),
          api.getCart(activeUserId),
          api.getSystemHealth()
        ]);
        if (!ignore) {
          if (prods.status === 'fulfilled') setProducts(prods.value);
          if (cartData.status === 'fulfilled') setCart(cartData.value);
          if (health.status === 'fulfilled') setHealthData(health.value);
          setIsLoadingProducts(false);
        }
      } catch (err) {
        console.error('Initial fetch failed:', err);
      }
    }

    initData();
    const healthInterval = setInterval(loadHealth, 30000);
    return () => {
      ignore = true;
      clearInterval(healthInterval);
    };
  }, [activeUserId]);

  const refreshHealthManual = async () => {
    setIsRefreshingHealth(true);
    try {
      await loadHealth();
      addToast('Microservices telemetry updated from AWS cluster.', 'success', 'Health Check');
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await api.getOrders(activeUserId);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleOpenHealth = () => {
    setIsHealthOpen(true);
  };

  const handleOpenOrders = () => {
    loadOrders();
    setIsOrdersOpen(true);
  };

  // Auth Handlers
  const handleLoginSuccess = (authData) => {
    const user = authData.user;
    setCurrentUser(user);
    localStorage.setItem('cloudretail_user', JSON.stringify(user));
    addToast(
      `Welcome, ${user.name}! Signed in as ${user.role}.`,
      'success',
      user.role === 'RETAILER' ? '👑 Retailer Access Granted' : 'Signed In'
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cloudretail_user');
    addToast('You have been signed out.', 'info', 'Logged Out');
  };

  // Retailer Product Handlers
  const handleCreateProduct = async (productPayload) => {
    try {
      const created = await api.createProduct(productPayload, currentUser?.role || 'RETAILER');
      await loadProducts();
      addToast(`Product "${created.name}" published to catalog!`, 'success', 'Catalog Updated');
    } catch (err) {
      addToast(err.message || 'Failed to publish product.', 'error', 'Error');
      throw err;
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.deleteProduct(productId, currentUser?.role || 'RETAILER');
      await loadProducts();
      addToast('Product successfully removed from catalog.', 'info', 'Product Removed');
    } catch (err) {
      addToast(err.message || 'Failed to delete product.', 'error', 'Error');
    }
  };

  // Cart Operations
  const handleAddToCart = async (product) => {
    setIsUpdatingCart(true);
    try {
      const updatedCart = await api.addToCart(activeUserId, product);
      setCart(updatedCart);
      addToast(`Added "${product.name || product.productName}" to cart.`, 'success', 'Cart Updated');
    } catch (err) {
      console.error(err);
      addToast('Failed to add item to Redis cart.', 'error', 'Cart Error');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    setIsUpdatingCart(true);
    try {
      const updatedCart = await api.updateQuantity(activeUserId, productId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
      addToast('Failed to update item quantity.', 'error', 'Cart Error');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    setIsUpdatingCart(true);
    try {
      const updatedCart = await api.removeFromCart(activeUserId, productId);
      setCart(updatedCart);
      addToast('Item removed from cart.', 'info', 'Cart Updated');
    } catch (err) {
      console.error(err);
      addToast('Failed to remove item.', 'error', 'Cart Error');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to empty your shopping cart?')) return;
    setIsUpdatingCart(true);
    try {
      const updatedCart = await api.clearCart(activeUserId);
      setCart(updatedCart);
      addToast('Shopping cart cleared.', 'info', 'Cart Emptied');
    } catch (err) {
      console.error(err);
      addToast('Failed to clear cart in Redis.', 'error', 'Cart Error');
    } finally {
      setIsUpdatingCart(false);
    }
  };

  // Checkout & Order Placement
  const handleOrderSuccess = async (payload) => {
    const result = await api.checkout(payload);
    setConfirmedOrder(result);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);

    // Refresh cart & catalog stock
    await loadCart(activeUserId);
    await loadProducts();

    addToast(`Order ${result.order?.orderNumber || 'placed'} confirmed successfully!`, 'success', 'Order Confirmed');
    return result;
  };

  // Categories & Filtering
  const categories = useMemo(() => {
    const set = new Set(['ALL']);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const productCounts = useMemo(() => {
    const counts = { ALL: products.length };
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesSearch =
          !searchQuery.trim() ||
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'stock-desc') return (b.stockQuantity || 0) - (a.stockQuantity || 0);
        return a.id - b.id;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const totalCartItems = cart?.totalItems || (cart?.items || []).reduce((sum, it) => sum + it.quantity, 0);
  const isRetailer = currentUser?.role === 'RETAILER';

  return (
    <div className="retail-app">
      {/* Navigation Header */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={totalCartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHealth={handleOpenHealth}
        onOpenOrders={handleOpenOrders}
        healthData={healthData}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content */}
      <main className="app-container">
        {/* High-Tech Hero Banner */}
        <Hero
          totalProducts={products.length}
          featuredProduct={products[0]}
          onQuickView={setQuickViewProduct}
          onExploreClick={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Catalog & Filter Section */}
        <section id="catalog-section" className="catalog-section">
          {/* Retailer banner if logged in as Retailer */}
          {isRetailer && (
            <div className="retailer-alert-strip glass-card animate-fade">
              <div className="retailer-strip-left">
                <span className="badge badge-warning">Merchant Mode Active</span>
                <p>You have merchant permissions to publish new products, update inventory, and manage catalog items.</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setIsAddProductOpen(true)}
              >
                + Publish New Product
              </button>
            </div>
          )}

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            productCounts={productCounts}
          />

          {/* Product Cards Grid */}
          {isLoadingProducts ? (
            <div className="loading-state">
              <span className="spinner-medium"></span>
              <p>Loading catalog items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-catalog-state glass-card" style={{ padding: '60px', textAlign: 'center' }}>
              <h3>No products matched your criteria</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                Try searching for a different term or clearing your category filters.
              </p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: '16px' }}
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={setQuickViewProduct}
                  isRetailer={isRetailer}
                  onDeleteProduct={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Minimal Customer-Facing Store Footer */}
      <footer className="store-footer">
        <div className="app-container footer-content">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <img src="/logo.png" alt="Logo" className="footer-brand-logo-img" />
            </div>
            <p className="footer-tagline">
              Curated everyday essentials, electronics, and lifestyle goods designed for modern simplicity.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              {categories.filter(c => c !== 'ALL').slice(0, 5).map(cat => (
                <li key={cat}>
                  <button
                    type="button"
                    className="footer-link-btn"
                    onClick={() => {
                      setSelectedCategory(cat);
                      const el = document.getElementById('catalog-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Account & Orders</h4>
            <ul className="footer-links">
              <li>
                <button type="button" className="footer-link-btn" onClick={handleOpenOrders}>
                  Track Orders
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => setIsCartOpen(true)}>
                  Shopping Cart
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => setIsAuthOpen(true)}>
                  {currentUser ? 'My Profile' : 'Sign In / Register'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn status-indicator-link"
                  onClick={handleOpenHealth}
                  title="View System & Cloud Architecture Telemetry"
                >
                  <span className={`status-dot ${healthData?.overallHealth === 'HEALTHY' ? 'dot-online' : 'dot-degraded'}`}></span>
                  <span>System Status</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar app-container">
          <p className="footer-copyright">
            &copy; 2026 CloudRetail Platform. All rights reserved.
          </p>
          <div className="footer-trust-notes">
            <span>Free Express Delivery</span>
            <span>•</span>
            <span>30-Day Hassle-Free Returns</span>
            <span>•</span>
            <span>Secure Buyer Protection</span>
          </div>
        </div>
      </footer>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        isUpdating={isUpdatingCart}
      />

      {/* Checkout Form Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        userId={activeUserId}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation Receipt Modal */}
      <OrderSuccessModal
        orderData={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onOpenOrders={() => {
          loadOrders();
          setIsOrdersOpen(true);
        }}
      />

      {/* Orders History Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        isLoading={isLoadingOrders}
      />

      {/* AWS & Microservices Health Telemetry Modal */}
      <HealthModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
        healthData={healthData}
        onRefresh={refreshHealthManual}
        isRefreshing={isRefreshingHealth}
      />

      {/* Product Quick View Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Auth Modal (Login / Sign Up / Account) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Retailer Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductCreated={handleCreateProduct}
        userRole={currentUser?.role}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        cartCount={cart.totalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={handleOpenOrders}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenCategories={() => {
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
