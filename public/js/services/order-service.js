import firebaseService, { where, orderBy } from './firebase-service.js';
import appState from '../utils/state.js';
import { showMessage, generateOrderId } from '../utils/helpers.js';

class OrderService {
    constructor() {
        this.unsubscribe = null;
        this.lastDoc = null;
    }

    // Setup real-time listener for orders with pagination
    async setupOrderListener(loadMore = false) {
        const currentUserId = appState.get('currentUserId');
        const currentRole = appState.get('currentRole');
        const statusFilter = appState.get('currentStatusFilter');
        const productFilter = appState.get('currentProductFilter');
        const pageSize = appState.get('pageSize');

        if (!currentUserId || !currentRole) return;

        // Build query constraints
        const constraints = [orderBy('addedTime', 'desc')];

        // Role-based filtering
        if (currentRole === 'franchisee') {
            constraints.push(where('franchiseeId', '==', currentUserId));
        }

        // Status filtering (excluding 'Gecikti' which is calculated client-side)
        if (statusFilter !== 'Tüm Siparişler' && statusFilter !== 'Gecikti') {
            constraints.push(where('status', '==', statusFilter));
        }

        // Product category filtering
        if (productFilter !== 'Tüm Ürünler') {
            const categoryValue = this.getCategoryValue(productFilter);
            if (categoryValue) {
                constraints.push(where('category', '==', categoryValue));
            }
        }

        try {
            appState.set('isLoadingOrders', true);

            // If loadMore is true, use pagination
            const lastDoc = loadMore ? appState.get('lastFetchedDoc') : null;

            const result = await firebaseService.queryDocuments(
                firebaseService.getOrdersPath(),
                constraints,
                pageSize,
                lastDoc
            );

            const newOrders = result.docs;

            // Update state
            if (loadMore) {
                const existingOrders = appState.get('orders');
                appState.updateOrders([...existingOrders, ...newOrders]);
            } else {
                appState.updateOrders(newOrders);
            }

            appState.set('lastFetchedDoc', result.lastDoc);
            appState.set('hasMoreOrders', result.hasMore);
            appState.set('isLoadingOrders', false);

        } catch (error) {
            console.error('Error loading orders:', error);
            showMessage('Siparişler yüklenirken hata oluştu: ' + error.message, 'error');
            appState.set('isLoadingOrders', false);
        }
    }

    // Load more orders (pagination)
    async loadMoreOrders() {
        const hasMore = appState.get('hasMoreOrders');
        const isLoading = appState.get('isLoadingOrders');

        if (!hasMore || isLoading) return;

        await this.setupOrderListener(true);
    }

    // Get category value from product filter
    getCategoryValue(productFilter) {
        const CATEGORY_MAP = {
            'Canvas Neon': 'neon_standart',
            'Baskılı Ürün': 'baskili',
            'Şeffaf Ürün': 'seffaf',
            'Neon Masa': 'masa',
            'Neon Ayna': 'ayna',
            'Toplu Siparişler': 'toplu',
            'Takım Dekoru': 'takim_dekoru',
        };
        return CATEGORY_MAP[productFilter];
    }

    // Add new order
    async addOrder(orderData, imageFile) {
        const currentUserId = appState.get('currentUserId');
        const currentRole = appState.get('currentRole');

        if (!currentUserId || currentRole === 'guest') {
            showMessage('Giriş yapmanız veya yetkili olmanız gerekiyor.', 'error');
            return false;
        }

        try {
            const orderId = generateOrderId();
            let imageUrl = '';

            // Upload image if provided
            if (imageFile) {
                showMessage('Görsel yükleniyor... Lütfen bekleyin.', 'info');
                const storagePath = `artifacts/${firebaseService.localAppId}/public/images/${orderId}/${imageFile.name}`;
                imageUrl = await firebaseService.uploadFile(imageFile, storagePath);
                showMessage('Görsel başarıyla yüklendi.', 'success');
            } else {
                imageUrl = `https://placehold.co/40x40/FF5A36/ffffff?text=N`;
            }

            const newOrder = {
                ...orderData,
                orderID: orderId,
                imageUrl: imageUrl,
                franchiseeId: currentUserId,
                addedTime: new Date().toISOString(),
                status: 'Çizilmeyi Bekleyenler'
            };

            await firebaseService.addDocument(firebaseService.getOrdersPath(), newOrder);
            showMessage('Yeni sipariş başarıyla sisteme eklendi.', 'success');

            // Refresh orders
            await this.setupOrderListener(false);

            return true;
        } catch (error) {
            console.error('Error adding order:', error);
            showMessage(`Sipariş ekleme başarısız: ${error.message}`, 'error');
            return false;
        }
    }

    // Update existing order
    async updateOrder(orderId, orderData, imageFile) {
        try {
            let imageUrl = orderData.imageUrl;

            // Upload new image if provided
            if (imageFile) {
                showMessage('Yeni görsel yükleniyor... Lütfen bekleyin.', 'info');
                const order = appState.getOrder(orderId);
                const storagePath = `artifacts/${firebaseService.localAppId}/public/images/${order.orderID}/${imageFile.name}`;
                imageUrl = await firebaseService.uploadFile(imageFile, storagePath);
                showMessage('Yeni görsel başarıyla yüklendi.', 'success');
            }

            const updatedData = {
                ...orderData,
                imageUrl: imageUrl,
                lastUpdated: new Date().toISOString()
            };

            const orderPath = `${firebaseService.getOrdersPath()}/${orderId}`;
            await firebaseService.updateDocument(orderPath, updatedData);

            showMessage('Sipariş başarıyla güncellendi.', 'success');

            // Refresh orders
            await this.setupOrderListener(false);

            return true;
        } catch (error) {
            console.error('Error updating order:', error);
            showMessage(`Sipariş güncelleme başarısız: ${error.message}`, 'error');
            return false;
        }
    }

    // Refresh orders (reset pagination)
    async refreshOrders() {
        appState.set('lastFetchedDoc', null);
        appState.set('hasMoreOrders', true);
        appState.clearOrdersCache();
        await this.setupOrderListener(false);
    }
}

// Export singleton instance
const orderService = new OrderService();
export default orderService;
