import appState from '../utils/state.js';
import orderService from '../services/order-service.js';
import { CATEGORY_MAP, ACCESSORIES, DELIVERY_OPTIONS } from '../utils/constants.js';
import { showMessage } from '../utils/helpers.js';

// Order Form Component (Add & Edit)
export function renderOrderForm(orderId = null) {
    const isEditMode = !!orderId;
    const order = isEditMode ? appState.getOrder(orderId) : null;

    // Setup form listeners after render
    setTimeout(() => {
        setupFormListeners(isEditMode, orderId);
    }, 100);

    if (isEditMode && !order) {
        return `<div class="p-6 bg-red-100 text-red-800 rounded-xl shadow-lg">Sipariş bulunamadı.</div>`;
    }

    const formData = isEditMode ? order : {
        customerName: '',
        productName: '',
        quantity: 1,
        productPrice: '',
        category: 'neon_standart',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryOption: 'standard',
        deliveryDate: '',
        accessories: '',
        orderNote: '',
        imageUrl: ''
    };

    const accessories = formData.accessories ? formData.accessories.split(', ') : [];

    return `
        <div class="p-6 bg-white rounded-xl shadow-lg mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">
                ${isEditMode ? `Siparişi Düzenle: <span class="text-neonbirr">${order.orderID}</span>` : 'Yeni Sipariş Girişi'}
            </h2>
            
            <form id="orderForm" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Müşteri Bilgileri -->
                <div class="md:col-span-2">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4">Müşteri Bilgileri</h3>
                </div>
                
                <div class="form-group">
                    <label for="customerName" class="block text-sm font-medium text-gray-700 mb-1">
                        Müşteri İsmi*
                    </label>
                    <input type="text" id="customerName" name="customerName" required 
                           value="${formData.customerName}"
                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr transition" 
                           placeholder="Ad Soyad veya Firma Adı">
                </div>

                <!-- Ürün Görseli -->
                <div class="form-group">
                    <label for="productImageFile" class="block text-sm font-medium text-gray-700 mb-1">
                        ${isEditMode ? 'Yeni Görsel Yükle (Opsiyonel)' : 'Ürün Görseli Yükle*'}
                    </label>
                    <input type="file" id="productImageFile" name="productImageFile" accept="image/*" 
                           ${!isEditMode ? 'required' : ''}
                           class="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-neonbirr hover:file:bg-gray-200">
                    ${isEditMode && formData.imageUrl ? `
                        <div class="mt-2">
                            <img src="${formData.imageUrl}" class="w-20 h-20 rounded-lg object-cover border border-gray-200" 
                                 onerror="this.style.display='none'">
                        </div>
                    ` : ''}
                </div>

                <!-- Ürün Bilgileri -->
                <div class="md:col-span-2">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4 mt-4">Ürün Bilgileri</h3>
                </div>

                <div class="form-group">
                    <label for="productName" class="block text-sm font-medium text-gray-700 mb-1">
                        Ürün İsmi*
                    </label>
                    <input type="text" id="productName" name="productName" required 
                           value="${formData.productName}"
                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr" 
                           placeholder="Örn: 90x90 5 Yıldız Canvas Neon">
                </div>

                <div class="form-group">
                    <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Kategori*</label>
                    <select id="category" name="category" required 
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr bg-white">
                        ${Object.entries(CATEGORY_MAP).map(([name, value]) =>
        `<option value="${value}" ${formData.category === value ? 'selected' : ''}>${name}</option>`
    ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">Adet*</label>
                    <input type="number" id="quantity" name="quantity" required min="1" 
                           value="${formData.quantity}"
                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr">
                </div>

                <div class="form-group">
                    <label for="productPrice" class="block text-sm font-medium text-gray-700 mb-1">
                        Birim Fiyat (₺)*
                    </label>
                    <input type="number" id="productPrice" name="productPrice" required min="1" step="0.01" 
                           value="${formData.productPrice}"
                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr" 
                           placeholder="1000">
                    <p id="totalPriceDisplay" class="text-sm text-gray-500 mt-1">
                        Toplam: ₺${(formData.productPrice * formData.quantity || 0).toFixed(2)}
                    </p>
                </div>

                <!-- Tarih ve Teslimat -->
                <div class="md:col-span-2">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4 mt-4">Tarih ve Teslimat Bilgileri</h3>
                </div>

                <div class="form-group">
                    <label for="orderDate" class="block text-sm font-medium text-gray-700 mb-1">
                        Sipariş Tarihi*
                    </label>
                    <input type="date" id="orderDate" name="orderDate" required 
                           value="${formData.orderDate}"
                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr">
                </div>

                <div class="form-group">
                    <label for="deliveryDate" class="block text-sm font-medium text-gray-700 mb-1">
                        Hedef Teslim Tarihi
                    </label>
                    <input type="date" id="deliveryDate" name="deliveryDate" 
                           value="${formData.deliveryDate}"
                           class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr">
                </div>

                <div class="form-group md:col-span-2">
                    <label for="deliveryOption" class="block text-sm font-medium text-gray-700 mb-1">
                        Teslim Seçeneği*
                    </label>
                    <select id="deliveryOption" name="deliveryOption" required 
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr bg-white">
                        ${DELIVERY_OPTIONS.map(option =>
        `<option value="${option.value}" ${formData.deliveryOption === option.value ? 'selected' : ''}>
                                ${option.label}
                            </option>`
    ).join('')}
                    </select>
                </div>

                <!-- Aksesuarlar -->
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Aksesuarlar</label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        ${ACCESSORIES.map(accessory => `
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="accessories" value="${accessory}" 
                                       ${accessories.includes(accessory) ? 'checked' : ''}
                                       class="form-checkbox text-neonbirr rounded-md focus:ring-neonbirr">
                                <span class="ml-2 text-sm text-gray-700">${accessory}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Sipariş Notu -->
                <div class="md:col-span-2">
                    <label for="orderNote" class="block text-sm font-medium text-gray-700 mb-1">Sipariş Notu</label>
                    <textarea id="orderNote" name="orderNote" rows="3" 
                              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr" 
                              placeholder="Müşteriye özel talepler, renk kodları vb.">${formData.orderNote || ''}</textarea>
                </div>

                ${isEditMode ? `
                    <div class="md:col-span-2">
                        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Sipariş Durumu</label>
                        <select id="status" name="status" 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr bg-white">
                            <option value="Çizilmeyi Bekleyenler" ${formData.status === 'Çizilmeyi Bekleyenler' ? 'selected' : ''}>Çizilmeyi Bekleyenler</option>
                            <option value="Çizildi" ${formData.status === 'Çizildi' ? 'selected' : ''}>Çizildi</option>
                            <option value="Üretime Alındı" ${formData.status === 'Üretime Alındı' ? 'selected' : ''}>Üretime Alındı</option>
                            <option value="Üretimi Tamamlandı" ${formData.status === 'Üretimi Tamamlandı' ? 'selected' : ''}>Üretimi Tamamlandı</option>
                            <option value="Kargo Aşamasında" ${formData.status === 'Kargo Aşamasında' ? 'selected' : ''}>Kargo Aşamasında</option>
                            <option value="Gönderilen Ürünler" ${formData.status === 'Gönderilen Ürünler' ? 'selected' : ''}>Gönderilen Ürünler</option>
                        </select>
                    </div>
                ` : ''}

                <!-- Butonlar -->
                <div class="md:col-span-2 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t">
                    <button type="button" onclick="window.app.navigateTo('${isEditMode ? 'order_detail' : 'dashboard'}'); return false;" 
                            class="bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-200 shadow-md">
                        ${isEditMode ? 'İptal / Geri Dön' : 'İptal'}
                    </button>
                    <button type="submit" id="submitBtn"
                            class="bg-neonbirr text-white p-3 rounded-lg font-semibold hover:bg-neonbirr-dark transition duration-200 shadow-md flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        ${isEditMode ? 'Değişiklikleri Kaydet' : 'Siparişi Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    `;
}

