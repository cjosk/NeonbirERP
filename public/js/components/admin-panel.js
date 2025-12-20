import appState from '../utils/state.js';
import firebaseService from '../services/firebase-service.js';
import { showMessage } from '../utils/helpers.js';

// Admin Panel Component
export function renderAdminPanel() {
    const currentRole = appState.get('currentRole');

    if (currentRole !== 'admin') {
        return `
            <div class="p-6 bg-red-100 text-red-800 rounded-xl shadow-lg">
                Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </div>
        `;
    }

    // Setup listeners after render
    setTimeout(() => {
        setupAdminListeners();
    }, 100);

    const deliveryDaysLimit = appState.get('deliveryDaysLimit');

    return `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Kullanıcı Oluşturma  -->
            <div class="p-6 bg-white rounded-xl shadow-lg">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200 flex items-center">
                    <svg class="w-6 h-6 mr-2 text-neonbirr" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                    </svg>
                    Yeni Kullanıcı Oluştur
                </h2>
                
                <form id="createUserForm" class="space-y-4">
                    <div>
                        <label for="newUserEmail" class="block text-sm font-medium text-gray-700 mb-1">
                            E-Posta Adresi*
                        </label>
                        <input type="email" id="newUserEmail" name="email" required 
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr" 
                               placeholder="kullanici@domain.com">
                    </div>

                    <div>
                        <label for="newUserPassword" class="block text-sm font-medium text-gray-700 mb-1">
                            Şifre* (Min. 6 karakter)
                        </label>
                        <input type="password" id="newUserPassword" name="password" required minlength="6"
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr" 
                               placeholder="••••••••">
                    </div>

                    <div>
                        <label for="newUserRole" class="block text-sm font-medium text-gray-700 mb-1">Rol*</label>
                        <select id="newUserRole" name="role" required 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr bg-white">
                            <option value="franchisee">Franchisee</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" 
                            class="w-full bg-neonbirr text-white p-3 rounded-lg font-semibold hover:bg-neonbirr-dark transition duration-200 shadow-md flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Kullanıcı Oluştur
                    </button>
                </form>
            </div>

            <!-- Teslimat Süresi Ayarları -->
            <div class="p-6 bg-white rounded-xl shadow-lg">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200 flex items-center">
                    <svg class="w-6 h-6 mr-2 text-neonbirr" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Teslimat Gecikme Limiti
                </h2>

                <form id="deliveryLimitForm" class="space-y-4">
                    <div>
                        <label for="deliveryDaysLimit" class="block text-sm font-medium text-gray-700 mb-1">
                            Gecikme Limit Süresi (Gün)*
                        </label>
                        <input type="number" id="deliveryDaysLimit" name="deliveryDaysLimit" required min="1" 
                               value="${deliveryDaysLimit}"
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr">
                        <p class="text-xs text-gray-500 mt-2">
                            Sipariş tarihinden itibaren <strong id="limitDisplay">${deliveryDaysLimit}</strong> gün sonra sipariş "Gecikti" olarak işaretlenir.
                        </p>
                    </div>

                    <button type="submit" 
                            class="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Limiti Güncelle
                    </button>
                </form>
            </div>
        </div>
    `;
}

// Setup event listeners
function setupAdminListeners() {
    // Create user form
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(createUserForm);
            const email = formData.get('email');
            const password = formData.get('password');
            const role = formData.get('role');

            try {
                await firebaseService.createUser(email, password, role);
                showMessage(`Kullanıcı başarıyla oluşturuldu: ${email}`, 'success');
                createUserForm.reset();
            } catch (error) {
                console.error('User creation error:', error);
                showMessage(`Hata: ${error.message}`, 'error');
            }
        });
    }

    // Delivery limit form
    const deliveryLimitForm = document.getElementById('deliveryLimitForm');
    const deliveryInput = document.getElementById('deliveryDaysLimit');
    const limitDisplay = document.getElementById('limitDisplay');

    if (deliveryInput && limitDisplay) {
        deliveryInput.addEventListener('input', () => {
            limitDisplay.textContent = deliveryInput.value;
        });
    }

    if (deliveryLimitForm) {
        deliveryLimitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLimit = parseInt(deliveryInput.value);

            try {
                const settingsPath = firebaseService.getDeliverySettingsPath();
                await firebaseService.setDocument(settingsPath, {
                    limitDays: newLimit
                });
                appState.set('deliveryDaysLimit', newLimit);
                showMessage(`Teslimat limit süresi ${newLimit} gün olarak güncellendi.`, 'success');
            } catch (error) {
                console.error('Delivery limit update error:', error);
                showMessage(`Hata: ${error.message}`, 'error');
            }
        });
    }
}
