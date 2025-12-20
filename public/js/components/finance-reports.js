import appState from '../utils/state.js';
import { formatDate, formatCurrency } from '../utils/helpers.js';

// Finance Reports Component
export function renderFinanceReports() {
    const currentRole = appState.get('currentRole');

    if (currentRole !== 'admin') {
        return `
            <div class="p-6 bg-red-100 text-red-800 rounded-xl shadow-lg">
                Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </div>
        `;
    }

    const orders = appState.get('orders');

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'Gönderilen Ürünler').length;
    const completedRevenue = orders
        .filter(o => o.status === 'Gönderilen Ürünler')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'Gönderilen Ürünler').length;
    const activeRevenue = orders
        .filter(o => o.status !== 'Gönderilen Ürünler')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    // Calculate by product category
    const revenueByCategory = {};
    orders.forEach(order => {
        const cat = order.category || 'Diğer';
        if (!revenueByCategory[cat]) {
            revenueByCategory[cat] = { count: 0, revenue: 0 };
        }
        revenueByCategory[cat].count++;
        revenueByCategory[cat].revenue += order.totalPrice || 0;
    });

    // Recent high-value orders
    const highValueOrders = orders
        .filter(o => o.totalPrice > 2000)
        .sort((a, b) => b.totalPrice - a.totalPrice)
        .slice(0, 10);

    return `
        <div class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm opacity-90">Toplam Ciro</p>
                            <p class="text-3xl font-bold mt-1">${formatCurrency(totalRevenue)}</p>
                            <p class="text-sm mt-1">${totalOrders} Sipariş</p>
                        </div>
                        <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm opacity-90">Tamamlanan Satışlar</p>
                            <p class="text-3xl font-bold mt-1">${formatCurrency(completedRevenue)}</p>
                            <p class="text-sm mt-1">${completedOrders} Sipariş</p>
                        </div>
                        <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm opacity-90">Aktif Siparişler</p>
                            <p class="text-3xl font-bold mt-1">${formatCurrency(activeRevenue)}</p>
                            <p class="text-sm mt-1">${activeOrders} Sipariş</p>
                        </div>
                        <svg class="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Category Revenue Breakdown -->
            <div class="bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200">
                    Kategori Bazlı Ciro Dağılımı
                </h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş Sayısı</th>
                                <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Ciro</th>
                                <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Ortalama</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${Object.entries(revenueByCategory).map(([category, data]) => `
                                <tr class="hover:bg-gray-50 transition">
                                    <td class="p-3 font-semibold text-gray-900">${category}</td>
                                    <td class="p-3 text-gray-700">${data.count}</td>
                                    <td class="p-3 font-bold text-green-600">${formatCurrency(data.revenue)}</td>
                                    <td class="p-3 text-gray-700">${formatCurrency(data.revenue / data.count)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- High-Value Orders -->
            <div class="bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200">
                    Yüksek Değerli Siparişler (₺2000+)
                </h3>
                ${highValueOrders.length > 0 ? `
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş ID</th>
                                    <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                                    <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                                    <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                                    <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                                    <th class="p-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${highValueOrders.map(order => `
                                    <tr class="hover:bg-gray-50 transition cursor-pointer" 
                                        onclick="window.app.showOrderDetail('${order.id}')">
                                        <td class="p-3 font-mono text-xs text-gray-500">${order.orderID}</td>
                                        <td class="p-3 font-semibold text-gray-900">${order.customerName}</td>
                                        <td class="p-3 text-sm text-gray-700">${order.productName.substring(0, 40)}...</td>
                                        <td class="p-3 font-bold text-green-600">${formatCurrency(order.totalPrice)}</td>
                                        <td class="p-3 text-xs text-gray-500">${formatDate(order.orderDate)}</td>
                                        <td class="p-3 text-xs">
                                            <span class="px-2 py-1 rounded-full ${order.status === 'Gönderilen Ürünler' ? 'bg-green-100 text-green-800' :
            order.status === 'Üretimi Tamamlandı' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
        }">
                                                ${order.status}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <p class="text-gray-500 text-center py-8">Henüz yüksek değerli sipariş bulunmamaktadır.</p>
                `}
            </div>
        </div>
    `;
}
