// Application State Management
class AppState {
    constructor() {
        this.state = {
            // User State
            currentUserId: null,
            currentRole: null,
            isAuthReady: false,

            // Navigation State
            currentPage: 'dashboard',
            currentOrderId: null,

            // Filter States
            currentStatusFilter: 'Tüm Siparişler',
            currentProductFilter: 'Tüm Ürünler',
            currentSearchTerm: '',
            currentSortOption: 'date_desc',

            // UI States
            isOrderCategoryOpen: false,
            isProductCategoryOpen: false,
            isMobileMenuOpen: false,

            // Data State
            orders: [],
            ordersCache: new Map(),
            lastFetchedDoc: null,
            hasMoreOrders: true,
            isLoadingOrders: false,

            // Settings
            deliveryDaysLimit: 14,

            // Pagination
            pageSize: 50,
            currentPageIndex: 0
        };

        this.listeners = new Map();
    }

    // Get state value
    get(key) {
        return this.state[key];
    }

    // Set state value and notify listeners
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                callback(value, oldValue);
            });
        }
    }

    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(key).delete(callback);
        };
    }

    // Batch update multiple state values
    batchSet(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    // Reset filters
    resetFilters() {
        this.batchSet({
            currentStatusFilter: 'Tüm Siparişler',
            currentProductFilter: 'Tüm Ürünler',
            currentSearchTerm: '',
            currentSortOption: 'date_desc',
            currentPageIndex: 0
        });
    }

    // Update orders with caching
    updateOrders(orders) {
        // Update cache
        orders.forEach(order => {
            this.state.ordersCache.set(order.id, order);
        });

        // Update orders array
        this.set('orders', orders);
    }

    // Get order from cache or orders array
    getOrder(orderId) {
        return this.state.ordersCache.get(orderId) ||
            this.state.orders.find(o => o.id === orderId);
    }

    // Clear orders cache
    clearOrdersCache() {
        this.state.ordersCache.clear();
    }
}

// Export singleton instance
const appState = new AppState();
export default appState;
