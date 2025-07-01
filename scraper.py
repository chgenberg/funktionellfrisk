#!/usr/bin/env python3
"""
Hälsosajt-skrapare för att samla in detaljerad information
"""
import requests
from bs4 import BeautifulSoup
import time
import json
from urllib.parse import urljoin, urlparse
import re
from typing import Dict, List, Optional

class HealthSiteScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
    def scrape_site_info(self, domain: str) -> Dict:
        """Skrapar detaljerad information från en hälsosajt"""
        url = f"https://{domain}"
        
        try:
            print(f"Skrapar {domain}...")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            info = {
                'domain': domain,
                'url': url,
                'title': self._get_title(soup),
                'meta_description': self._get_meta_description(soup),
                'keywords': self._get_keywords(soup),
                'pricing_info': self._find_pricing_info(soup),
                'course_offerings': self._find_course_offerings(soup),
                'contact_info': self._find_contact_info(soup),
                'social_media': self._find_social_media(soup),
                'recent_content': self._find_recent_content(soup),
                'features': self._find_key_features(soup),
                'testimonials': self._find_testimonials(soup),
                'certifications': self._find_certifications(soup),
                'languages': self._detect_languages(soup),
                'site_type': self._classify_site_type(soup),
                'technical_info': self._get_technical_info(response, soup)
            }
            
            # Respektera servern med en paus
            time.sleep(2)
            return info
            
        except Exception as e:
            print(f"Fel vid skrapning av {domain}: {str(e)}")
            return {'domain': domain, 'error': str(e)}
    
    def _get_title(self, soup: BeautifulSoup) -> str:
        """Hämtar sidans titel"""
        title_tag = soup.find('title')
        return title_tag.text.strip() if title_tag else ""
    
    def _get_meta_description(self, soup: BeautifulSoup) -> str:
        """Hämtar meta-beskrivning"""
        meta_desc = soup.find('meta', {'name': 'description'})
        return meta_desc.get('content', '').strip() if meta_desc else ""
    
    def _get_keywords(self, soup: BeautifulSoup) -> List[str]:
        """Hämtar nyckelord från meta-taggar"""
        keywords_tag = soup.find('meta', {'name': 'keywords'})
        if keywords_tag:
            return [kw.strip() for kw in keywords_tag.get('content', '').split(',')]
        return []
    
    def _find_pricing_info(self, soup: BeautifulSoup) -> List[str]:
        """Letar efter prisinformation"""
        pricing_keywords = ['kr', 'sek', '€', '$', 'pris', 'kostnad', 'avgift', 'gratis', 'från', 'kostar']
        pricing_info = []
        
        # Leta efter priser i text
        for text in soup.find_all(string=True):
            if any(keyword in text.lower() for keyword in pricing_keywords):
                # Hitta numeriska värden med valuta
                price_matches = re.findall(r'(\d+(?:\s*\d+)*)\s*(kr|sek|€|\$)', text, re.IGNORECASE)
                for match in price_matches:
                    pricing_info.append(f"{match[0]} {match[1]}")
        
        return list(set(pricing_info))[:5]  # Max 5 unika priser
    
    def _find_course_offerings(self, soup: BeautifulSoup) -> List[str]:
        """Letar efter kurser och utbildningar"""
        course_keywords = ['kurs', 'utbildning', 'program', 'coaching', 'träning', 'workshop', 'webinar']
        courses = []
        
        # Leta i rubriker och länkar
        for element in soup.find_all(['h1', 'h2', 'h3', 'a']):
            text = element.get_text().strip()
            if any(keyword in text.lower() for keyword in course_keywords) and len(text) < 100:
                courses.append(text)
        
        return list(set(courses))[:10]  # Max 10 kurser
    
    def _find_contact_info(self, soup: BeautifulSoup) -> Dict:
        """Letar efter kontaktinformation"""
        contact = {}
        
        # Leta efter email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, str(soup))
        if emails:
            contact['email'] = emails[0]
        
        # Leta efter telefonnummer
        phone_pattern = r'(\+46|0)\s*\d{1,3}\s*\d{3}\s*\d{2}\s*\d{2}'
        phones = re.findall(phone_pattern, str(soup))
        if phones:
            contact['phone'] = phones[0]
        
        return contact
    
    def _find_social_media(self, soup: BeautifulSoup) -> Dict:
        """Letar efter sociala medier-länkar"""
        social_media = {}
        social_platforms = {
            'facebook': 'facebook.com',
            'instagram': 'instagram.com',
            'twitter': 'twitter.com',
            'youtube': 'youtube.com',
            'linkedin': 'linkedin.com'
        }
        
        for platform, domain in social_platforms.items():
            links = soup.find_all('a', href=lambda x: x and domain in x)
            if links:
                social_media[platform] = links[0]['href']
        
        return social_media
    
    def _find_recent_content(self, soup: BeautifulSoup) -> List[str]:
        """Letar efter recent innehåll/blogginlägg"""
        content = []
        
        # Leta efter blogginlägg, artiklar
        for element in soup.find_all(['article', 'div'], class_=re.compile(r'post|article|blog|news')):
            title_elem = element.find(['h1', 'h2', 'h3', 'h4'])
            if title_elem:
                title = title_elem.get_text().strip()
                if len(title) > 10 and len(title) < 100:
                    content.append(title)
        
        return content[:5]  # Max 5 inlägg
    
    def _find_key_features(self, soup: BeautifulSoup) -> List[str]:
        """Letar efter nyckelfunktioner"""
        feature_keywords = ['funktion', 'fördel', 'benefit', 'feature', 'specialitet', 'expertis']
        features = []
        
        # Leta i listor och rubriker
        for element in soup.find_all(['li', 'h3', 'h4']):
            text = element.get_text().strip()
            if len(text) > 5 and len(text) < 80:
                features.append(text)
        
        return features[:8]  # Max 8 funktioner
    
    def _find_testimonials(self, soup: BeautifulSoup) -> List[str]:
        """Letar efter kundrecensioner/testimonials"""
        testimonials = []
        
        # Leta efter testimonial-element
        for element in soup.find_all(['div', 'blockquote'], class_=re.compile(r'testimonial|review|quote')):
            text = element.get_text().strip()
            if len(text) > 20 and len(text) < 200:
                testimonials.append(text)
        
        return testimonials[:3]  # Max 3 testimonials
    
    def _find_certifications(self, soup: BeautifulSoup) -> List[str]:
        """Letar efter certifieringar och kvalifikationer"""
        cert_keywords = ['certifierad', 'diplomerad', 'kvalificerad', 'auktoriserad', 'legitimerad']
        certifications = []
        
        text_content = soup.get_text().lower()
        for keyword in cert_keywords:
            if keyword in text_content:
                # Leta efter kontext runt nyckelordet
                sentences = re.split(r'[.!?]', text_content)
                for sentence in sentences:
                    if keyword in sentence and len(sentence) < 200:
                        certifications.append(sentence.strip())
        
        return certifications[:5]  # Max 5 certifieringar
    
    def _detect_languages(self, soup: BeautifulSoup) -> List[str]:
        """Upptäcker språk på sajten"""
        languages = []
        
        # Kolla html lang attribut
        html_tag = soup.find('html')
        if html_tag and html_tag.get('lang'):
            languages.append(html_tag['lang'])
        
        # Leta efter språkväxlare
        for element in soup.find_all(['a', 'button'], string=re.compile(r'english|svenska|english|deutsch')):
            lang_text = element.get_text().strip().lower()
            if 'english' in lang_text and 'english' not in languages:
                languages.append('english')
            elif 'svenska' in lang_text and 'svenska' not in languages:
                languages.append('svenska')
        
        return languages if languages else ['svenska']  # Default svenska
    
    def _classify_site_type(self, soup: BeautifulSoup) -> str:
        """Klassificerar typ av sajt"""
        text_content = soup.get_text().lower()
        
        if any(word in text_content for word in ['webshop', 'köp', 'handla', 'varukorg']):
            return 'e-commerce'
        elif any(word in text_content for word in ['kurs', 'utbildning', 'coaching']):
            return 'education'
        elif any(word in text_content for word in ['blogg', 'artikel', 'inlägg']):
            return 'content'
        elif any(word in text_content for word in ['app', 'download', 'mobil']):
            return 'app'
        else:
            return 'informational'
    
    def _get_technical_info(self, response: requests.Response, soup: BeautifulSoup) -> Dict:
        """Hämtar teknisk information"""
        return {
            'response_time': response.elapsed.total_seconds(),
            'status_code': response.status_code,
            'has_mobile_meta': bool(soup.find('meta', {'name': 'viewport'})),
            'has_ssl': response.url.startswith('https://'),
            'page_size': len(response.content),
            'num_images': len(soup.find_all('img')),
            'num_links': len(soup.find_all('a'))
        }

