import appState from '../utils/state.js';
import { formatDate, formatCurrency, checkIfDelayed, getStatusColor } from '../utils/helpers.js';
import { CATEGORY_MAP } from '../utils/constants.js';

// Order Detail Component
export function renderOrderDetail() {
    const orderId = appState.get('currentOrderId');
    const order = appState.getOrder(orderId);

    if (!order) {
        return `
            <div class="p-6 bg-red-100 text-red-800 rounded-xl shadow-lg">
                <p class="font-semibold">Sipariş bulunamadı.</p>
                <button onclick="window.app.navigateTo('orders')" 
                        class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                    Sipariş Listesine Dön
                </button>
            </div>
        `;
    }

    const isDelayed = checkIfDelayed(order);
    const statusDisplay = isDelayed ? 'Gecikti (Otom. Etiket)' : order.status;
    const statusColor = getStatusColor(order.status, isDelayed);
    const categoryName = Object.keys(CATEGORY_MAP).find(key => CATEGORY_MAP[key] === order.category) || order.category;

    return `
        <div class="p-6 bg-white rounded-xl shadow-2xl mb-8">
            <!-- Başlık ve Durum -->
            <div class="flex flex-col lg:flex-row justify-between items-start border-b pb-4 mb-6 border-gray-200">
                <div class="w-full lg:w-auto mb-4 lg:mb-0">
                    <h2 class="text-2xl lg:text-3xl font-bold text-gray-800">${order.productName}</h2>
                    <p class="text-md text-gray-500 mt-1">
                        Sipariş ID: <span class="font-mono text-neonbirr font-semibold">${order.orderID}</span>
                    </p>
                </div>
                <div class="w-full lg:w-auto text-left lg:text-right">
                    <span class="inline-block px-4 py-2 text-sm font-semibold rounded-full ${statusColor} shadow-md transition duration-300">
                        Durum: ${statusDisplay}
                    </span>
                    ${isDelayed ? `
                        <p class="text-xs text-red-500 mt-1 font-medium">
                            ⚠️ Teslimat sınırını aştı! (${appState.get('deliveryDaysLimit')} gün)
                        </p>
                    ` : ''}
                </div>
            </div>

            <!-- Ana İçerik: Görsel ve Bilgiler -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
                
                <!-- Ürün Görseli (Sol Köşe) -->
                <div class="lg:col-span-1">
                    <h3 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 border-gray-200">
                        Ürün Görseli
                    </h3>
                    <div class="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                        <img src="${order.imageUrl}" 
                             onerror="this.onerror=null;this.src='https://placehold.co/400x400/FF5A36/ffffff?text=Gorsel+Yok'" 
                             alt="Ürün Görseli" 
                             class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                             onclick="window.open('${order.imageUrl}', '_blank')">
                    </div>
                     <p class="text-xs text-gray-500 text-center mt-2">Büyütmek için tıklayın</p>
                </div>

                <!-- Detay Bilgileri (Sağ) -->
                <div class="lg:col-span-3">
                    <!-- Finansal Özet -->
                    <div class="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border-2 border-neonbirr mb-6 shadow-inner">
                        <h3 class="text-xl font-extrabold text-neonbirr mb-4 border-b pb-2 border-neonbirr/30 flex items-center">
                            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Finansal Özet
                        </h3>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-800">
                            <div class="bg-white p-4 rounded-lg shadow-sm">
                                <p class="text-sm font-medium text-gray-500">Birim Fiyat</p>
                                <p class="text-2xl font-bold text-neonbirr">${formatCurrency(order.productPrice)}</p>
                            </div>
                            <div class="bg-white p-4 rounded-lg shadow-sm">
                                <p class="text-sm font-medium text-gray-500">Adet</p>
                                <p class="text-2xl font-bold text-neonbirr">${order.quantity}</p>
                            </div>
                            <div class="bg-white p-4 rounded-lg shadow-sm">
                                <p class="text-sm font-medium text-gray-500">TOPLAM</p>
                                <p class="text-3xl font-black text-green-700">${formatCurrency(order.totalPrice)}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Müşteri ve Lojistik Bilgileri -->
                    <h3 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 border-gray-200">
                        Müşteri ve Lojistik Bilgileri
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-neonbirr mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <div>
                                <p class="text-xs text-gray-500">Müşteri Adı</p>
                                <p class="font-semibold text-gray-900">${order.customerName}</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-neonbirr mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                            <div>
                                <p class="text-xs text-gray-500">Kategori</p>
                                <p class="font-semibold text-gray-900">${categoryName}</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-neonbirr mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <div>
                                <p class="text-xs text-gray-500">Sipariş Tarihi</p>
                                <p class="font-semibold text-gray-900">${formatDate(order.orderDate)}</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-neonbirr mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <p class="text-xs text-gray-500">Hedef Teslimat</p>
                                <p class="font-semibold text-gray-900">
                                    ${order.deliveryDate ? formatDate(order.deliveryDate) : 'Belirtilmemiş'}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-neonbirr mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                            </svg>
                            <div>
                                <p class="text-xs text-gray-500">Teslim Seçeneği</p>
                                <p class="font-semibold text-gray-900 capitalize">${order.deliveryOption}</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-neonbirr mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                            </svg>
                            <div>
                                <p class="text-xs text-gray-500">Franchisee ID</p>
                                <p class="text-xs font-mono text-gray-500">${order.franchiseeId.substring(0, 12)}...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Notlar ve Aksesuarlar -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 border-gray-200 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-neonbirr" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        Aksesuarlar
                    </h3>
                    ${order.accessories ? `
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <ul class="space-y-2">
                                ${order.accessories.split(', ').map(acc => `
                                    <li class="flex items-center text-sm text-gray-700">
                                        <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        ${acc}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : '<p class="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 italic">Bu siparişte ek aksesuar seçilmemiştir.</p>'}
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 border-gray-200 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-neonbirr" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                        </svg>
                        Sipariş Notu
                    </h3>
                    <p class="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 min-h-[5rem] whitespace-pre-wrap">
                        ${order.orderNote || 'Müşteri notu bulunmamaktadır.'}
                    </p>
                </div>
            </div>

            <!-- İşlem Butonları -->
            <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t mt-8 border-gray-200">
                <button onclick="window.app.navigateTo('orders')" 
                        class="bg-gray-300 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-400 transition duration-200 shadow-md w-full sm:w-auto">
                    <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Listeye Geri Dön
                </button>
                <button onclick="window.app.showEditOrder()" 
                        class="bg-neonbirr text-white p-3 rounded-lg font-semibold hover:bg-neonbirr-dark transition duration-200 shadow-md w-full sm:w-auto">
                    <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Siparişi Düzenle
                </button>
            </div>
        </div>
    `;
}
