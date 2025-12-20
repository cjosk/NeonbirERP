// Application Constants
export const ORDER_STATUSES = [
    'Çizilmeyi Bekleyenler',
    'Çizildi',
    'Üretime Alındı',
    'Üretimi Tamamlandı',
    'Kargo Aşamasında',
    'Gönderilen Ürünler',
    'Gecikti'
];

export const PRODUCT_TYPES = [
    'Aktif Ürünler',
    'Randevulu Ürünler',
    'Şeffaf Ürün',
    'Baskılı Ürün',
    'Canvas Neon',
    'Neon Masa',
    'Neon Ayna',
    'Toplu Siparişler',
    'Takım Dekoru'
];

export const CATEGORY_MAP = {
    'Canvas Neon': 'neon_standart',
    'Baskılı Ürün': 'baskili',
    'Şeffaf Ürün': 'seffaf',
    'Neon Masa': 'masa',
    'Neon Ayna': 'ayna',
    'Toplu Siparişler': 'toplu',
    'Takım Dekoru': 'takim_dekoru',
};

export const ACCESSORIES = [
    'Duvar Montaj Kiti',
    'Pil Kutusu',
    'Uzaktan Kumanda',
    'Zincir Montaj Kiti'
];

export const DELIVERY_OPTIONS = [
    { value: 'standard', label: 'Standart Teslimat' },
    { value: 'urgent', label: 'Acil Teslimat (Ek Ücretli)' },
    { value: 'pickup', label: 'Mağazadan Teslim' }
];

export const SORT_OPTIONS = [
    { value: 'date_desc', label: 'En Yeniler (Tarih Azalan)' },
    { value: 'date_asc', label: 'En Eskiler (Tarih Artan)' },
    { value: 'price_desc', label: 'En Pahalı (Fiyat Azalan)' },
    { value: 'price_asc', label: 'En Ucuz (Fiyat Artan)' },
    { value: 'name_asc', label: 'Müşteri Adı (A-Z)' },
    { value: 'name_desc', label: 'Müşteri Adı (Z-A)' }
];

// Status Color Mapping
export const STATUS_COLORS = {
    'Çizilmeyi Bekleyenler': 'bg-yellow-100 text-yellow-800',
    'Çizildi': 'bg-blue-100 text-blue-800',
    'Üretime Alındı': 'bg-indigo-100 text-indigo-800',
    'Üretimi Tamamlandı': 'bg-green-100 text-green-800',
    'Kargo Aşamasında': 'bg-purple-100 text-purple-800',
    'Gönderilen Ürünler': 'bg-gray-100 text-gray-800',
    'Gecikti': 'bg-red-500 text-white font-bold animate-pulse-red'
};

// Chart Colors
export const CHART_COLORS = {
    'Çizilmeyi Bekleyenler': '#FBBF24',
    'Çizildi': '#60A5FA',
    'Üretime Alındı': '#818CF8',
    'Üretimi Tamamlandı': '#34D399',
    'Kargo Aşamasında': '#C084FC',
    'Gönderilen Ürünler': '#9CA3AF',
    'Gecikti': '#EF4444'
};