def main():
    """Huvudfunktion för att skrapa alla sajter"""
    scraper = HealthSiteScraper()
    
    # KOMPLETTA LISTAN - Alla domäner från hemsidor.txt + poddar
    domains = [
        # Top recommendations (redan skrapade)
        'ulrikadavidsson.se',
        'functionalfoods.se',
        
        # E-handel & Apotek (redan skrapade)
        'apotea.se',
        'svensktkosttillskott.se',
        'svenskhalsokost.se',
        'lifebutiken.se',
        'bodystore.com',
        'rawfoodshop.se',
        'gymgrossisten.com',
        'holistic.se',
        'greatlife.se',
        'hälsokraft.se',
        'reneevoltaire.se',
        'foodpharmacy.se',
        'yogobe.com',
        'actic.se',
        'dietdoctor.com',
        'lifesum.com',
        'nutri.se',
        
        # Hälsopoddar (redan skrapade)
        'halsorevolutionen.se',
        'lofsan.se',
        'sverigesradio.se',
        'kristinkaspersen.se',
        'tyngre.se',
        'smartarefitness.se',
        'umara.se',
        'petra.se',
        '4health.se',
        'lagomkondition.se',
        'mindfulness.se',
        'klimakteriet.se',
        'halsa.se',
        'crossfit.se',
        'paceonearth.se',
        'gynpodden.se',
        'strengthlog.com',
        'lesscarbs.se',
        
        # NYA SAJTER från hemsidor.txt (inte skrapade ännu)
        'happyfoodstore.se',
        'kurera.se',
        'naturligtsnygg.se',
        'matdagboken.se',
        'karinhaglund.se',
        'ptfia.se',
        'lofsans.se',  # Notera: olika från lofsan.se
        'teresealven.se',
        'paleoteket.se',
        'medvetenandning.se',
        'mindfulnesscenter.se',
        'funmed.se',
        'ehdin.com',
        'martinajohansson.se',
        'coach4lifesweden.se',
        'holisticjonna.se',
        'holistichealthacademy.se',
        'halsocoachgruppen.se',
        'halsocoachonline.vgregion.se',
        'axelsons.se',
        'mabra.se',
        'topphalsa.se',
        'sporthalsa.se',
        '56kilo.se',
        'cleanlifestyle.se',
        'traning40plus.se',
        'underbaraclara.se',
        'nillaskitchen.com',
        'mindfully.se',
        'mediteramera.se',
        'lugnochglad.se',
        'fadittbasta.se',
        'damernasvarld.se',
        'holisticsweden.com',
        'nordicwellth.com',
        'wellnesscoach.live',
        'junomedical.net',
        'stresscoachen.se',
        'vetenskapochhalsa.se',
        '1177.se',
        'viktklubb.se',
        'fastic.se',
        'apoteket.se',
        'mindshift.se',
        'sundkurs.se',
        'drdiamantis.com',
        'superfruit.com'
    ]
    
    scraped_data = []
    
    for domain in domains:
        site_info = scraper.scrape_site_info(domain)
        scraped_data.append(site_info)
        print(f"✅ Skrapade {domain}")
    
    # Spara resultatet
    with open('scraped_site_data.json', 'w', encoding='utf-8') as f:
        json.dump(scraped_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n🎉 Skrapning klar! {len(scraped_data)} sajter skrapade.")
    print("Data sparad i 'scraped_site_data.json'")

if __name__ == "__main__":
    main() 