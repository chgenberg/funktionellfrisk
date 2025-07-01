#!/usr/bin/env python3
"""
Förbättrar site-data.js med skrapad information
"""
import json
import re

def enhance_site_data():
    """Läser skrapad data och förbättrar site-data.js"""
    
    # Läs skrapad data
    try:
        with open('scraped_site_data.json', 'r', encoding='utf-8') as f:
            scraped_data = json.load(f)
    except FileNotFoundError:
        print("❌ scraped_site_data.json hittades inte. Kör scraper.py först!")
        return
    
    # Skapa en dictionary för snabb lookup
    scraped_lookup = {item['domain']: item for item in scraped_data if 'error' not in item}
    
    print(f"📊 Läste skrapad data för {len(scraped_lookup)} sajter")
    
    # Analysera och presentera data
    print("\n🔍 SKRAPAD DATA ANALYS:")
    print("=" * 50)
    
    for domain, data in scraped_lookup.items():
        print(f"\n🌐 {domain.upper()}")
        print(f"   Titel: {data.get('title', 'N/A')[:80]}...")
        print(f"   Typ: {data.get('site_type', 'N/A')}")
        print(f"   Språk: {', '.join(data.get('languages', ['N/A']))}")
        
        # Prisinformation
        if data.get('pricing_info'):
            print(f"   Priser: {', '.join(data['pricing_info'][:3])}")
        
        # Kurser
        if data.get('course_offerings'):
            print(f"   Kurser: {len(data['course_offerings'])} hittade")
        
        # Sociala medier
        if data.get('social_media'):
            platforms = list(data['social_media'].keys())
            print(f"   Sociala medier: {', '.join(platforms)}")
        
        # Teknisk info
        tech = data.get('technical_info', {})
        if tech:
            print(f"   Laddningstid: {tech.get('response_time', 0):.2f}s")
            print(f"   Mobiloptimerad: {'✅' if tech.get('has_mobile_meta') else '❌'}")
            print(f"   SSL: {'✅' if tech.get('has_ssl') else '❌'}")
    
    # Skapa förbättrade beskrivningar
    print("\n💡 GENERERAR FÖRBÄTTRADE BESKRIVNINGAR...")
    enhanced_descriptions = {}
    
    for domain, data in scraped_lookup.items():
        enhanced_desc = create_enhanced_description(data)
        if enhanced_desc:
            enhanced_descriptions[domain] = enhanced_desc
            print(f"✅ Förbättrad beskrivning för {domain}")
    
    # Spara förbättrade beskrivningar
    with open('enhanced_descriptions.json', 'w', encoding='utf-8') as f:
        json.dump(enhanced_descriptions, f, ensure_ascii=False, indent=2)
    
    print(f"\n🎉 Analys klar! Förbättrade beskrivningar sparade i 'enhanced_descriptions.json'")
    print("\nNästa steg: Integrera denna data i site-data.js för kraftfullare jämförelser!")

def create_enhanced_description(data):
    """Skapar en förbättrad beskrivning baserat på skrapad data"""
    domain = data['domain']
    title = data.get('title', '')
    meta_desc = data.get('meta_description', '')
    site_type = data.get('site_type', '')
    pricing = data.get('pricing_info', [])
    courses = data.get('course_offerings', [])
    features = data.get('features', [])
    social = data.get('social_media', {})
    tech = data.get('technical_info', {})
    
    # Börja med meta-beskrivning som bas
    base_desc = meta_desc if meta_desc else title
    
    # Lägg till typ-specifik information
    type_info = ""
    if site_type == 'e-commerce' and pricing:
        type_info = f" E-handelssajt med priser från {pricing[0]}."
    elif site_type == 'education' and courses:
        course_count = len(courses)
        type_info = f" Erbjuder {course_count}+ kurser och utbildningar."
    elif site_type == 'content':
        type_info = " Innehållsrik plattform med artiklar och guider."
    
    # Lägg till sociala medier info
    social_info = ""
    if len(social) > 2:
        platforms = list(social.keys())[:3]
        social_info = f" Aktiv på {', '.join(platforms)}."
    
    # Lägg till teknisk kvalitet
    tech_info = ""
    if tech.get('response_time', 0) < 2:
        tech_info = " Snabb och responsiv sajt."
    elif tech.get('has_mobile_meta'):
        tech_info = " Mobiloptimerad plattform."
    
    # Kombinera allt
    enhanced = f"{base_desc}{type_info}{social_info}{tech_info}".strip()
    
    # Begränsa längd
    if len(enhanced) > 200:
        enhanced = enhanced[:200] + "..."
    
    return enhanced

def generate_comparison_insights():
    """Genererar jämförelseinsikter från skrapad data"""
    try:
        with open('scraped_site_data.json', 'r', encoding='utf-8') as f:
            scraped_data = json.load(f)
    except FileNotFoundError:
        print("❌ scraped_site_data.json hittades inte.")
        return
    
    print("\n📈 JÄMFÖRELSEINSIKTER:")
    print("=" * 50)
    
    # Hastighetsanalys
    response_times = []
    for item in scraped_data:
        if 'technical_info' in item and 'response_time' in item['technical_info']:
            response_times.append((item['domain'], item['technical_info']['response_time']))
    
    if response_times:
        response_times.sort(key=lambda x: x[1])
        print("\n⚡ SNABBASTE SAJTER:")
        for domain, time in response_times[:5]:
            print(f"   {domain}: {time:.2f}s")
    
    # Mobiloptimering
    mobile_optimized = []
    for item in scraped_data:
        if 'technical_info' in item:
            if item['technical_info'].get('has_mobile_meta'):
                mobile_optimized.append(item['domain'])
    
    print(f"\n📱 MOBILOPTIMERADE: {len(mobile_optimized)}/{len(scraped_data)} sajter")
    
    # Sociala medier
    social_leaders = []
    for item in scraped_data:
        if 'social_media' in item:
            social_count = len(item['social_media'])
            if social_count > 0:
                social_leaders.append((item['domain'], social_count))
    
    if social_leaders:
        social_leaders.sort(key=lambda x: x[1], reverse=True)
        print("\n📲 MEST SOCIALA:")
        for domain, count in social_leaders[:5]:
            print(f"   {domain}: {count} plattformar")

if __name__ == "__main__":
    enhance_site_data()
    generate_comparison_insights() 