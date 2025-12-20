# 🚀 Vercel'e Deploy Etme Rehberi

## Hızlı Başlangıç (3 Adım)

### 1️⃣ Vercel Hesabı Oluştur
1. [https://vercel.com](https://vercel.com) adresine git
2. GitHub hesabınla giriş yap (önerilen) veya email ile kayıt ol

### 2️⃣ Projeyi Deploy Et

**Seçenek A: Vercel Dashboard'dan (Kolay)**
1. Vercel Dashboard'a git: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. "Add New..." → "Project" tıkla
3. "Import Git Repository" seç
4. Bu projeyi GitHub'a yükle ve oradan seç
   VEYA
5. "Browse" ile bu klasörü seç

**Seçenek B: Vercel CLI (Hızlı)**
```bash
# Vercel CLI'yi yükle (bir kez)
npm install -g vercel

# Proje klasörüne git
cd c:\Users\MrAkk\Franchisee

# Deploy et
vercel

# Production'a deploy et
vercel --prod
```

### 3️⃣ Deploy Sonrası Ayarlar

Deploy tamamlandıktan sonra Vercel size bir URL verecek:
```
https://your-project-name.vercel.app
```

## 🔧 Firebase CORS Ayarları

CORS sorununu tamamen çözmek için:

### Firebase Console'da CORS Ayarları:

1. [Firebase Console](https://console.firebase.google.com/) → Projeniz
2. **Storage** → **Rules** sekmesi
3. Şu kuralı ekleyin:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Veya Google Cloud Console'dan CORS ayarlarını düzenleyin:
```bash
# cors.json dosyası oluştur:
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]

# Google Cloud SDK ile uygula:
gsutil cors set cors.json gs://neonbirfranchisee.appspot.com
```

## 📝 Vercel Deployment Checklist

- [x] `vercel.json` dosyası oluşturuldu
- [x] `.vercelignore` dosyası oluşturuldu
- [x] Firebase Storage upload hata yönetimi eklendi
- [ ] Firebase Security Rules kontrol edin
- [ ] Production URL'i Firebase Auth'a ekleyin

### Firebase Auth'a Production URL Ekleme:

1. Firebase Console → Authentication → Settings
2. "Authorized domains" bölümüne Vercel URL'inizi ekleyin:
   ```
   your-project-name.vercel.app
   ```

## 🎯 Deploy Komutları

```bash
# İlk deploy (test environment)
vercel

# Production deploy
vercel --prod

# Belirli bir branch'i deploy et
vercel --prod --name my-production-app

# Environment variables ekle
vercel env add FIREBASE_API_KEY production
```

## 🐛 Sorun Giderme

### CORS Hatası Devam Ediyorsa:

1. **Firebase Storage Rules'u Kontrol Et**
   ```
   allow read, write: if request.auth != null;
   ```

2. **Tarayıcı Cache'ini Temizle**
   - Ctrl+Shift+Delete → Tüm cache'i temizle

3. **Firebase SDK Güncel mi Kontrol Et**
   - `index.html`'de Firebase SDK versiyonu: `10.12.2`

4. **Production URL'i Authorized Domains'e Ekle**
   - Firebase Console → Authentication → Settings

### Vercel Build Hatası:

1. **Dosya yollarını kontrol et**
   - Tüm path'ler küçük harfle olmalı
   - Windows `\` yerine Unix `/` kullan

2. **index.html konumunu doğrula**
   - Root dizinde olmalı
   - `public` klasöründe OLMAMALI

## 📊 Deploy Sonrası Kontrol

1. **URL'e gidin ve test edin:**
   ```
   https://your-app.vercel.app
   ```

2. **Console'da hata var mı kontrol edin:**
   - F12 → Console
   - Network hatalarını kontrol et

3. **Firebase bağlantısını test edin:**
   - Login yapmayı deneyin
   - Sipariş eklemeyi test edin

## 🔒 Güvenlik Notları

### Production için Önemli:

1. **Firebase API Key'leri Gizle** (Opsiyonel):
   - Şu anda `firebase-service.js`'de hardcoded
   - Production'da environment variables kullanabilirsiniz:
   
   ```javascript
   // vercel.json veya Vercel Dashboard'dan environment variable ekle
   const firebaseConfig = {
       apiKey: process.env.FIREBASE_API_KEY,
       // ...diğer ayarlar
   };
   ```

2. **Firebase Security Rules'u Sıkılaştır**:
   ```javascript
   // Sadece authenticated kullanıcılar
   allow read, write: if request.auth != null 
       && request.auth.uid == resource.data.franchiseeId;
   ```

## 📱 Custom Domain Ekleme (Opsiyonel)

Vercel Dashboard'dan:
1. Settings → Domains
2. "Add Domain" tıkla
3. Domain'inizi girin (örn: `erp.neonbirr.com`)
4. DNS kayıtlarını güncelleyin

## ✅ Deploy Tamamlandı!

Artık sisteminiz Vercel'de canlı! 🎉

**Önemli Linkler:**
- Vercel Dashboard: [https://vercel.com/dashboard](https://vercel.com/dashboard)
- Firebase Console: [https://console.firebase.google.com](https://console.firebase.google.com)
- Deployment Logs: Vercel Dashboard → Deployments tab

---

**Sorun mu yaşıyorsunuz?**
- Vercel Status: [https://www.vercel-status.com/](https://www.vercel-status.com/)
- Firebase Status: [https://status.firebase.google.com/](https://status.firebase.google.com/)
