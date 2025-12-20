import { STATUS_COLORS } from './constants.js';
import appState from './state.js';

// Date Formatting
export function formatDate(dateString) {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR');
}

// Currency Formatting
export function formatCurrency(price) {
    return (price || 0).toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    });
}

// Check if order is delayed
export function checkIfDelayed(order) {
    if (order.status === 'Gönderilen Ürünler') return false;
    if (!order.orderDate) return false;

    try {
        const orderDate = new Date(order.orderDate);
        const limitDays = appState.get('deliveryDaysLimit');

        const expectedDeliveryDate = new Date(orderDate);
        expectedDeliveryDate.setDate(orderDate.getDate() + limitDays);

        const now = new Date();

        return now > expectedDeliveryDate;
    } catch (e) {
        console.error("Gecikme hesaplamasında tarih hatası:", e);
        return false;
    }
}

// Get status color class
export function getStatusColor(status, isDelayed = false) {
    if (isDelayed) {
        return STATUS_COLORS['Gecikti'];
    }
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
}

// Generate unique order ID
export function generateOrderId() {
    return `NEON${Date.now().toString().slice(-6)}`;
}

// Debounce function for search
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Show message notification
export function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    if (!container) return;

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    const alert = document.createElement('div');
    alert.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-xl mb-4 fade-in flex items-center justify-between`;

    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;

    container.prepend(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone (Turkish format)
export function isValidPhone(phone) {
    const re = /^(\+90|0)?[0-9]{10}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Sort orders based on option
export function sortOrders(orders, sortOption) {
    const sorted = [...orders];

    switch (sortOption) {
        case 'date_desc':
            return sorted.sort((a, b) => new Date(b.addedTime) - new Date(a.addedTime));
        case 'date_asc':
            return sorted.sort((a, b) => new Date(a.addedTime) - new Date(b.addedTime));
        case 'price_desc':
            return sorted.sort((a, b) => b.totalPrice - a.totalPrice);
        case 'price_asc':
            return sorted.sort((a, b) => a.totalPrice - b.totalPrice);
        case 'name_asc':
            return sorted.sort((a, b) => a.customerName.localeCompare(b.customerName, 'tr'));
        case 'name_desc':
            return sorted.sort((a, b) => b.customerName.localeCompare(a.customerName, 'tr'));
        default:
            return sorted;
    }
}

// Filter orders based on search term
export function filterOrdersBySearch(orders, searchTerm) {
    if (!searchTerm) return orders;

    const term = searchTerm.toLowerCase().trim();
    return orders.filter(order =>
        order.customerName.toLowerCase().includes(term) ||
        order.productName.toLowerCase().includes(term) ||
        order.orderID.toLowerCase().includes(term)
    );
}

// Virtual Scroll Helper - Calculate visible range
export function calculateVisibleRange(scrollTop, containerHeight, itemHeight, totalItems) {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        totalItems - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight)
    );

    // Add buffer for smooth scrolling
    const buffer = 5;
    return {
        start: Math.max(0, startIndex - buffer),
        end: Math.min(totalItems - 1, endIndex + buffer)
    };
}

// Local Storage helpers
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error writing to localStorage:', e);
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    }
};
