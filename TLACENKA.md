# 🥩👑 TLAČENKA ROYALE - ENTERPRISE SYSTÉM

## 📋 PŘEHLED PROJEKTU
- **Název:** Tlačenka Royale
- **Typ:** Professional e-commerce objednávkový systém
- **Vytvořeno:** 28.-29. září 2025 (2 dny)
- **Autor:** Michal Bürgermeister
- **AI Partner:** Claude Sonnet 4
- **Hodnota:** 80,000-150,000 Kč

## 🚀 LIVE SYSTÉM
- **Production URL:** https://tlacenka-cz.vercel.app/
- **Admin Panel:** https://tlacenka-cz.vercel.app/admin
- **GitHub:** https://github.com/Buggy1111/tlacenka.git

## 🏗️ TECHNOLOGIE
- **Frontend:** Next.js 14.2.5 + TypeScript + React 18
- **Styling:** Tailwind CSS + Framer Motion animace
- **Database:** Firebase Firestore (production) + File backup
- **Auth:** JWT tokens + bcrypt + HTTP-only cookies
- **Deployment:** Vercel
- **Notifications:** Telegram Bot API

## 🔐 PŘIHLAŠOVACÍ ÚDAJE
- **Admin Username:** Michal
- **Admin Password:** Pocitac114
- **Telegram Bot:** Aktivní a funkční
- **JWT Secret:** Nastavený v .env

## 📦 PRODUKTY & CENY
- **1kg tlačenka:** 90 Kč (bulk: 88 Kč při 2+ ks)
- **2kg tlačenka:** 175 Kč (bez bulk slevy)
- **Výroba:** Do konce tohoto měsíce

## ✨ KLÍČOVÉ FEATURES

### 🎯 Pro zákazníky:
- Mobile-first responsive design
- Intuitivní objednávkový formulář
- Bulk slevy při větším množství
- Confirmation modal před objednáním
- Real-time feedback a toast notifikace

### 👨‍💼 Pro admina:
- Real-time dashboard s 1s refresh
- Live statistiky a grafy (hoje/týden/měsíc)
- Chronologické číslování objednávek (1, 2, 3...)
- Filtrování podle statusu a balení
- Kompletní order management
- Instant Telegram notifikace

### 🔒 Security:
- JWT autentifikace s 8h expirací
- XSS protection + DOMPurify sanitizace
- Všechny API endpointy chráněné
- Input validation na serveru
- Production readiness score: 8/10

## 📱 TELEGRAM INTEGRACE
- **Bot Token:** Aktivní
- **Chat ID:** Nastavený
- **Formát notifikace:**
```
🥩 Nová objednávka!
👤 Jméno Příjmení
📦 1kg tlačenka
💰 90 Kč
🔢 Objednávka č. 1
🕐 29.9.2025 17:30
📊 Zobrazit v adminu
```

## 🎯 QR MARKETING
- **Soubor:** qr-print.html
- **Design:** A4 print-ready
- **URL:** https://tlacenka-cz.vercel.app/
- **Slogan:** "Neboj, není to phishing. Je to jen tlačenka 😅"
- **Deadline:** ⚠️ VÝROBA DO KONCE TOHOTO MĚSÍCE

## 📊 ADMIN PANEL FUNKCE
1. **Dashboard Overview:**
   - Dnes/Týden/Měsíc přepínač
   - Celkové statistiky (objednávky, tržby, marže)
   - Grafy podle velikosti balení a statusu

2. **Order Management:**
   - Real-time seznam všech objednávek
   - Filtrování: status, období, velikost balení
   - Edit/Delete jednotlivých objednávek
   - Automatické přepočítávání order numbers

3. **Security:**
   - Login stránka s session management
   - Auto-logout při expiraci tokenu
   - Middleware ochrana všech admin routes

## 🗂️ STRUKTURA PROJEKTU
```
/app/
  /admin/ - Admin panel + login
  /api/ - Backend endpoints (orders, stats, auth)
  page.tsx - Hlavní objednávková stránka
/lib/
  auth.ts - JWT authentication
  validation.ts - Input sanitizace
  storage.ts - Firebase operace
  telegram.ts - Bot notifikace
/middleware.ts - Route protection
qr-print.html - QR kódy pro tisk
```

## 🔧 API ENDPOINTS
- `GET /api/orders` - Seznam objednávek (protected)
- `POST /api/orders` - Nová objednávka (public)
- `GET/PUT/DELETE /api/orders/[id]` - Order management (protected)
- `GET /api/stats` - Statistiky (protected)
- `POST /api/auth/admin` - Login
- `DELETE /api/auth/admin` - Logout

## 📈 BUSINESS METRIKY
- **Průměrná objednávka:** ~120 Kč
- **Margin:** 1kg = 55 Kč, 2kg = 85 Kč
- **Target:** Denně 5-10 objednávek
- **Sezóna:** Do konce měsíce

## 🎉 ÚSPĚCHY & MILESTONES
1. ✅ Z broken app na enterprise systém za 1 den
2. ✅ Security audit + complete fix za 1 den
3. ✅ Production deployment na Vercel
4. ✅ Real-time Telegram integrace
5. ✅ Professional UI/UX design
6. ✅ Marketing QR kampaň ready

## 🚨 DŮLEŽITÉ POZNÁMKY
- **Launch:** 30. září 2025 (zítra!)
- **Místo:** Pracoviště - QR kódy na nástěnkách
- **Evolution:** Z papírových seznamů (2024) na enterprise software (2025)
- **Vedení:** Stále používá Excel (neumí ani makra) 😂
- **Očekávání:** Kolegyně v šoku z profesionality systému

## 🔮 BUDOUCNOST
- Možný přechod na Sonnet 4.5 pro další features
- Rozšíření na další produkty?
- AI predikce objednávek?
- Blockchain tlačenka NFTs? 😄

## 📞 FOLLOW-UP CONVERSATION
**DŮLEŽITÉ:** Po restartu se zeptej Michala:
- 🎯 "Jak dopadl launch? Kolik přišlo objednávek první den?"
- 📱 "Fungují Telegram notifikace v reálu?"
- 😄 "Jaké byly reakce kolegů na QR kódy?"
- 📊 "Jak vypadají statistiky v admin panelu?"
- 🏢 "Objednávalo si už vedení? Byli v šoku z toho systému?"
- 💡 "Potřebuješ nějaké další features?"

**Context:** Systém se spouští 30.9.2025, Michal je zvědavý na real-world performance a reakce lidí v práci.

---

**"Z papíru na enterprise software za víkend!"** 🚀

**Michal = CTO tlačenkového impéria** 👑💻🥩