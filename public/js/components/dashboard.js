import appState from '../utils/state.js';
import { checkIfDelayed } from '../utils/helpers.js';
import { CHART_COLORS } from '../utils/constants.js';

let orderChartInstance = null;

// Dashboard Component
export function renderDashboard() {
    // Render will trigger setupMetrics and setupChart  after DOM is ready
    setTimeout(() => {
        renderDashboardMetrics();
        renderDashboardChart();
    }, 100);

    return `
        <div id="metricsContainer" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <!-- Metrics will be loaded here -->
            ${renderSkeletonMetrics()}
        </div>

        <!-- Chart Area -->
        <div class="p-6 bg-white rounded-xl shadow-lg h-96">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-gray-200">
                Sipariş Süreci Dağılımı (Aktif)
            </h3>
            <div class="h-80 flex items-center justify-center">
                <canvas id="orderStatusChart" class="max-h-full"></canvas>
            </div>
        </div>
    `;
}

// Skeleton loader for metrics
function renderSkeletonMetrics() {
    return Array(5).fill(0).map(() => `
        <div class="bg-white p-5 rounded-xl shadow-lg border-l-4 border-gray-300">
            <div class="skeleton h-8 w-16 mb-2"></div>
            <div class="skeleton h-4 w-24"></div>
        </div>
    `).join('');
}

// Render Dashboard Metrics
function renderDashboardMetrics() {
    const orders = appState.get('orders');

    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status !== 'Gönderilen Ürünler' && !checkIfDelayed(o)).length;
    const completedProduction = orders.filter(o => o.status === 'Üretimi Tamamlandı').length;
    const shippedOrders = orders.filter(o => o.status === 'Kargo Aşamasında' || o.status === 'Gönderilen Ürünler').length;
    const delayedOrders = orders.filter(o => checkIfDelayed(o)).length;

    const metric = (value, label, color) => {
        let colorClass = '';
        let textColor = '';
        switch (color) {
            case 'red': colorClass = 'border-red-500'; textColor = '#EF4444'; break;
            case 'green': colorClass = 'border-green-500'; textColor = '#10B981'; break;
            case 'orange': colorClass = 'border-orange-500'; textColor = '#F97316'; break;
            case 'neonbirr': colorClass = 'border-neonbirr'; textColor = '#FF5A36'; break;
            default: colorClass = 'border-gray-500'; textColor = '#6B7280'; break;
        }
        return `
            <div class="bg-white p-5 rounded-xl shadow-lg transition duration-300 hover:shadow-xl transform hover:scale-[1.01] border-l-4 ${colorClass} fade-in">
                <div class="text-3xl font-extrabold" style="color: ${textColor};">${value}</div>
                <div class="text-sm font-medium text-gray-500 mt-1">${label}</div>
            </div>
        `;
    };

    const metricsContainer = document.getElementById('metricsContainer');
    if (metricsContainer) {
        metricsContainer.innerHTML = `
            ${metric(activeOrders, 'Aktif Sipariş', 'red')}
            ${metric(completedProduction, 'Üretimi Biten', 'neonbirr')}
            ${metric(shippedOrders, 'Kargolanan Sipariş', 'green')}
            ${metric(totalOrders, 'Toplam Sipariş', 'orange')}
            ${metric(delayedOrders, 'Geciken Ürün Sayısı', 'red')}
        `;
    }
}

// Render Dashboard Chart
function renderDashboardChart() {
    const chartCanvas = document.getElementById('orderStatusChart');
    if (!chartCanvas) return;

    // Destroy previous chart instance
    if (orderChartInstance) {
        orderChartInstance.destroy();
    }

    const orders = appState.get('orders');

    const statusCounts = {};
    orders.forEach(order => {
        const status = checkIfDelayed(order) ? 'Gecikti' : order.status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const labels = [
        'Çizilmeyi Bekleyenler', 'Çizildi', 'Üretime Alındı',
        'Üretimi Tamamlandı', 'Kargo Aşamasında', 'Gönderilen Ürünler', 'Gecikti'
    ];

    const data = labels.map(label => statusCounts[label] || 0);
    const backgroundColors = labels.map(label => CHART_COLORS[label]);

    const config = {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sipariş Durum Dağılımı',
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4,
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 10,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Aktif Sipariş Durum Dağılımı',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 15
                    }
                }
            }
        }
    };

    orderChartInstance = new Chart(chartCanvas, config);
}

// Subscribe to orders changes
appState.subscribe('orders', () => {
    if (appState.get('currentPage') === 'dashboard') {
        renderDashboardMetrics();
        renderDashboardChart();
    }
});
