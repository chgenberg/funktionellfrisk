#!/usr/bin/env python3
"""
Consolidate Health Data Script
Combines Swedish and international health data, removes duplicates,
and filters for holistic health and fitness companies only.
"""

import json
import re
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HealthDataConsolidator:
    def __init__(self):
        self.all_sites = []
        self.duplicates_removed = 0
        self.filtered_out = 0
        
    def load_swedish_data(self, filename='site-data.js'):
        """Load Swedish site data from JavaScript file"""
        sites = []
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract the siteData array from JavaScript
            start = content.find('const siteData = [')
            if start == -1:
                logger.error("Could not find siteData array in file")
                return sites
                
            start += len('const siteData = ')
            
            # Find the end of the array
            bracket_count = 0
            end = start
            in_array = False
            
            for i, char in enumerate(content[start:], start):
                if char == '[':
                    bracket_count += 1
                    in_array = True
                elif char == ']':
                    bracket_count -= 1
                    if bracket_count == 0 and in_array:
                        end = i + 1
                        break
            
            if end > start:
                json_str = content[start:end]
                sites = json.loads(json_str)
                logger.info(f"Loaded {len(sites)} Swedish sites")
            
        except Exception as e:
            logger.error(f"Error loading Swedish data: {e}")
            
        return sites
    
    def load_international_data(self, filename='international_scraped_data_20250701_053222.json'):
        """Load international scraped data"""
        sites = []
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                sites = json.load(f)
            logger.info(f"Loaded {len(sites)} international sites")
        except Exception as e:
            logger.error(f"Error loading international data: {e}")
            
        return sites
    
    def is_holistic_health_or_fitness(self, site):
        """Check if site is related to holistic health or fitness"""
        
        # Categories that we want to keep
        relevant_categories = [
            'TRÄNING', 'FITNESS', 'WELLNESS', 'COACHING', 'MENTAL_HÄLSA', 
            'MENTAL_HEALTH', 'HÄLSOKOST', 'NUTRITION', 'PODCAST'
        ]
        
        # Check categories
        site_categories = site.get('categories', [])
        if any(cat in relevant_categories for cat in site_categories):
            return True
        
        # Keywords that indicate holistic health and fitness
        holistic_keywords = [
            'holistic', 'holistisk', 'wellness', 'välmående', 'mindfulness', 
            'meditation', 'yoga', 'mental health', 'mental hälsa', 'biohacking',
            'fitness', 'träning', 'workout', 'exercise', 'gym', 'training',
            'nutrition', 'näring', 'diet', 'kost', 'coaching', 'lifestyle'
        ]
        
        # Check content for keywords
        content_to_check = ' '.join([
            site.get('name', ''),
            site.get('description', ''),
            site.get('title', ''),
            ' '.join(site.get('specialties', []))
        ]).lower()
        
        if any(keyword in content_to_check for keyword in holistic_keywords):
            return True
        
        return False
    
    def normalize_international_site(self, site):
        """Convert international site to our format"""
        # Map categories
        category_mapping = {
            'FITNESS': 'TRÄNING',
            'NUTRITION': 'HÄLSOKOST',
            'COACHING': 'COACHING',
            'MENTAL_HEALTH': 'MENTAL_HÄLSA',
            'SUPPLEMENTS': 'KOSTTILLSKOTT',
            'PODCAST': 'PODCAST',
            'APP': 'APPS',
            'WELLNESS': 'WELLNESS',
            'WEIGHT_LOSS': 'VIKTMINSKNING'
        }
        
        mapped_categories = []
        for cat in site.get('categories', []):
            if cat in category_mapping:
                mapped_categories.append(category_mapping[cat])
            else:
                mapped_categories.append(cat)
        
        # Create badges
        badges = ['ENGELSKA']
        if site.get('quality_score', 0) >= 80:
            badges.append('HÖGKVALITET')
        if site.get('response_time', 10) < 2.0:
            badges.append('SNABB')
        if len(site.get('social_media', {})) >= 3:
            badges.append('MEST SOCIALA')
        
        # Extract specialties from categories
        specialties = []
        category_specialties = {
            'FITNESS': 'Träning',
            'NUTRITION': 'Näring',
            'MENTAL_HEALTH': 'Mental hälsa',
            'WELLNESS': 'Välmående',
            'COACHING': 'Coaching'
        }
        
        for cat in site.get('categories', []):
            if cat in category_specialties:
                specialties.append(category_specialties[cat])
        
        if not specialties:
            specialties = ['Hälsa', 'Välmående']
        
        return {
            'name': site.get('name', site.get('domain', '')),
            'domain': site.get('domain', ''),
            'description': site.get('description', ''),
            'shortDescription': site.get('description', '')[:100] + '...' if len(site.get('description', '')) > 100 else site.get('description', ''),
            'categories': mapped_categories,
            'language': 'Engelska',
            'country': 'International',
            'social_media': site.get('social_media', {}),
            'rating': min(5.0, site.get('quality_score', 70) / 20),
            'quality_score': site.get('quality_score', 70),
            'response_time': site.get('response_time', 0),
            'has_ssl': site.get('has_ssl', True),
            'has_mobile_meta': site.get('has_mobile_meta', True),
            'is_recommended': site.get('quality_score', 0) >= 85,
            'badges': badges,
            'specialties': specialties[:4],
            'priceRange': 'Kontakta',
            'courses': len(site.get('services', [])),
            'languages': ['engelska'],
            'source': 'international_scraped'
        }
    
    def remove_duplicates(self, sites):
        """Remove duplicate sites based on domain"""
        seen_domains = set()
        unique_sites = []
        
        for site in sites:
            domain = site.get('domain', '').lower().replace('www.', '')
            
            if domain and domain not in seen_domains:
                seen_domains.add(domain)
                unique_sites.append(site)
            else:
                self.duplicates_removed += 1
        
        return unique_sites
    
    def consolidate_all_data(self):
        """Main function to consolidate all health data"""
        logger.info("Starting data consolidation...")
        
        # Load Swedish data
        swedish_sites = self.load_swedish_data()
        
        # Load international data
        international_sites = self.load_international_data()
        
        # Normalize international sites
        normalized_international = []
        for site in international_sites:
            if self.is_holistic_health_or_fitness(site):
                normalized_site = self.normalize_international_site(site)
                normalized_international.append(normalized_site)
            else:
                self.filtered_out += 1
        
        # Combine all sites
        all_sites = swedish_sites + normalized_international
        logger.info(f"Total sites before removing duplicates: {len(all_sites)}")
        
        # Remove duplicates
        unique_sites = self.remove_duplicates(all_sites)
        logger.info(f"Sites after removing duplicates: {len(unique_sites)} (removed {self.duplicates_removed})")
        
        # Sort by quality score and recommendation status
        unique_sites.sort(key=lambda x: (x.get('is_recommended', False), x.get('quality_score', 0)), reverse=True)
        
        self.all_sites = unique_sites
        return unique_sites
    
    def generate_new_site_data_js(self, sites, filename='site-data-consolidated.js'):
        """Generate new site-data.js file with consolidated data"""
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        js_content = f"""// KONSOLIDERAD HÄLSOPLATTFORM DATABAS
// Genererad: {timestamp}
// Totalt antal plattformar: {len(sites)}
// Källor: Svenska sajter + Internationella hälsoföretag
// Fokus: Holistisk hälsa och träning

const siteData = {json.dumps(sites, indent=2, ensure_ascii=False)};

// Smarta filter för konsoliderad data
const smartFilters = {{
    'SNABBAST': (sites) => sites.filter(site => site.response_time < 2.0),
    'BUDGET': (sites) => sites.filter(site => site.priceRange && (site.priceRange.includes('Under') || site.priceRange === 'Gratis')),
    'HÖGKVALITET': (sites) => sites.filter(site => site.quality_score >= 80),
    'MEST SOCIALA': (sites) => sites.filter(site => Object.keys(site.social_media || {{}}).length >= 3),
    'GRATIS': (sites) => sites.filter(site => site.priceRange === 'Gratis'),
    'SVENSKA': (sites) => sites.filter(site => site.language === 'Svenska'),
    'INTERNATIONELLA': (sites) => sites.filter(site => site.language === 'Engelska'),
    'TRÄNING': (sites) => sites.filter(site => site.categories.some(cat => ['TRÄNING', 'FITNESS'].includes(cat))),
    'WELLNESS': (sites) => sites.filter(site => site.categories.includes('WELLNESS')),
    'COACHING': (sites) => sites.filter(site => site.categories.includes('COACHING')),
    'MENTAL HÄLSA': (sites) => sites.filter(site => site.categories.some(cat => ['MENTAL_HÄLSA', 'MENTAL_HEALTH'].includes(cat))),
    'PODDAR': (sites) => sites.filter(site => site.categories.includes('PODCAST'))
}};

// Export för användning i andra moduler
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {{ siteData, smartFilters }};
}}
"""
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        logger.info(f"Generated new site data file: {filename}")

def main():
    consolidator = HealthDataConsolidator()
    
    # Consolidate all data
    consolidated_sites = consolidator.consolidate_all_data()
    
    # Generate new site-data.js
    consolidator.generate_new_site_data_js(consolidated_sites)
    
    # Generate summary
    swedish_count = len([s for s in consolidated_sites if s.get('language') == 'Svenska'])
    international_count = len([s for s in consolidated_sites if s.get('language') == 'Engelska'])
    
    print(f"""
KONSOLIDERAD HÄLSADATA SAMMANFATTNING
===================================
Totalt antal sajter: {len(consolidated_sites)}
Svenska sajter: {swedish_count}
Internationella sajter: {international_count}
Dubletter borttagna: {consolidator.duplicates_removed}
Filtrerade bort: {consolidator.filtered_out}

Ny datafil skapad: site-data-consolidated.js
    """)
    
    logger.info("Data consolidation completed successfully!")

if __name__ == "__main__":
    main() 