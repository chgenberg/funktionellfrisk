#!/bin/bash

echo "🔍 Checking all URLs in the health database..."
echo "=================================================="

# Extract domains from site-data.js
domains=$(grep -o '"domain": *"[^"]*"' site-data.js | sed 's/"domain": *"//g' | sed 's/"//g')

total=0
working=0
failed=0
redirects=0

echo "📊 Found $(echo "$domains" | wc -l) domains to check"
echo ""

# Create results file
echo "URL Check Results - $(date)" > url_check_results.txt
echo "=================================" >> url_check_results.txt
echo "" >> url_check_results.txt

for domain in $domains; do
    ((total++))
    echo -n "Testing $domain... "
    
    # Try HTTPS first
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 "https://$domain" | grep -q "200"; then
        echo "✅ WORKING (https://$domain)"
        echo "✅ $domain - https://$domain" >> url_check_results.txt
        ((working++))
    elif curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 "https://www.$domain" | grep -q "200"; then
        echo "✅ WORKING (https://www.$domain)"
        echo "✅ $domain - https://www.$domain" >> url_check_results.txt
        ((working++))
    elif curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 "http://$domain" | grep -q "200"; then
        echo "✅ WORKING (http://$domain)"
        echo "✅ $domain - http://$domain" >> url_check_results.txt
        ((working++))
    elif curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 "http://www.$domain" | grep -q "200"; then
        echo "✅ WORKING (http://www.$domain)"
        echo "✅ $domain - http://www.$domain" >> url_check_results.txt
        ((working++))
    else
        # Check for redirects
        redirect_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 "https://$domain")
        if [[ "$redirect_code" =~ ^3[0-9][0-9]$ ]]; then
            redirect_url=$(curl -s -w "%{redirect_url}" --connect-timeout 10 --max-time 15 "https://$domain")
            echo "🔄 REDIRECT ($redirect_code -> $redirect_url)"
            echo "🔄 $domain - REDIRECT $redirect_code -> $redirect_url" >> url_check_results.txt
            ((redirects++))
        else
            echo "❌ FAILED"
            echo "❌ $domain - FAILED" >> url_check_results.txt
            ((failed++))
        fi
    fi
done

echo ""
echo "=================================================="
echo "📊 SUMMARY:"
echo "Total sites: $total"
echo "✅ Working: $working"
echo "🔄 Redirects: $redirects"
echo "❌ Failed: $failed"
echo ""
echo "💾 Results saved to url_check_results.txt"

# Show failed sites
echo ""
echo "❌ FAILED SITES:"
echo "----------------"
grep "❌" url_check_results.txt | head -20 