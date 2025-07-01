# International Health & Wellness Scraper

En omfattande skrapare för internationella hälso- och träningsföretag samt hälsopoddar.

## Vad skrapas

### 🏢 Hälso- och träningsföretag (100 st)
- **Stora hälso- och wellnessplattformar**: Noom, MyFitnessPal, Headspace, Calm, BetterHelp
- **Fitness- och träningsföretag**: Peloton, Beachbody, ClassPass, Nike Training, Adidas Training
- **Näring och dietföretag**: Weight Watchers, Nutrisystem, Precision Nutrition, Herbalife
- **Wellness och livscoaching**: Tony Robbins, Deepak Chopra, Mindvalley, Oprah
- **Hälsoteknologi**: 23andMe, Whoop, Oura, Fitbit, Garmin
- **Telemedicin**: Teladoc, Amwell, MDLive, Doctor on Demand
- **Meditation och mental hälsa**: Headspace, Calm, Ten Percent Happier
- **Företagswellness**: Virgin Pulse, Thrive Global, Limeade
- **Specialiserad hälsocoaching**: Parsley Health, Functional Medicine, Chris Kresser

### 🎧 Hälsopoddar (50 st)
**Svenska poddar (25 st):**
- Hälsa för livet, Hälsopodden, Kropp och Knopp
- Hälsocoachen, Naturlig hälsa, Mindfulnesspodden
- Träning och hälsa, Kost och hälsa, Funktionell medicin

**Engelska poddar (25 st):**
- Ben Greenfield Life, Huberman Lab, Found My Fitness
- The Model Health Show, Bulletproof Radio, Mind Pump
- The Living Experiment, Wellness Mama, Dr. Mark Hyman

## Installation

```bash
# Installera beroenden
pip install requests beautifulsoup4

# Kör skraparen
python international_scraper.py
```

## Vad extraheras

### 📊 Grundläggande data
- **Domän och URL**
- **Titel och beskrivning**
- **Meta-keywords**
- **Språk** (svenska/engelska)
- **Responstid och teknisk data**

### 🏷️ Kategorisering
- **FITNESS**: Träning, workout, gym
- **NUTRITION**: Näring, diet, mat, recept
- **COACHING**: Coaching, mentorskap, vägledning
- **MENTAL_HEALTH**: Meditation, mindfulness, terapi
- **SUPPLEMENTS**: Kosttillskott, vitaminer, protein
- **PODCAST**: Poddar, avsnitt, ljudinnehåll
- **APP**: Mobilappar, iOS, Android
- **TELEMEDICINE**: Telemedicin, virtuella konsultationer
- **WELLNESS**: Välmående, holistisk hälsa
- **WEIGHT_LOSS**: Viktminskning, dietplaner

### 📱 Sociala medier
Automatisk identifiering av:
- Facebook, Twitter/X, Instagram
- LinkedIn, YouTube, TikTok, Pinterest

### 💼 Affärsinformation
- **Tjänster och program**
- **Prisinformation** (där tillgänglig)
- **Kontaktuppgifter** (e-post, telefon)

### ⭐ Kvalitetspoäng (0-100)
Baserat på:
- Beskrivning finns (10p)
- Sociala medier (5p per plattform)
- SSL-säkerhet (10p)
- Snabb laddningstid (15p)
- Mobiloptimerad (10p)

## Utdataformat

### JSON-struktur
```json
{
  "domain": "example.com",
  "name": "Example Health Co",
  "description": "Leading health platform...",
  "categories": ["FITNESS", "COACHING"],
  "language": "en",
  "social_media": {
    "facebook": "https://facebook.com/example",
    "instagram": "https://instagram.com/example"
  },
  "services": ["Personal Training", "Nutrition Coaching"],
  "pricing_info": ["$29/month subscription"],
  "contact": {
    "email": "contact@example.com",
    "phone": "+1-555-0123"
  },
  "quality_score": 85,
  "response_time": 1.2,
  "has_ssl": true,
  "is_international": true
}
```

## Utdatafiler

### 📁 Genererade filer
- `international_scraped_data_YYYYMMDD_HHMMSS.json` - Alla framgångsrika skrapningar
- `international_failed_sites_YYYYMMDD_HHMMSS.json` - Misslyckade sajter med felkoder
- `international_scraping_summary.txt` - Sammanfattning med statistik

### 📈 Sammanfattningsrapport
- Totalt antal skrapade sajter
- Kategorifördelning
- Språkfördelning  
- Kvalitetsfördelning
- Topp 10 högst rankade sajter

## Avancerade funktioner

### 🛡️ Felhantering
- Timeout-hantering (15 sekunder)
- Anslutningsfel-återhämtning
- Automatisk progresssparning var 10:e sajt
- Detaljerad loggning av fel

### ⚡ Prestanda
- Slumpmässiga fördröjningar (1-3 sekunder)
- Session-återanvändning för snabbare requests
- Progressiv sparning för att undvika dataförlust

### 🎯 Intelligent kategorisering
Automatisk kategorisering baserat på:
- Sidtitlar och beskrivningar
- Meta-keywords
- Innehållsanalys

## Användningsexempel

```python
from international_scraper import InternationalHealthScraper

# Skapa skrapare
scraper = InternationalHealthScraper()

# Ladda sajter från fil
sites = scraper.load_sites_from_file('international_health_companies.txt')

# Skrapa alla sajter
results = scraper.scrape_all_sites(sites)

# Generera sammanfattning
summary = scraper.generate_summary()
print(summary)
```

## Tekniska krav

- **Python 3.7+**
- **requests** - HTTP-förfrågningar
- **beautifulsoup4** - HTML-parsing
- **Internetanslutning**

## Etiska riktlinjer

- Respekterar robots.txt när möjligt
- Använder rimliga fördröjningar mellan requests
- Samlar endast offentligt tillgänglig information
- Lagrar ingen personlig eller känslig data

## Framtida förbättringar

- [ ] Stöd för JavaScript-renderade sidor
- [ ] Automatisk språkdetektering
- [ ] Integrering med sociala medier-API:er
- [ ] Realtidsuppdateringar av data
- [ ] Export till CSV/Excel-format

## Support

För frågor eller problem, kontakta utvecklingsteamet eller skapa en issue i projektets repository. 