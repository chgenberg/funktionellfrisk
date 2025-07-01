#!/usr/bin/env python3
"""
Database Cleaner for Health Sites
Removes non-working sites and updates redirects based on URL check results
"""

import json
import re
from datetime import datetime

def load_site_data():
    """Load the current site data from site-data.js"""
    try:
        with open('site-data.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract the JavaScript array
        start = content.find('const siteData = [')
        end = content.find('];', start) + 2
        
        if start == -1 or end == -1:
            raise ValueError("Could not find siteData array in file")
        
        # Get just the array part and convert to JSON
        js_array = content[start:end]
        json_str = js_array.replace('const siteData = ', '').rstrip(';')
        
        return json.loads(json_str)
    except Exception as e:
        print(f"Error loading site data: {e}")
        return []

def load_corrections():
    """Load URL corrections from our analysis"""
    try:
        with open('url_corrections.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading corrections: {e}")
        return {"url_corrections": {"corrections": [], "working_redirects": []}}

def clean_database():
    """Clean the database by removing non-working sites"""
    print("🧹 Cleaning health sites database...")
    
    # Load data
    sites = load_site_data()
    corrections = load_corrections()
    
    if not sites:
        print("❌ Could not load site data")
        return
    
    print(f"📊 Loaded {len(sites)} sites")
    
    # Get domains to remove
    domains_to_remove = set()
    for correction in corrections["url_corrections"]["corrections"]:
        if correction["new_domain"] == "REMOVE":
            domains_to_remove.add(correction["old_domain"])
    
    print(f"🗑️  Will remove {len(domains_to_remove)} non-working sites")
    
    # Filter out non-working sites
    cleaned_sites = []
    removed_count = 0
    
    for site in sites:
        if site["domain"] in domains_to_remove:
            print(f"❌ Removing: {site['name']} ({site['domain']})")
            removed_count += 1
        else:
            cleaned_sites.append(site)
    
    # Update redirects
    redirect_updates = 0
    for redirect in corrections["url_corrections"]["working_redirects"]:
        for site in cleaned_sites:
            if site["domain"] == redirect["old_domain"]:
                # Update domain to redirect target
                new_domain = redirect["redirect_to"]
                print(f"🔄 Updating redirect: {site['name']} ({redirect['old_domain']}) -> {new_domain}")
                site["domain"] = new_domain
                redirect_updates += 1
                break
    
    print(f"\n📊 Cleaning Results:")
    print(f"   Original sites: {len(sites)}")
    print(f"   Removed sites: {removed_count}")
    print(f"   Updated redirects: {redirect_updates}")
    print(f"   Final sites: {len(cleaned_sites)}")
    
    # Save cleaned data
    save_cleaned_data(cleaned_sites)
    
    return cleaned_sites

def save_cleaned_data(sites):
    """Save the cleaned data back to site-data.js"""
    
    # Create backup
    backup_filename = f"site-data-backup-{datetime.now().strftime('%Y%m%d_%H%M%S')}.js"
    with open('site-data.js', 'r', encoding='utf-8') as f:
        backup_content = f.read()
    with open(backup_filename, 'w', encoding='utf-8') as f:
        f.write(backup_content)
    print(f"💾 Backup saved as: {backup_filename}")
    
    # Generate new file content
    header = f"""// KONSOLIDERAD HÄLSOPLATTFORM DATABAS - CLEANED
// Genererad: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// Totalt antal plattformar: {len(sites)}
// Status: Rensad från icke-fungerande sajter
// Fokus: Holistisk hälsa och träning

const siteData = """
    
    # Convert to JSON string with proper formatting
    json_str = json.dumps(sites, indent=2, ensure_ascii=False)
    
    footer = ";"
    
    new_content = header + json_str + footer
    
    # Save new file
    with open('site-data.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Cleaned database saved to site-data.js")

def analyze_social_media():
    """Analyze social media data quality"""
    print("\n🔍 Analyzing social media data quality...")
    
    sites = load_site_data()
    total_sites = len(sites)
    sites_with_social = 0
    social_platforms = {}
    
    for site in sites:
        if "social_media" in site and site["social_media"]:
            sites_with_social += 1
            for platform, url in site["social_media"].items():
                if platform not in social_platforms:
                    social_platforms[platform] = 0
                social_platforms[platform] += 1
    
    print(f"📊 Social Media Analysis:")
    print(f"   Sites with social media: {sites_with_social}/{total_sites} ({sites_with_social/total_sites*100:.1f}%)")
    print(f"   Platform distribution:")
    for platform, count in sorted(social_platforms.items(), key=lambda x: x[1], reverse=True):
        print(f"     {platform}: {count} sites")

if __name__ == "__main__":
    # Clean the database
    cleaned_sites = clean_database()
    
    # Analyze social media data
    if cleaned_sites:
        analyze_social_media()
    
    print("\n🎉 Database cleaning completed!")
    print("📝 Next steps:")
    print("   1. Review the cleaned site-data.js")
    print("   2. Test the website with cleaned data")
    print("   3. Commit changes if everything looks good") 