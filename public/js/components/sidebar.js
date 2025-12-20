import appState from '../utils/state.js';
import { ORDER_STATUSES, PRODUCT_TYPES } from '../utils/constants.js';
import firebaseService from '../services/firebase-service.js';

// Sidebar Component
export function renderSidebar() {
    const currentPage = appState.get('currentPage');
    const currentRole = appState.get('currentRole');
    const isMobileMenuOpen = appState.get('isMobileMenuOpen');
    const isOrderCategoryOpen = appState.get('isOrderCategoryOpen');
    const isProductCategoryOpen = appState.get('isProductCategoryOpen');
    const currentStatusFilter = appState.get('currentStatusFilter');
    const currentProductFilter = appState.get('currentProductFilter');

    const linkColor = 'text-gray-700 hover:bg-gray-200';
    const activeColor = 'bg-neonbirr text-white shadow-md';
    const subLinkColor = 'text-gray-600 hover:bg-gray-200';
    const subActiveColor = 'bg-gray-200 text-neonbirr font-bold';

    return `
        <div class="
            fixed inset-y-0 left-0 z-50 w-64 
            flex flex-col bg-white text-gray-800 shadow-xl border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0 md:flex
        ">
            <!-- Logo -->
            <div class="p-6 border-b border-gray-200 flex items-center justify-center">
                <img src="https://cdn.shopify.com/s/files/1/0834/5134/7241/files/logo_40df5a50-74e2-4ab0-aa7a-dfcc162ca5c5.png" 
                     alt="Neonbirr Logo" class="h-12 w-auto object-contain">
            </div>

            <!-- Navigation Links -->
            <nav class="flex-grow p-4 space-y-1 sidebar-nav overflow-y-auto">
                <!-- Dashboard -->
                <a href="#dashboard" onclick="window.app.navigateTo('dashboard'); return false;" 
                   class="nav-link flex items-center p-3 text-sm font-medium rounded-lg ${currentPage === 'dashboard' ? activeColor : linkColor} transition duration-200">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l-2-2m2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    Anasayfa
                </a>

                <!-- Product Category (Collapsible) -->
                <div class="space-y-1">
                    <button onclick="window.app.toggleProductCategory()" 
                            class="w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg ${linkColor} transition duration-200">
                        <span class="flex items-center">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                            </svg>
                            Ürün Kategorisi
                        </span>
                        <svg class="w-4 h-4 transform ${isProductCategoryOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    
                    <div class="${isProductCategoryOpen ? 'block' : 'hidden'} ml-4 border-l border-gray-300 space-y-1 py-1">
                        <a href="#" onclick="window.app.setProductFilter('Tüm Ürünler'); return false;" 
                           class="block pl-4 py-2 text-xs font-medium rounded-lg ${currentProductFilter === 'Tüm Ürünler' && currentPage === 'orders' ? subActiveColor : subLinkColor} transition duration-200">
                            Tüm Ürünler
                        </a>
                        ${PRODUCT_TYPES.map(type => `
                            <a href="#" onclick="window.app.setProductFilter('${type}'); return false;" 
                               class="block pl-4 py-2 text-xs font-medium rounded-lg ${currentProductFilter === type && currentPage === 'orders' ? subActiveColor : subLinkColor} transition duration-200">
                                ${type}
                            </a>
                        `).join('')}
                    </div>
                </div>

                <!-- Order Category (Collapsible) -->
                <div class="space-y-1">
                    <button onclick="window.app.toggleOrderCategory()" 
                            class="w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg ${linkColor} transition duration-200">
                        <span class="flex items-center">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5h6"></path>
                            </svg>
                            Sipariş Kategorisi
                        </span>
                        <svg class="w-4 h-4 transform ${isOrderCategoryOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    
                    <div class="${isOrderCategoryOpen ? 'block' : 'hidden'} ml-4 border-l border-gray-300 space-y-1 py-1">
                        <a href="#" onclick="window.app.setStatusFilter('Tüm Siparişler'); return false;" 
                           class="block pl-4 py-2 text-xs font-medium rounded-lg ${currentStatusFilter === 'Tüm Siparişler' && currentPage === 'orders' ? subActiveColor : subLinkColor} transition duration-200">
                            Tüm Durumlar
                        </a>
                        ${ORDER_STATUSES.map(status => `
                            <a href="#" onclick="window.app.setStatusFilter('${status}'); return false;" 
                               class="block pl-4 py-2 text-xs font-medium rounded-lg ${currentStatusFilter === status && currentPage === 'orders' ? subActiveColor : subLinkColor} transition duration-200">
                                ${status}
                            </a>
                        `).join('')}
                    </div>
                </div>

                <!-- Add Order -->
                <a href="#add_order" onclick="window.app.navigateTo('add_order'); return false;" 
                   class="nav-link flex items-center p-3 text-sm font-medium rounded-lg ${currentPage === 'add_order' ? activeColor : linkColor} transition duration-200">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Sipariş Ekle
                </a>

                <!-- Financial Reports (Admin only) -->
                ${currentRole === 'admin' ? `
                    <a href="#finance_reports" onclick="window.app.navigateTo('finance_reports'); return false;" 
                       class="nav-link flex items-center p-3 text-sm font-medium rounded-lg ${currentPage === 'finance_reports' ? activeColor : linkColor} transition duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6"></path>
                        </svg>
                        Finansal Raporlar
                    </a>
                ` : ''}

                <!-- Admin Panel (Admin only) -->
                ${currentRole === 'admin' ? `
                    <a href="#admin" onclick="window.app.navigateTo('admin'); return false;" 
                       class="nav-link flex items-center p-3 text-sm font-medium rounded-lg ${currentPage === 'admin' ? activeColor : linkColor} transition duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354l.707.707A2.001 2.001 0 0115 7.172V19a2 2 0 01-2 2H5a2 2 0 01-2-2V7.172a2.001 2.001 0 011.293-1.811l.707-.707m0 0V5a2 2 0 012-2h4a2 2 0 012 2v1.354z"></path>
                        </svg>
                        Admin Yönetimi
                    </a>
                ` : ''}
            </nav>

            <!-- User Info -->
            <div class="p-4 border-t border-gray-200">
                <p class="text-xs text-gray-500">
                    Kullanıcı: ${firebaseService.auth.currentUser ? firebaseService.auth.currentUser.email : 'Misafir'}
                </p>
                <p class="text-xs font-semibold text-neonbirr">
                    Rol: ${currentRole ? currentRole.toUpperCase() : 'MİSAFİR'}
                </p>
                <button onclick="window.app.logout()" 
                        class="mt-2 w-full p-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200">
                    Çıkış Yap
                </button>
            </div>
        </div>
    `;
}
