#!/usr/bin/env python3
"""
Demo-skript för att visa skrapningens kraft på en enskild sajt
"""
import requests
from bs4 import BeautifulSoup
import time
import json

def demo_scrape():
    """Demonstrerar skrapning av functionalfoods.se"""
    
    print("🎯 DEMO: Skrapar functionalfoods.se för att visa möjligheterna...")
    print("=" * 60)
    
    url = "https://functionalfoods.se"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        print(f"📡 Ansluter till {url}...")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Samla grundläggande info
        title = soup.find('title')
        title_text = title.text.strip() if title else "Ingen titel hittad"
        
        meta_desc = soup.find('meta', {'name': 'description'})
        desc_text = meta_desc.get('content', '').strip() if meta_desc else "Ingen meta-beskrivning"
        
        # Leta efter priser
        pricing_info = []
        for text in soup.find_all(string=True):
            if any(word in text.lower() for word in ['kr', 'pris', 'kostnad']):
                # Hitta numeriska värden
                import re
                prices = re.findall(r'\d+\s*kr', text.lower())
                pricing_info.extend(prices)
        
        # Leta efter kurser
        course_keywords = ['kurs', 'program', 'utbildning', 'coaching']
        courses = []
        for element in soup.find_all(['h1', 'h2', 'h3', 'a']):
            text = element.get_text().strip()
            if any(keyword in text.lower() for keyword in course_keywords) and len(text) < 100:
                courses.append(text)
        
        # Teknisk info
        has_mobile = bool(soup.find('meta', {'name': 'viewport'}))
        has_ssl = response.url.startswith('https://')
        load_time = response.elapsed.total_seconds()
        
        # Presentera resultaten
        print(f"\n✅ SKRAPNING SLUTFÖRD FÖR {url}")
        print(f"⏱️  Laddningstid: {load_time:.2f} sekunder")
        print("-" * 40)
        
        print(f"📄 TITEL:")
        print(f"   {title_text}")
        
        print(f"\n📝 META-BESKRIVNING:")
        print(f"   {desc_text[:100]}...")
        
        if pricing_info:
            unique_prices = list(set(pricing_info))[:3]
            print(f"\n💰 PRISER HITTADE:")
            for price in unique_prices:
                print(f"   • {price}")
        
        if courses:
            unique_courses = list(set(courses))[:5]
            print(f"\n🎓 KURSER/PROGRAM HITTADE:")
            for course in unique_courses:
                print(f"   • {course[:60]}...")
        
        print(f"\n🔧 TEKNISK KVALITET:")
        print(f"   SSL-säkert: {'✅' if has_ssl else '❌'}")
        print(f"   Mobiloptimerad: {'✅' if has_mobile else '❌'}")
        print(f"   Snabb laddning: {'✅' if load_time < 3 else '❌'}")
        
        # Visa förbättringspotential
        print(f"\n💡 FÖRE VS EFTER SKRAPNING:")
        print("-" * 40)
        
        print("FÖRE (nuvarande beskrivning):")
        print("   'Utbildnings- och receptportal för alla som vill äta sin medicin.'")
        
        enhanced_desc = f"{desc_text}"
        if courses:
            enhanced_desc += f" Erbjuder {len(set(courses))}+ kurser och program."
        if has_ssl and load_time < 3:
            enhanced_desc += " Snabb och säker plattform."
        
        print(f"\nEFTER (förbättrad med skrapad data):")
        print(f"   '{enhanced_desc[:150]}...'")
        
        print(f"\n🚀 DETTA ÄR BARA EN SAJT!")
        print("Med fullständig skrapning av alla 40+ sajter får du:")
        print("   • Detaljerade jämförelser av priser")
        print("   • Kvalitetsranking baserat på laddningstid") 
        print("   • Automatisk kategorisering av kurstyper")
        print("   • Social media aktivitet scoring")
        print("   • Mobiloptimerings-bedömning")
        print("   • Mycket mer kraftfull jämförelsesajt!")
        
    except Exception as e:
        print(f"❌ Fel vid skrapning: {str(e)}")
        print("Detta är normalt för demo-syften. Fullständiga skriptet hanterar fel bättre.")

if __name__ == "__main__":
    demo_scrape() 