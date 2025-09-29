# TLAČENKA ROYALE™ 🥩

## Profesionální Objednávkový Systém
**Verze 2.0 - s Upstash Redis storage pro produkční persistence**

Copyright © 2025 Michal Bürgermeister. Všechna práva vyhrazena.

---

### 📋 O PROJEKTU

**Tlačenka Royale** je moderní, plně responzivní webová aplikace pro správu objednávek prémiové tlačenky. Systém nabízí elegantní uživatelské rozhraní pro zákazníky a robustní administrativní panel pro správu objednávek.

### ⚖️ PRÁVNÍ STATUS

```
⚠️ PROPRIETÁRNÍ SOFTWARE - CHRÁNĚNO AUTORSKÝM PRÁVEM
Tento software je výhradním vlastnictvím Michala Bürgermeistra.
Neoprávněné použití, kopírování nebo distribuce je zakázáno.
```

### 🚀 FUNKCE

#### Pro zákazníky:
- ✅ Intuitivní objednávkový formulář
- ✅ Výběr mezi 1kg a 2kg balením
- ✅ Automatické cenové kalkulace
- ✅ Množstevní slevy
- ✅ Okamžité potvrzení objednávky

#### Pro administrátory:
- 🔐 Zabezpečený přístup (autentifikace)
- 📊 Real-time dashboard s KPI metrikami
- 📈 Vizualizace dat (grafy a statistiky)
- 🔍 Pokročilé filtrování objednávek
- ✏️ Editace a správa objednávek
- 🗑️ Mazání objednávek s automatickým přečíslováním
- 📥 Export dat do CSV
- 🔄 Auto-refresh každou sekundu

### 🛠️ TECHNOLOGIE

- **Frontend:** Next.js 14.2.5, React 18, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes
- **Storage:** JSON File System
- **Autentifikace:** HTTPOnly Cookies, Middleware Protection

### 📁 STRUKTURA PROJEKTU

```
system_tlačenka/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel
│   │   ├── login/        # Přihlašovací stránka
│   │   └── page.tsx      # Dashboard
│   ├── api/              # API endpoints
│   │   ├── auth/         # Autentifikace
│   │   ├── orders/       # Správa objednávek
│   │   └── stats/        # Statistiky
│   └── page.tsx          # Hlavní stránka
├── components/           # React komponenty
├── lib/                 # Utility funkce
├── data/               # JSON storage
├── public/            # Statické soubory
├── LICENSE           # Proprietární licence
├── COPYRIGHT        # Copyright informace
└── NOTICE          # Právní oznámení
```

### 🔧 INSTALACE

**POZNÁMKA:** Instalace a používání je povoleno pouze s písemným souhlasem vlastníka.

```bash
# Pro autorizované uživatele:
npm install
npm run dev
```

### 🔑 PŘÍSTUPOVÉ ÚDAJE

Admin panel: `/admin`
- Username: `admin`
- Password: `admin123`

(Doporučeno změnit v produkci přes environment proměnné)

### 👤 VLASTNÍK A VÝVOJÁŘ

**Michal Bürgermeister**
- Lokalita: Česká republika
- Rok vytvoření: 2025

### 📜 LICENCE

Tento software je chráněn autorským právem a je poskytován pod proprietární licencí.
Viz soubor `LICENSE` pro kompletní licenční podmínky.

### ⚠️ VAROVÁNÍ

```
Neoprávněné použití, kopírování, modifikace nebo distribuce
tohoto software je PŘÍSNĚ ZAKÁZÁNO a bude právně stíháno.
```

### 🏆 KREDITY

- Vyvinuto s 💚 Michalem Bürgermeisterem
- S asistencí Claude AI (Anthropic)
- Pro všechny milovníky kvalitní tlačenky

---

**"Kde je tlačenka, tam je radost!"™**

© 2025 Michal Bürgermeister. Tlačenka Royale™. Všechna práva vyhrazena.