// Setup form event listeners
function setupFormListeners(isEditMode, orderId) {
    const form = document.getElementById('orderForm');
    if (!form) return;

    // Update total price on quantity/price change
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('productPrice');
    const totalDisplay = document.getElementById('totalPriceDisplay');

    const updateTotal = () => {
        const qty = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = (qty * price).toFixed(2);
        totalDisplay.textContent = `Toplam: ₺${total}`;
    };

    if (quantityInput) quantityInput.addEventListener('input', updateTotal);
    if (priceInput) priceInput.addEventListener('input', updateTotal);

    // Form submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

        try {
            const formData = new FormData(form);
            const accessories = Array.from(form.querySelectorAll('input[name="accessories"]:checked'))
                .map(cb => cb.value).join(', ');

            const orderData = {
                customerName: formData.get('customerName'),
                productName: formData.get('productName'),
                quantity: parseInt(formData.get('quantity')),
                productPrice: parseFloat(formData.get('productPrice')),
                totalPrice: parseFloat(formData.get('productPrice')) * parseInt(formData.get('quantity')),
                category: formData.get('category'),
                orderDate: formData.get('orderDate'),
                deliveryOption: formData.get('deliveryOption'),
                deliveryDate: formData.get('deliveryDate'),
                accessories: accessories,
                orderNote: formData.get('orderNote')
            };

            if (isEditMode) {
                orderData.status = formData.get('status');
                orderData.imageUrl = appState.getOrder(orderId).imageUrl;
            }

            const imageFile = document.getElementById('productImageFile').files[0];

            let success;
            if (isEditMode) {
                success = await orderService.updateOrder(orderId, orderData, imageFile);
            } else {
                success = await orderService.addOrder(orderData, imageFile);
            }

            if (success) {
                if (isEditMode) {
                    window.app.navigateTo('order_detail');
                } else {
                    window.app.navigateTo('dashboard');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('Bir hata oluştu: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = isEditMode ? 'Değişiklikleri Kaydet' : 'Siparişi Kaydet';
        }
    });
}
