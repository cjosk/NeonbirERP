import appState from '../utils/state.js';
import { formatDate, formatCurrency, checkIfDelayed, getStatusColor, debounce, sortOrders, filterOrdersBySearch } from '../utils/helpers.js';
import { SORT_OPTIONS } from '../utils/constants.js';

// Order List Component with Pagination
export function renderOrderList() {
    const currentStatusFilter = appState.get('currentStatusFilter');
    const currentProductFilter = appState.get('currentProductFilter');
    const currentSearchTerm = appState.get('currentSearchTerm');
    const currentSortOption = appState.get('currentSortOption');

    // Setup listeners
    setTimeout(() => {
        setupOrderListListeners();
        renderOrderTable();
    }, 100);

    return `
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 p-4 bg-white rounded-xl shadow-lg space-y-4 sm:space-y-0">
            <h2 class="text-2xl font-semibold text-gray-800" id="filterTitle">
                ${currentProductFilter !== 'Tüm Ürünler' ? currentProductFilter + ' / ' : ''}
                ${currentStatusFilter}
            </h2>
        </div>

        <!-- Search and Sort Controls -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <!-- Search Bar -->
            <div class="w-full md:w-2/3 relative">
                <input type="text" 
                       id="orderSearchInput" 
                       value="${currentSearchTerm}"
                       placeholder="Müşteri adı, ürün adı veya ID ile ara..."
                       class="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-neonbirr focus:border-neonbirr transition duration-150 shadow-sm">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>

            <!-- Sort Select -->
            <div class="w-full md:w-1/3 flex items-center space-x-2">
                <label for="orderSortSelect" class="text-gray-700 whitespace-nowrap">Sırala:</label>
                <select id="orderSortSelect"
                        class="w-full p-3 border border-gray-300 rounded-xl focus:ring-neonbirr focus:border-neonbirr transition duration-150 shadow-sm bg-white">
                    ${SORT_OPTIONS.map(option => `
                        <option value="${option.value}" ${currentSortOption === option.value ? 'selected' : ''}>
                            ${option.label}
                        </option>
                    `).join('')}
                </select>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table class="min-w-full divideremember -gray-200">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</th>
                        <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                        <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" style="min-width: 120px;">Aksesuarlar</th>
                        <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri İsmi</th>
                        <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün İsmi</th>
                        <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOPLAM ÜCRET</th>
                        <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eklenme Zamanı</th>
                        <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    </tr>
                </thead>
                <tbody id="orderTableBody" class="bg-white divide-y divide-gray-200">
                    <!-- Orders will be loaded here -->
                    ${renderSkeletonRows(10)}
                </tbody>
            </table>

            <!-- Load More Button -->
            <div id="loadMoreContainer" class="p-4 text-center border-t border-gray-200">
                <!-- Will be populated after data loads -->
            </div>
        </div>
    `;
}

// Skeleton rows for loading state
function renderSkeletonRows(count) {
    return Array(count).fill(0).map(() => `
        <tr>
            <td class="p-3"><div class="skeleton w-10 h-10 rounded-lg"></div></td>
            <td class="p-3"><div class="skeleton w-24 h-6 rounded-full"></div></td>
            <td class="p-3"><div class="skeleton w-20 h-4"></div></td>
            <td class="p-3"><div class="skeleton w-32 h-4"></div></td>
            <td class="p-3"><div class="skeleton w-40 h-4"></div></td>
            <td class="p-3"><div class="skeleton w-24 h-4"></div></td>
            <td class="p-3"><div class="skeleton w-24 h-4"></div></td>
            <td class="p-3"><div class="skeleton w-20 h-4"></div></td>
        </tr>
    `).join('');
}

// Render order table rows
function renderOrderTable() {
    const tableBody = document.getElementById('orderTableBody');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    if (!tableBody) return;

    const orders = appState.get('orders');
    const searchTerm = appState.get('currentSearchTerm');
    const sortOption = appState.get('currentSortOption');
    const hasMore = appState.get('hasMoreOrders');
    const isLoading = appState.get('isLoadingOrders');

    // Filter and sort
    let filteredOrders = filterOrdersBySearch(orders, searchTerm);
    filteredOrders = sortOrders(filteredOrders, sortOption);

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8 text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="text-lg font-medium">Aradığınız kriterlere uygun sipariş bulunmamaktadır.</p>
                </td>
            </tr>
        `;

        if (loadMoreContainer) {
            loadMoreContainer.innerHTML = '';
        }
        return;
    }

    const html = filteredOrders.map(order => {
        const isDelayed = checkIfDelayed(order);
        const statusDisplay = isDelayed ? 'Gecikti' : order.status;
        const statusColor = getStatusColor(order.status, isDelayed);

        return `
            <tr class="border-b hover:bg-gray-50 transition duration-100 cursor-pointer fade-in" 
                onclick="window.app.showOrderDetail('${order.id}')">
                <td class="p-3">
                    <img src="${order.imageUrl}" 
                         onerror="this.onerror=null;this.src='https://placehold.co/40x40/000000/ffffff?text=X'" 
                         alt="Ürün Görseli" 
                         class="w-10 h-10 rounded-lg object-cover shadow-sm">
                </td>
                <td class="p-3 whitespace-nowrap">
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${statusColor}">
                        ${statusDisplay}
                    </span>
                </td>
                <td class="p-3 text-sm text-gray-700" style="min-width: 120px;">${order.accessories || 'Yok'}</td>
                <td class="p-3 font-semibold text-gray-900 whitespace-nowrap">${order.customerName}</td>
                <td class="p-3 text-sm text-gray-700">${order.productName}</td>
                <td class="p-3 text-sm font-bold text-green-600 whitespace-nowrap">${formatCurrency(order.totalPrice)}</td>
                <td class="p-3 text-sm text-gray-500 whitespace-nowrap">${formatDate(order.addedTime)}</td>
                <td class="p-3 text-sm text-gray-500 whitespace-nowrap">${order.orderID}</td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = html;

    // Render load more button
    if (loadMoreContainer) {
        if (hasMore && !isLoading) {
            loadMoreContainer.innerHTML = `
                <button onclick="window.app.loadMoreOrders()" 
                        class="px-6 py-3 bg-neonbirr text-white rounded-lg hover:bg-neonbirr-dark transition duration-200 shadow-md">
                    Daha Fazla Yükle (${orders.length} sipariş gösteriliyor)
                </button>
            `;
        } else if (isLoading) {
            loadMoreContainer.innerHTML = `
                <div class="flex items-center justify-center space-x-2">
                    <svg class="animate-spin h-5 w-5 text-neonbirr" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-gray-600">Yükleniyor...</span>
                </div>
            `;
        } else {
            loadMoreContainer.innerHTML = `
                <p class="text-gray-500 text-sm">Tüm siparişler yüklendi (${orders.length} adet)</p>
            `;
        }
    }
}

// Setup event listeners
function setupOrderListListeners() {
    const searchInput = document.getElementById('orderSearchInput');
    const sortSelect = document.getElementById('orderSortSelect');

    if (searchInput) {
        const debouncedSearch = debounce((value) => {
            appState.set('currentSearchTerm', value);
            renderOrderTable();
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            appState.set('currentSortOption', e.target.value);
            renderOrderTable();
        });
    }
}

// Subscribe to orders changes
appState.subscribe('orders', () => {
    if (appState.get('currentPage') === 'orders') {
        renderOrderTable();
    }
});

appState.subscribe('isLoadingOrders', () => {
    if (appState.get('currentPage') === 'orders') {
        renderOrderTable();
    }
});
