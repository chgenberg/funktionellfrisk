# 🕷️ Hälsosajt Web Scraper

Detta verktyg skrapar detaljerad information från alla hälsosajter för att skapa kraftfullare jämförelser.

## 🚀 Snabbstart

### 1. Installera dependencies
```bash
pip install -r requirements.txt
```

### 2. Kör skrapningen
```bash
python scraper.py
```

### 3. Analysera data
```bash
python enhance_site_data.py
```

## 📊 Vad skrapas?

### Grundläggande info:
- ✅ Titel och meta-beskrivning
- ✅ Nyckelord
- ✅ Språk (svenska/engelska)
- ✅ Sajt-typ (e-handel, utbildning, innehåll, app)

### Affärsinformation:
- 💰 **Prisinformation** - Automatisk upptäckt av priser
- 🎓 **Kurser & utbildningar** - Hittar alla kurserbjudanden  
- 📞 **Kontaktuppgifter** - Email och telefonnummer
- 📱 **Sociala medier** - Facebook, Instagram, YouTube etc.

### Innehåll & kvalitet:
- 📰 **Senaste innehåll** - Blogginlägg och artiklar
- ⭐ **Testimonials** - Kundrecensioner
- 🏆 **Certifieringar** - Kvalifikationer och legitimationer
- 🔧 **Nyckelfunktioner** - Huvudsakliga fördelar

### Teknisk analys:
- ⚡ **Laddningstid** - Performance-mätning
- 📱 **Mobiloptimering** - Responsiv design
- 🔒 **SSL-säkerhet** - HTTPS-status
- 📈 **Sidstorlek** - Optimering-metrics

## 🎯 Värdetillägg för jämförelsesajten

### Före skrapning:
```
"Svenskt Kosttillskott - Ledande sport- & hälsokost e-handel"
```

### Efter skrapning:
```
"Svenskt Kosttillskott - Ledande sport- & hälsokost e-handel med 6000+ produkter. 
E-handelssajt med priser från 99 kr. Aktiv på Facebook, Instagram, YouTube. 
Snabb och responsiv sajt."
```

## 📈 Analysresultat

Skriptet genererar automatiskt:

### 🏆 Rankingar:
- **Snabbaste sajter** - Laddningstid
- **Mest sociala** - Antal plattformar
- **Mobiloptimerade** - Responsiv design

### 💡 Insikter:
- Prisintervall per kategori
- Populäraste kurstyper
- Teknisk kvalitet jämförelse

## 🔄 Integration med sajten

### Automatisk förbättring:
1. **Rikare beskrivningar** - Mer detaljerad information
2. **Smarta filter** - Filtrering på pris, kurstyp, etc.
3. **Kvalitetsindikator** - Hastighet, mobiloptimering
4. **Socialbevis** - Social media närvaro

### Nya funktioner möjliga:
- **Prisfilter** - "Visa bara gratis kurser"
- **Hastighetsranking** - "Snabbaste sajterna först"  
- **Socialpoäng** - "Mest följda på sociala medier"
- **Mobilfriendly badge** - "📱 Mobiloptimerad"

## ⚠️ Etiska riktlinjer

- ✅ 2 sekunders paus mellan requests
- ✅ Respekterar robots.txt  
- ✅ Använder human-like User-Agent
- ✅ Timeout på 10 sekunder
- ✅ Graceful error handling

## 📁 Utdatafiler

- `scraped_site_data.json` - Rå skrapad data
- `enhanced_descriptions.json` - Förbättrade beskrivningar
- `comparison_insights.txt` - Analysinsikter

## 🚀 Nästa steg

1. **Kör skrapningen** för att samla data
2. **Granska resultaten** i JSON-filerna  
3. **Integrera** förbättrade beskrivningar i `site-data.js`
4. **Lägg till nya funktioner** baserat på skrapad data

---

**💡 Tips:** Kör skrapningen veckovis för att hålla data uppdaterad! 