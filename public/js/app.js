import firebaseService from './services/firebase-service.js';
import orderService from './services/order-service.js';
import appState from './utils/state.js';
import { showMessage } from './utils/helpers.js';
import { renderLogin } from './components/auth.js';
import { renderDashboard } from './components/dashboard.js';
import { renderOrderList } from './components/order-list.js';
import { renderOrderForm } from './components/order-form.js';
import { renderOrderDetail } from './components/order-detail.js';
import { renderAdminPanel } from './components/admin-panel.js';
import { renderFinanceReports } from './components/finance-reports.js';
import { renderSidebar } from './components/sidebar.js';
import { renderMobileNav } from './components/mobile-nav.js';

// Initialize Application
class App {
    constructor() {
        this.init();
    }

    async init() {
        // Setup auth listener
        await this.setupAuthListener();

        // Setup state subscriptions
        this.setupStateSubscriptions();

        // Setup hash navigation
        this.setupHashNavigation();

        // Make navigation and other functions globally accessible
        this.exposeGlobalFunctions();
    }

    // Setup authentication listener
    async setupAuthListener() {
        firebaseService.onAuthChanged(async (user) => {
            appState.set('isAuthReady', true);

            if (user) {
                appState.set('currentUserId', user.uid);

                // Fetch user role
                await this.checkUserRole(user.uid);

                // Fetch delivery limit settings
                await this.fetchDeliveryLimit();

                // Render app
                this.render();
            } else {
                appState.batchSet({
                    currentUserId: null,
                    currentRole: null
                });
                this.render();
            }
        });

        // Try custom token login or anonymous
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (initialAuthToken) {
            try {
                await firebaseService.signInCustom(initialAuthToken);
            } catch (error) {
                console.error('Custom token login failed:', error);
            }
        }
    }

    // Check user role
    async checkUserRole(uid) {
        try {
            const userRolePath = firebaseService.getUserRolePath(uid);
            const userDoc = await firebaseService.getDocument(userRolePath);

            if (userDoc.exists()) {
                appState.set('currentRole', userDoc.data().role || 'franchisee');
            } else {
                // Check if admin by email
                const adminEmail = 'neonbirr@gmail.com';
                if (firebaseService.auth.currentUser?.email === adminEmail) {
                    appState.set('currentRole', 'admin');
                } else {
                    appState.set('currentRole', 'franchisee');
                }
            }
        } catch (error) {
            console.error('Error checking user role:', error);
            appState.set('currentRole', 'guest');
        }
    }

    // Fetch delivery limit settings
    async fetchDeliveryLimit() {
        try {
            const settingsPath = firebaseService.getDeliverySettingsPath();
            const docSnap = await firebaseService.getDocument(settingsPath);

            if (docSnap.exists()) {
                appState.set('deliveryDaysLimit', docSnap.data().limitDays || 14);
            } else {
                appState.set('deliveryDaysLimit', 14);
            }
        } catch (error) {
            console.error('Error fetching delivery limit:', error);
            appState.set('deliveryDaysLimit', 14);
        }
    }

    // Setup state subscriptions
    setupStateSubscriptions() {
        // Re-render on page change
        appState.subscribe('currentPage', () => {
            this.render();
        });

        // Re-render sidebar when categories are toggled
        appState.subscribe('isOrderCategoryOpen', () => {
            this.renderSidebar();
        });

        appState.subscribe('isProductCategoryOpen', () => {
            this.renderSidebar();
        });

        appState.subscribe('isMobileMenuOpen', () => {
            this.render();
        });

        // Reload orders on filter change
        appState.subscribe('currentStatusFilter', () => {
            orderService.refreshOrders();
        });

        appState.subscribe('currentProductFilter', () => {
            orderService.refreshOrders();
        });
    }

