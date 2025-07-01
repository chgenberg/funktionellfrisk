#!/usr/bin/env python3
"""
URL Checker for Health Sites Database
Extracts all domains from site-data.js and tests their accessibility
"""

import re
import requests
import json
import time
from urllib.parse import urlparse
import concurrent.futures
from threading import Lock

# Thread-safe printing
print_lock = Lock()

def safe_print(*args, **kwargs):
    with print_lock:
        print(*args, **kwargs)

def extract_domains_from_js():
    """Extract all domains from site-data.js"""
    try:
        with open('site-data.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all domain entries
        domain_pattern = r'"domain":\s*"([^"]+)"'
        domains = re.findall(domain_pattern, content)
        
        # Also extract names for reference
        name_pattern = r'"name":\s*"([^"]+)"'
        names = re.findall(name_pattern, content)
        
        return list(zip(names, domains))
    except Exception as e:
        safe_print(f"Error reading site-data.js: {e}")
        return []

def test_url(site_info, timeout=10):
    """Test if a URL is accessible"""
    name, domain = site_info
    
    # Try both http and https
    urls_to_test = [
        f"https://{domain}",
        f"http://{domain}",
        f"https://www.{domain}",
        f"http://www.{domain}"
    ]
    
    result = {
        'name': name,
        'domain': domain,
        'status': 'FAILED',
        'working_url': None,
        'status_code': None,
        'redirect_url': None,
        'error': None
    }
    
    for url in urls_to_test:
        try:
            response = requests.get(
                url, 
                timeout=timeout, 
                allow_redirects=True,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            )
            
            if response.status_code == 200:
                result['status'] = 'SUCCESS'
                result['working_url'] = url
                result['status_code'] = response.status_code
                result['redirect_url'] = response.url if response.url != url else None
                safe_print(f"✅ {name} ({domain}) -> {url}")
                return result
            elif response.status_code in [301, 302, 303, 307, 308]:
                result['status'] = 'REDIRECT'
                result['working_url'] = url
                result['status_code'] = response.status_code
                result['redirect_url'] = response.url
                safe_print(f"🔄 {name} ({domain}) -> {url} redirects to {response.url}")
                return result
                
        except requests.exceptions.Timeout:
            result['error'] = 'Timeout'
        except requests.exceptions.ConnectionError:
            result['error'] = 'Connection Error'
        except requests.exceptions.TooManyRedirects:
            result['error'] = 'Too Many Redirects'
        except Exception as e:
            result['error'] = str(e)
    
    safe_print(f"❌ {name} ({domain}) - FAILED")
    return result

def main():
    safe_print("🔍 Extracting domains from site-data.js...")
    sites = extract_domains_from_js()
    
    if not sites:
        safe_print("No domains found!")
        return
    
    safe_print(f"Found {len(sites)} sites to test")
    safe_print("=" * 50)
    
    # Test URLs with threading for speed
    results = []
    failed_sites = []
    redirect_sites = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_site = {executor.submit(test_url, site): site for site in sites}
        
        for future in concurrent.futures.as_completed(future_to_site):
            result = future.result()
            results.append(result)
            
            if result['status'] == 'FAILED':
                failed_sites.append(result)
            elif result['status'] == 'REDIRECT':
                redirect_sites.append(result)
    
    # Summary
    safe_print("\n" + "=" * 50)
    safe_print("📊 SUMMARY")
    safe_print("=" * 50)
    
    successful = len([r for r in results if r['status'] == 'SUCCESS'])
    redirected = len(redirect_sites)
    failed = len(failed_sites)
    
    safe_print(f"✅ Working: {successful}")
    safe_print(f"🔄 Redirects: {redirected}")
    safe_print(f"❌ Failed: {failed}")
    safe_print(f"📊 Total: {len(results)}")
    
    # Failed sites details
    if failed_sites:
        safe_print("\n❌ FAILED SITES:")
        safe_print("-" * 30)
        for site in failed_sites:
            safe_print(f"• {site['name']} ({site['domain']}) - {site['error']}")
    
    # Redirect sites details
    if redirect_sites:
        safe_print("\n🔄 REDIRECT SITES:")
        safe_print("-" * 30)
        for site in redirect_sites:
            safe_print(f"• {site['name']} ({site['domain']}) -> {site['redirect_url']}")
    
    # Save results to JSON
    with open('url_check_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    safe_print(f"\n💾 Results saved to url_check_results.json")

if __name__ == "__main__":
    main() 