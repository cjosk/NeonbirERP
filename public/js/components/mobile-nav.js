import appState from '../utils/state.js';

// Mobile Navigation Component
export function renderMobileNav() {
    const currentPage = appState.get('currentPage');
    const currentRole = appState.get('currentRole');
    const currentStatusFilter = appState.get('currentStatusFilter');

    return `
        <div id="mobile-nav" class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-2xl md:hidden flex justify-around items-center z-40">
            <button class="mobile-nav-item flex flex-col items-center p-2 text-gray-700 ${currentPage === 'dashboard' ? 'text-neonbirr' : ''}" 
                    onclick="window.app.navigateTo('dashboard'); return false;">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l-2-2m2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span class="text-xs">Anasayfa</span>
            </button>

            <button class="mobile-nav-item flex flex-col items-center p-2 text-gray-700 ${currentPage === 'orders' && currentStatusFilter !== 'Gecikti' ? 'text-neonbirr' : ''}" 
                    onclick="window.app.navigateTo('orders'); return false;">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5h6"></path>
                </svg>
                <span class="text-xs">Siparişler</span>
            </button>

            <button class="mobile-nav-item flex items-center justify-center bg-neonbirr text-white rounded-full h-12 w-12 shadow-lg hover:bg-neonbirr-dark transition duration-150" 
                    onclick="window.app.navigateTo('add_order'); return false;">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
            </button>

            <button class="mobile-nav-item flex flex-col items-center p-2 text-gray-700 ${currentStatusFilter === 'Gecikti' && currentPage === 'orders' ? 'text-red-500' : ''}" 
                    onclick="window.app.setStatusFilter('Gecikti'); return false;">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.382 17c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span class="text-xs">Gecikenler</span>
            </button>

            ${currentRole === 'admin' ? `
                <button class="mobile-nav-item flex flex-col items-center p-2 text-gray-700 ${currentPage === 'finance_reports' ? 'text-neonbirr' : ''}" 
                        onclick="window.app.navigateTo('finance_reports'); return false;">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-xs">Finans</span>
                </button>
            ` : `
                <button class="mobile-nav-item flex flex-col items-center p-2 text-gray-700 ${currentPage === 'admin' ? 'text-neonbirr' : ''}" 
                        onclick="window.app.navigateTo('admin'); return false;">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="text-xs">Profil</span>
                </button>
            `}
        </div>
    `;
}
