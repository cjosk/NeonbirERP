// Login Screen Component
export function renderLogin() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div class="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 fade-in">
                <div class="flex justify-center mb-6">
                    <img src="https://cdn.shopify.com/s/files/1/0834/5134/7241/files/logo_40df5a50-74e2-4ab0-aa7a-dfcc162ca5c5.png" 
                         alt="Neonbirr Logo" class="h-12">
                </div>
                <h2 class="text-xl font-semibold text-gray-800 mb-6 text-center">Franchisee Girişi</h2>

                <form id="loginForm" class="space-y-6">
                    <div>
                        <label for="loginEmail" class="block text-sm font-medium text-gray-700 mb-1">
                            E-Posta Adresi
                        </label>
                        <input type="email" id="loginEmail" required 
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr transition duration-150" 
                               placeholder="ornek@neonbirr.com">
                    </div>
                    <div>
                        <label for="loginPassword" class="block text-sm font-medium text-gray-700 mb-1">
                            Şifre
                        </label>
                        <input type="password" id="loginPassword" required 
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-neonbirr focus:border-neonbirr transition duration-150" 
                               placeholder="••••••••">
                    </div>
                    <button type="submit" 
                            class="w-full bg-neonbirr text-white p-3 rounded-lg font-semibold hover:bg-neonbirr-dark transition duration-200 shadow-md">
                        Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    `;
}