    // Setup hash navigation
    setupHashNavigation() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                appState.set('currentPage', hash);
            }
        });

        // Handle initial hash
        const initialHash = window.location.hash.replace('#', '');
        if (initialHash) {
            appState.set('currentPage', initialHash);
        }
    }

    // Expose global functions for onclick handlers
    exposeGlobalFunctions() {
        window.app = {
            navigateTo: (page) => {
                appState.batchSet({
                    currentPage: page,
                    isMobileMenuOpen: false
                });
                window.location.hash = page;
            },

            logout: async () => {
                try {
                    await firebaseService.logout();
                    showMessage('Çıkış yapıldı.', 'info');
                } catch (error) {
                    console.error('Logout error:', error);
                    showMessage('Çıkış yapılırken hata oluştu.', 'error');
                }
            },

            toggleMobileMenu: () => {
                const isOpen = appState.get('isMobileMenuOpen');
                appState.set('isMobileMenuOpen', !isOpen);
            },

            toggleOrderCategory: () => {
                const isOpen = appState.get('isOrderCategoryOpen');
                appState.set('isOrderCategoryOpen', !isOpen);
            },

            toggleProductCategory: () => {
                const isOpen = appState.get('isProductCategoryOpen');
                appState.set('isProductCategoryOpen', !isOpen);
            },

            setStatusFilter: (filter) => {
                appState.batchSet({
                    currentStatusFilter: filter,
                    currentProductFilter: 'Tüm Ürünler',
                    currentSearchTerm: '',
                    currentPage: 'orders'
                });
            },

            setProductFilter: (filter) => {
                appState.batchSet({
                    currentProductFilter: filter,
                    currentStatusFilter: 'Tüm Siparişler',
                    currentSearchTerm: '',
                    currentPage: 'orders'
                });
            },

            showOrderDetail: (orderId) => {
                appState.set('currentOrderId', orderId);
                appState.set('currentPage', 'order_detail');
            },

            showEditOrder: () => {
                appState.set('currentPage', 'edit_order');
            },

            loadMoreOrders: () => {
                orderService.loadMoreOrders();
            },

            appState: appState,
            orderService: orderService
        };
    }

    // Main render function
    render() {
        const isAuthReady = appState.get('isAuthReady');
        const currentUserId = appState.get('currentUserId');
        const currentRole = appState.get('currentRole');
        const currentPage = appState.get('currentPage');

        const appContainer = document.getElementById('app');

        // Show loading if auth not ready
        if (!isAuthReady) {
            appContainer.innerHTML = `
                <div class="min-h-screen flex items-center justify-center bg-gray-100">
                    <svg class="animate-spin h-10 w-10 text-neonbirr" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="ml-3 text-gray-700">Oturum kontrol ediliyor...</span>
                </div>
            `;
            return;
        }

        // Show login if not authenticated
        if (!currentUserId || currentRole === 'guest') {
            appContainer.innerHTML = renderLogin();
            this.attachLoginListeners();
            return;
        }

        // Render main app layout
        appContainer.innerHTML = this.renderMainLayout();

        // Render sidebar explicitly
        this.renderSidebar();

        // Render content based on current page
        this.renderContent(currentPage);
    }

    // Render main layout (sidebar + content area)
    renderMainLayout() {
        const isMobileMenuOpen = appState.get('isMobileMenuOpen');

        return `
            <div class="flex h-screen bg-gray-100">
                <!-- Mobile Overlay -->
                ${isMobileMenuOpen ?
                `<div class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden" onclick="window.app.toggleMobileMenu()"></div>`
                : ''
            }

                <!-- Sidebar -->
                <div id="sidebarContainer"></div>

                <!-- Main Content -->
                <main class="flex-1 overflow-y-auto p-4 md:p-8">
                    <!-- Mobile Header -->
                    <div class="flex justify-between items-center mb-6 md:hidden sticky top-0 bg-gray-100 py-3 z-30 border-b border-gray-200 -mt-4 -mx-4 px-4">
                        <h1 id="pageTitleMobile" class="text-xl font-bold text-gray-900"></h1>
                        <button onclick="window.app.toggleMobileMenu()" class="p-2 text-gray-500 hover:text-neonbirr focus:outline-none focus:ring-2 focus:ring-neonbirr rounded-lg shadow-md bg-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${isMobileMenuOpen ?
                `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>` :
                `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>`
            }
                            </svg>
                        </button>
                    </div>

                    <!-- Desktop Header -->
                    <h1 id="pageTitleDesktop" class="hidden md:block text-3xl font-bold text-gray-900 mb-6"></h1>

                    <!-- Content Area -->
                    <div id="contentArea"></div>
                </main>
            </div>

            <!-- Mobile Navigation -->
            ${renderMobileNav()}
        `;
    }

    // Render only sidebar (for state updates)
    renderSidebar() {
        const sidebarContainer = document.getElementById('sidebarContainer');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = renderSidebar();
        }
    }

    // Render content based on page
    renderContent(page) {
        const contentArea = document.getElementById('contentArea');
        const pageTitleDesktop = document.getElementById('pageTitleDesktop');
        const pageTitleMobile = document.getElementById('pageTitleMobile');
        const currentRole = appState.get('currentRole');

        let title = '';
        let content = '';

        switch (page) {
            case 'dashboard':
                title = 'Anasayfa (Dashboard)';
                content = renderDashboard();
                break;

            case 'orders':
                title = 'Tüm Siparişler';
                content = renderOrderList();
                break;

            case 'add_order':
                title = 'Yeni Sipariş Girişi';
                content = renderOrderForm();
                break;

            case 'edit_order':
                title = 'Sipariş Düzenle';
                const orderId = appState.get('currentOrderId');
                content = renderOrderForm(orderId);
                break;

            case 'order_detail':
                title = 'Sipariş Detayı';
                content = renderOrderDetail();
                break;

            case 'finance_reports':
                if (currentRole === 'admin') {
                    title = 'Finansal Raporlar';
                    content = renderFinanceReports();
                } else {
                    content = '<div class="p-6 bg-red-100 text-red-800 rounded-xl shadow-lg">Bu sayfaya erişim yetkiniz bulunmamaktadır.</div>';
                }
                break;

            case 'admin':
                if (currentRole === 'admin') {
                    title = 'Admin Yönetimi';
                    content = renderAdminPanel();
                } else {
                    content = '<div class="p-6 bg-red-100 text-red-800 rounded-xl shadow-lg">Bu sayfaya erişim yetkiniz bulunmamaktadır.</div>';
                }
                break;

            default:
                title = 'Anasayfa';
                content = renderDashboard();
        }

        if (pageTitleDesktop) pageTitleDesktop.textContent = title;
        if (pageTitleMobile) pageTitleMobile.textContent = title;
        if (contentArea) contentArea.innerHTML = content;

        // Attach listeners after content is rendered
        this.attachContentListeners(page);
    }

    // Attach event listeners for login form
    attachLoginListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                try {
                    await firebaseService.loginWithEmail(email, password);
                    showMessage('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
                } catch (error) {
                    console.error('Login error:', error);
                    showMessage(`Giriş başarısız: ${error.message}`, 'error');
                }
            });
        }
    }

    // Attach event listeners based on page
    attachContentListeners(page) {
        // Different pages will have different listeners
        // These will be handled in respective component files

        // Trigger initial data load for certain pages
        if (page === 'dashboard' || page === 'orders') {
            orderService.setupOrderListener(false);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

export default App;
