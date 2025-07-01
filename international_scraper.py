#!/usr/bin/env python3
"""
International Health & Wellness Scraper
Scrapes data from international health companies and podcasts
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import random
from urllib.parse import urljoin, urlparse
import re
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class InternationalHealthScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        self.results = []
        self.failed_sites = []
        
    def load_sites_from_file(self, filename):
        """Load sites from text file"""
        sites = []
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '.' in line:
                        # Extract domain from line
                        domain = line.split()[0] if ' ' in line else line
                        if not domain.startswith('http'):
                            domain = f"https://{domain}"
                        sites.append(domain)
        except FileNotFoundError:
            logger.error(f"File {filename} not found")
        return sites
    
    def extract_meta_info(self, soup, url):
        """Extract meta information from soup"""
        info = {}
        
        # Title
        title_tag = soup.find('title')
        info['title'] = title_tag.get_text().strip() if title_tag else ''
        
        # Meta description
        desc_tag = soup.find('meta', attrs={'name': 'description'})
        if not desc_tag:
            desc_tag = soup.find('meta', attrs={'property': 'og:description'})
        info['description'] = desc_tag.get('content', '').strip() if desc_tag else ''
        
        # Meta keywords
        keywords_tag = soup.find('meta', attrs={'name': 'keywords'})
        info['keywords'] = keywords_tag.get('content', '').strip() if keywords_tag else ''
        
        # Language
        html_tag = soup.find('html')
        info['language'] = html_tag.get('lang', 'en') if html_tag else 'en'
        
        # Social media links
        social_links = {}
        social_patterns = {
            'facebook': r'facebook\.com/[^/\s"\']+',
            'twitter': r'twitter\.com/[^/\s"\']+',
            'instagram': r'instagram\.com/[^/\s"\']+',
            'linkedin': r'linkedin\.com/[^/\s"\']+',
            'youtube': r'youtube\.com/[^/\s"\']+',
            'tiktok': r'tiktok\.com/[^/\s"\']+',
            'pinterest': r'pinterest\.com/[^/\s"\']+',
        }
        
        page_text = str(soup).lower()
        for platform, pattern in social_patterns.items():
            matches = re.findall(pattern, page_text)
            if matches:
                social_links[platform] = f"https://{matches[0]}"
        
        info['social_media'] = social_links
        
        return info
    
    def extract_business_info(self, soup, url):
        """Extract business-specific information"""
        info = {}
        
        # Look for pricing information
        pricing_keywords = ['price', 'pricing', 'cost', 'fee', 'subscription', 'plan', '$', '€', '£']
        pricing_text = []
        
        for keyword in pricing_keywords:
            elements = soup.find_all(text=re.compile(keyword, re.IGNORECASE))
            for element in elements[:3]:  # Limit to avoid too much text
                parent = element.parent if element.parent else element
                text = parent.get_text().strip()[:200]  # Limit text length
                if text and text not in pricing_text:
                    pricing_text.append(text)
        
        info['pricing_info'] = pricing_text[:5]  # Max 5 pricing snippets
        
        # Look for services/offerings
        service_keywords = ['service', 'program', 'course', 'coaching', 'training', 'consultation']
        services = []
        
        for keyword in service_keywords:
            elements = soup.find_all(['h1', 'h2', 'h3', 'h4'], text=re.compile(keyword, re.IGNORECASE))
            for element in elements[:5]:
                text = element.get_text().strip()
                if text and len(text) < 100:
                    services.append(text)
        
        info['services'] = list(set(services))  # Remove duplicates
        
        # Look for contact information
        contact_info = {}
        
        # Email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, str(soup))
        if emails:
            contact_info['email'] = emails[0]
        
        # Phone
        phone_pattern = r'[\+]?[1-9]?[\d\s\-\(\)]{10,}'
        phones = re.findall(phone_pattern, soup.get_text())
        clean_phones = [p for p in phones if len(re.sub(r'[\s\-\(\)]', '', p)) >= 10]
        if clean_phones:
            contact_info['phone'] = clean_phones[0]
        
        info['contact'] = contact_info
        
        return info
    
    def categorize_site(self, title, description, keywords, url):
        """Categorize the site based on content"""
        content = f"{title} {description} {keywords}".lower()
        
        categories = []
        
        # Health & Wellness categories
        if any(word in content for word in ['fitness', 'workout', 'exercise', 'training', 'gym']):
            categories.append('FITNESS')
        
        if any(word in content for word in ['nutrition', 'diet', 'food', 'meal', 'recipe']):
            categories.append('NUTRITION')
        
        if any(word in content for word in ['coach', 'coaching', 'mentor', 'guidance']):
            categories.append('COACHING')
        
        if any(word in content for word in ['meditation', 'mindfulness', 'mental health', 'therapy']):
            categories.append('MENTAL_HEALTH')
        
        if any(word in content for word in ['supplement', 'vitamin', 'mineral', 'protein']):
            categories.append('SUPPLEMENTS')
        
        if any(word in content for word in ['podcast', 'show', 'episode', 'listen']):
            categories.append('PODCAST')
        
        if any(word in content for word in ['app', 'mobile', 'download', 'ios', 'android']):
            categories.append('APP')
        
        if any(word in content for word in ['telemedicine', 'telehealth', 'online consultation', 'virtual']):
            categories.append('TELEMEDICINE')
        
        if any(word in content for word in ['wellness', 'wellbeing', 'holistic', 'lifestyle']):
            categories.append('WELLNESS')
        
        if any(word in content for word in ['weight loss', 'lose weight', 'diet plan', 'weight management']):
            categories.append('WEIGHT_LOSS')
        
        return categories if categories else ['HEALTH']
    
    def scrape_site(self, url):
        """Scrape a single site"""
        try:
            domain = urlparse(url).netloc.replace('www.', '')
            logger.info(f"Scraping {domain}...")
            
            # Add random delay
            time.sleep(random.uniform(1, 3))
            
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract basic info
            meta_info = self.extract_meta_info(soup, url)
            business_info = self.extract_business_info(soup, url)
            
            # Create site data
            site_data = {
                'domain': domain,
                'url': url,
                'name': meta_info['title'].split('|')[0].split('-')[0].strip() or domain,
                'title': meta_info['title'],
                'description': meta_info['description'],
                'keywords': meta_info['keywords'],
                'language': meta_info['language'],
                'social_media': meta_info['social_media'],
                'services': business_info['services'],
                'pricing_info': business_info['pricing_info'],
                'contact': business_info['contact'],
                'response_time': response.elapsed.total_seconds(),
                'status_code': response.status_code,
                'has_ssl': url.startswith('https://'),
                'scraped_at': datetime.now().isoformat(),
                'content_length': len(response.content),
                'has_mobile_meta': bool(soup.find('meta', attrs={'name': 'viewport'})),
            }
            
            # Categorize
            site_data['categories'] = self.categorize_site(
                meta_info['title'], 
                meta_info['description'], 
                meta_info['keywords'], 
                url
            )
            
            # Determine if it's international
            site_data['is_international'] = meta_info['language'] == 'en' or any(
                tld in domain for tld in ['.com', '.org', '.net', '.io']
            )
            
            # Quality score calculation
            quality_score = 50  # Base score
            
            if site_data['description']:
                quality_score += 10
            if site_data['social_media']:
                quality_score += len(site_data['social_media']) * 5
            if site_data['has_ssl']:
                quality_score += 10
            if site_data['response_time'] < 2.0:
                quality_score += 15
            elif site_data['response_time'] < 5.0:
                quality_score += 5
            if site_data['has_mobile_meta']:
                quality_score += 10
            
            site_data['quality_score'] = min(100, quality_score)
            
            logger.info(f"✅ Successfully scraped {domain} (Quality: {site_data['quality_score']})")
            return site_data
            
        except requests.exceptions.Timeout:
            logger.warning(f"⏰ Timeout for {url}")
            self.failed_sites.append({'url': url, 'error': 'timeout'})
            return None
        except requests.exceptions.ConnectionError:
            logger.warning(f"🔌 Connection error for {url}")
            self.failed_sites.append({'url': url, 'error': 'connection_error'})
            return None
        except Exception as e:
            logger.error(f"❌ Error scraping {url}: {str(e)}")
            self.failed_sites.append({'url': url, 'error': str(e)})
            return None
    
    def scrape_all_sites(self, sites):
        """Scrape all sites from list"""
        logger.info(f"Starting to scrape {len(sites)} international sites...")
        
        for i, site in enumerate(sites, 1):
            logger.info(f"Progress: {i}/{len(sites)}")
            
            result = self.scrape_site(site)
            if result:
                self.results.append(result)
            
            # Save progress every 10 sites
            if i % 10 == 0:
                self.save_progress()
        
        logger.info(f"Scraping completed! Successfully scraped {len(self.results)} sites")
        logger.info(f"Failed sites: {len(self.failed_sites)}")
        
        return self.results
    
    def save_progress(self):
        """Save current progress"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save successful results
        with open(f'international_scraped_data_{timestamp}.json', 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        # Save failed sites
        if self.failed_sites:
            with open(f'international_failed_sites_{timestamp}.json', 'w', encoding='utf-8') as f:
                json.dump(self.failed_sites, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Progress saved: {len(self.results)} successful, {len(self.failed_sites)} failed")
    
    def generate_summary(self):
        """Generate summary of scraped data"""
        if not self.results:
            return "No data scraped yet."
        
        # Category distribution
        category_count = {}
        for site in self.results:
            for category in site.get('categories', []):
                category_count[category] = category_count.get(category, 0) + 1
        
        # Language distribution
        lang_count = {}
        for site in self.results:
            lang = site.get('language', 'unknown')
            lang_count[lang] = lang_count.get(lang, 0) + 1
        
        # Quality distribution
        quality_ranges = {'High (80+)': 0, 'Medium (60-79)': 0, 'Low (<60)': 0}
        for site in self.results:
            score = site.get('quality_score', 0)
            if score >= 80:
                quality_ranges['High (80+)'] += 1
            elif score >= 60:
                quality_ranges['Medium (60-79)'] += 1
            else:
                quality_ranges['Low (<60)'] += 1
        
        summary = f"""
INTERNATIONAL HEALTH SCRAPING SUMMARY
=====================================
Total sites scraped: {len(self.results)}
Failed sites: {len(self.failed_sites)}

CATEGORY DISTRIBUTION:
{chr(10).join([f"  {cat}: {count}" for cat, count in sorted(category_count.items())])}

LANGUAGE DISTRIBUTION:
{chr(10).join([f"  {lang}: {count}" for lang, count in sorted(lang_count.items())])}

QUALITY DISTRIBUTION:
{chr(10).join([f"  {range_name}: {count}" for range_name, count in quality_ranges.items()])}

TOP 10 HIGHEST QUALITY SITES:
{chr(10).join([f"  {site['domain']}: {site['quality_score']}" for site in sorted(self.results, key=lambda x: x.get('quality_score', 0), reverse=True)[:10]])}
        """
        
        return summary

def main():
    scraper = InternationalHealthScraper()
    
    # Load sites from files
    health_companies = scraper.load_sites_from_file('international_health_companies.txt')
    health_podcasts = scraper.load_sites_from_file('international_health_podcasts.txt')
    
    # Combine all sites
    all_sites = health_companies + health_podcasts
    
    logger.info(f"Loaded {len(health_companies)} health companies")
    logger.info(f"Loaded {len(health_podcasts)} health podcasts")
    logger.info(f"Total sites to scrape: {len(all_sites)}")
    
    # Start scraping
    results = scraper.scrape_all_sites(all_sites)
    
    # Save final results
    scraper.save_progress()
    
    # Generate and save summary
    summary = scraper.generate_summary()
    print(summary)
    
    with open('international_scraping_summary.txt', 'w', encoding='utf-8') as f:
        f.write(summary)
    
    logger.info("International health scraping completed!")

if __name__ == "__main__":
    main() 