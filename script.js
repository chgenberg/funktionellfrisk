// SVERIGES MEST AVANCERADE HÄLSOJÄMFÖRELSEPLATTFORM
// AI-driven recommendations & smart filtering

let currentFilter = 'alla';
let currentSmartFilter = null;
let currentLanguageFilter = 'alla';
let filteredData = [...siteData];
let showPodcasts = false;

// Initialize the platform
document.addEventListener('DOMContentLoaded', function() {
    initializePlatform();
    filteredData = [...siteData]; // Ensure all sites are shown initially
    displaySites(filteredData);
    setupSmartFilters();
    setupAdvancedSearch();
    setupPersonalizationEngine();
    
    console.log('🎯 Avancerad hälsoplattform initialiserad');
    console.log(`📊 Laddat ${siteData.length} sajter med fullständig data`);
});

function initializePlatform() {
    // Add quality badges to each site card
    siteData.forEach(site => {
        if (!site.quality_score) {
            site.quality_score = calculateQualityScore(site);
        }
    });
    
    // Initialize personalized recommendations
    displayPersonalizedSection();
}

function displaySites(sites) {
    const container = document.getElementById('sites-container');
    if (!container) return;
    
    const sitesToShow = showPodcasts ? podcastData : sites;
    
    // Sort with Swedish sites first, then by quality
    sitesToShow.sort((a, b) => {
        // Swedish sites always come first
        if (a.language === 'Svenska' && b.language !== 'Svenska') return -1;
        if (a.language !== 'Svenska' && b.language === 'Svenska') return 1;
        
        // Then by recommendation status
        if (a.is_recommended && !b.is_recommended) return -1;
        if (!a.is_recommended && b.is_recommended) return 1;
        
        // Finally by quality score
        return b.quality_score - a.quality_score;
    });
    
    container.innerHTML = sitesToShow.map(site => createAdvancedSiteCard(site)).join('');
    
    // Update stats
    updatePlatformStats(sites);
}

function createAdvancedSiteCard(site) {
    const badges = createBadges(site);
    const socialIcons = createSocialIcons(site.social_media || {});
    const qualityMeter = createQualityMeter(site.quality_score || 70);
    const priceInfo = createPriceInfo(site);
    const specialtyTags = createSpecialtyTags(site.specialties || []);
    
    const cardClass = site.is_recommended ? 'site-card recommended' : 'site-card';
    const recommendationBanner = site.is_recommended ? 
        `<div class="recommendation-banner">⭐ ${site.recommendation_reason || 'REKOMMENDERAD'}</div>` : '';
    
    return `
        <div class="${cardClass}" data-categories='${JSON.stringify(site.categories || [])}'>
            ${recommendationBanner}
            
            <div class="site-header">
                <div class="site-title-section">
                    <h3 onclick="openSiteDetails('${site.domain}')">${site.name}</h3>
                    <div class="site-subtitle">${site.shortDescription || site.description}</div>
                </div>
                <div class="site-rating">
                    <div class="stars">${createStars(site.rating)}</div>
                    <span class="rating-number">${site.rating}/5</span>
                </div>
            </div>
            
            ${badges}
            
            <div class="site-metrics">
                <div class="metric">
                    <span class="metric-label">Hastighet:</span>
                    <span class="metric-value speed-${getSpeedClass(site.response_time)}">${formatSpeed(site.response_time)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Kurser:</span>
                    <span class="metric-value">${site.courses || 0}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Språk:</span>
                    <span class="metric-value">${formatLanguages(site.languages)}</span>
                </div>
            </div>
            
            ${qualityMeter}
            ${priceInfo}
            ${specialtyTags}
            
            <div class="site-actions">
                <button class="visit-btn" onclick="visitSite('${site.domain}')">
                    BESÖK HEMSIDA
                </button>
                <div class="secondary-actions">
                    ${socialIcons}
                    <button class="compare-btn" onclick="addToComparison('${site.domain}')">
                        Jämför
                    </button>
                </div>
            </div>
            
            <div class="site-card-footer">
                <span class="domain-link" onclick="visitSite('${site.domain}')">${site.domain}</span>
                <div class="technical-badges">
                    ${site.has_ssl ? '<span class="tech-badge ssl">🔒 SSL</span>' : ''}
                    ${site.has_mobile_meta ? '<span class="tech-badge mobile">📱 Mobile</span>' : ''}
                </div>
            </div>
        </div>
    `;
}

function createBadges(site) {
    if (!site.badges || site.badges.length === 0) return '';
    
    return `
        <div class="badges">
            ${site.badges.map(badge => `<span class="badge badge-${badge.toLowerCase()}">${badge}</span>`).join('')}
        </div>
    `;
}

function createQualityMeter(score) {
    const percentage = Math.min(100, Math.max(0, score));
    const colorClass = percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : 'average';
    
    return `
        <div class="quality-meter">
            <div class="quality-label">Kvalitetspoäng: <strong>${percentage}/100</strong></div>
            <div class="quality-bar">
                <div class="quality-fill ${colorClass}" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

function createPriceInfo(site) {
    if (!site.pricing || site.pricing.length === 0) {
        return site.priceRange ? `
            <div class="price-info">
                <span class="price-label">Pris:</span>
                <span class="price-value">${site.priceRange}</span>
            </div>
        ` : '';
    }
    
    const minPrice = site.pricing[0];
    const priceRange = site.pricing.length > 1 ? `${minPrice} - ${site.pricing[site.pricing.length - 1]}` : minPrice;
    
    return `
        <div class="price-info">
            <span class="price-label">Priser från:</span>
            <span class="price-value">${priceRange}</span>
        </div>
    `;
}

function createSpecialtyTags(specialties) {
    if (specialties.length === 0) return '';
    
    return `
        <div class="specialty-tags">
            ${specialties.slice(0, 3).map(specialty => 
                `<span class="specialty-tag">${specialty}</span>`
            ).join('')}
        </div>
    `;
}

function createSocialIcons(socialMedia) {
    const platforms = Object.keys(socialMedia);
    if (platforms.length === 0) return '';
    
    const iconMap = {
        facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/></svg>', 
        youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
        linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
    };
    
    return `
        <div class="social-icons">
            ${platforms.map(platform => 
                `<a href="${socialMedia[platform]}" target="_blank" class="social-icon social-${platform}" title="${platform}">
                    ${iconMap[platform] || '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3.445 17.827c-.684 1.684-2.264 2.854-4.102 2.854-2.478 0-4.479-2.009-4.479-4.488 0-2.478 2.001-4.488 4.479-4.488 1.838 0 3.418 1.17 4.102 2.854h3.277c-.823-3.503-3.935-6.114-7.379-6.114-4.346 0-7.87 3.524-7.87 7.87s3.524 7.87 7.87 7.87c3.444 0 6.556-2.611 7.379-6.114h-3.277v-.244z"/></svg>'}
                </a>`
            ).join('')}
        </div>
    `;
}

function setupSmartFilters() {
    const filtersContainer = document.querySelector('.smart-filters');
    if (!filtersContainer) return;
    
    const filterButtons = Object.keys(smartFilters).map(filterKey => {
        const count = smartFilters[filterKey](siteData).length;
        return `
            <button class="smart-filter-btn" data-filter="${filterKey}" onclick="applySmartFilter('${filterKey}')">
                ${filterKey} (${count})
            </button>
        `;
    }).join('');
    
    filtersContainer.innerHTML = `
        <button class="smart-filter-btn active" data-filter="alla" onclick="applySmartFilter('alla')">
            ALLA (${siteData.length})
        </button>
        ${filterButtons}
    `;
}

function applySmartFilter(filterKey) {
    // Update active button
    document.querySelectorAll('.smart-filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${filterKey}"]`).classList.add('active');
    
    if (filterKey === 'alla') {
        filteredData = [...siteData];
    } else {
        filteredData = smartFilters[filterKey](siteData);
    }
    
    currentFilter = filterKey;
    displaySites(filteredData);
    
    // Analytics event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'filter_applied', {
            'filter_type': filterKey,
            'results_count': filteredData.length
        });
    }
}

function setupAdvancedSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(event) {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
            const query = event.target.value.trim();
            
            if (query.length < 2) {
                displaySites(filteredData);
                return;
            }
            
            const searchResults = advancedSearch(query);
            displaySites(searchResults);
            
            // Show search stats
            updateSearchStats(query, searchResults.length);
        }, 300);
    });
    
    // Add autocomplete functionality
    setupAutocomplete(searchInput);
}

function setupAutocomplete(input) {
    const suggestions = [
        ...siteData.map(site => site.name),
        ...siteData.flatMap(site => site.specialties || []),
        ...siteData.flatMap(site => site.categories || [])
    ].filter((item, index, arr) => arr.indexOf(item) === index);
    
    // Simple autocomplete implementation
    input.addEventListener('focus', function() {
        // Create dropdown with suggestions
        createAutocompleteDropdown(input, suggestions);
    });
}

function setupPersonalizationEngine() {
    // Check if user has preferences stored
    const userPrefs = localStorage.getItem('healthPlatformPrefs');
    
    if (userPrefs) {
        const preferences = JSON.parse(userPrefs);
        displayPersonalizedRecommendations(preferences);
    } else {
        // Show preference selection modal
        showPreferenceModal();
    }
}

function displayPersonalizedRecommendations(preferences = {}) {
    const recommendations = getPersonalizedRecommendations(preferences);
    const container = document.getElementById('personalized-section');
    
    if (container && recommendations.length > 0) {
        container.innerHTML = `
            <div class="personalized-header">
                <h2>🎯 Rekommenderat för dig</h2>
                <p>Baserat på dina preferenser och AI-analys</p>
            </div>
            <div class="personalized-grid">
                ${recommendations.map(site => createCompactCard(site)).join('')}
            </div>
        `;
        container.style.display = 'block';
    }
}

function createCompactCard(site) {
    return `
        <div class="compact-card" onclick="openSiteDetails('${site.domain}')">
            <div class="compact-header">
                <h4>${site.name}</h4>
                <div class="compact-rating">${site.rating}/5 ⭐</div>
            </div>
            <p class="compact-description">${site.shortDescription}</p>
            <div class="compact-badges">
                ${(site.badges || []).slice(0, 2).map(badge => 
                    `<span class="compact-badge">${badge}</span>`
                ).join('')}
            </div>
            <div class="compact-footer">
                <span class="compact-price">${site.priceRange || 'Kontakta'}</span>
                <span class="compact-speed">${formatSpeed(site.response_time)}</span>
            </div>
        </div>
    `;
}

// Utility functions
function formatSpeed(responseTime) {
    if (!responseTime) return 'N/A';
    if (responseTime < 0.3) return '⚡ Snabb';
    if (responseTime < 1.0) return '✅ Bra';
    if (responseTime < 2.0) return '⚠️ Långsam';
    return '🐌 Mycket långsam';
}

function getSpeedClass(responseTime) {
    if (!responseTime) return 'unknown';
    if (responseTime < 0.3) return 'fast';
    if (responseTime < 1.0) return 'good';
    if (responseTime < 2.0) return 'slow';
    return 'very-slow';
}

function formatLanguages(languages) {
    if (!languages || languages.length === 0) return 'N/A';
    return languages.includes('svenska') || languages.includes('sv') ? 'Svenska' : 'Engelska';
}

function createStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }
    if (halfStar) {
        stars += '⭐'; // Simplified - showing full star for half
    }
    
    return stars;
}

function updatePlatformStats(sites) {
    const statsContainer = document.getElementById('platform-stats');
    if (!statsContainer) return;
    
    const avgQuality = sites.reduce((sum, site) => sum + (site.quality_score || 70), 0) / sites.length;
    const fastSites = sites.filter(site => site.response_time && site.response_time < 0.5).length;
    const freeSites = sites.filter(site => 
        site.priceRange === 'Gratis' || 
        (site.pricing && site.pricing.some(p => p.includes('gratis')))
    ).length;
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${sites.length}</span>
            <span class="stat-label">Sajter analyserade</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${Math.round(avgQuality)}</span>
            <span class="stat-label">Snitt kvalitetspoäng</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${fastSites}</span>
            <span class="stat-label">Snabba sajter (&lt;0.5s)</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${freeSites}</span>
            <span class="stat-label">Gratis alternativ</span>
        </div>
    `;
}

function updateSearchStats(query, resultCount) {
    const searchStats = document.getElementById('search-stats');
    if (searchStats) {
        searchStats.innerHTML = `
            <span class="search-query">Sökresultat för "${query}": </span>
            <span class="search-count">${resultCount} träffar</span>
        `;
        searchStats.style.display = 'block';
    }
}

// Advanced interaction functions
function openSiteDetails(domain) {
    const site = siteData.find(s => s.domain === domain);
    if (!site) return;
    
    // Create and show modal with detailed information
    const modal = createDetailModal(site);
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'site_details_viewed', {
            'site_domain': domain,
            'site_name': site.name
        });
    }
}

function createDetailModal(site) {
    const modal = document.createElement('div');
    modal.className = 'detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${site.name}</h2>
                <button class="close-modal" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="detail-section">
                    <h3>Om sajten</h3>
                    <p>${site.description}</p>
                </div>
                
                <div class="detail-metrics">
                    <div class="metric-card">
                        <h4>Teknisk prestanda</h4>
                        <div class="metric-row">
                            <span>Laddningstid:</span>
                            <span class="metric-value">${formatSpeed(site.response_time)}</span>
                        </div>
                        <div class="metric-row">
                            <span>Mobiloptimerad:</span>
                            <span class="metric-value">${site.has_mobile_meta ? '✅ Ja' : '❌ Nej'}</span>
                        </div>
                        <div class="metric-row">
                            <span>SSL-säkert:</span>
                            <span class="metric-value">${site.has_ssl ? '🔒 Ja' : '⚠️ Nej'}</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <h4>Innehåll & Tjänster</h4>
                        <div class="metric-row">
                            <span>Kurser:</span>
                            <span class="metric-value">${site.courses || 0}</span>
                        </div>
                        <div class="metric-row">
                            <span>Språk:</span>
                            <span class="metric-value">${formatLanguages(site.languages)}</span>
                        </div>
                        <div class="metric-row">
                            <span>Kategorier:</span>
                            <span class="metric-value">${(site.categories || []).join(', ')}</span>
                        </div>
                    </div>
                </div>
                
                ${site.specialties && site.specialties.length > 0 ? `
                    <div class="detail-section">
                        <h3>Specialiteter</h3>
                        <div class="specialty-list">
                            ${site.specialties.map(s => `<span class="specialty-item">${s}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${Object.keys(site.social_media || {}).length > 0 ? `
                    <div class="detail-section">
                        <h3>Sociala medier</h3>
                        <div class="social-links">
                            ${Object.entries(site.social_media).map(([platform, url]) => 
                                `<a href="${url}" target="_blank" class="social-link">${platform}</a>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="visit-btn primary" onclick="visitSite('${site.domain}')">
                    BESÖK ${site.name.toUpperCase()}
                </button>
                <button class="compare-btn" onclick="addToComparison('${site.domain}')">
                    Lägg till jämförelse
                </button>
            </div>
        </div>
    `;
    return modal;
}

function closeModal(button) {
    const modal = button.closest('.detail-modal');
    if (modal) {
        modal.remove();
    }
}

function visitSite(domain) {
    window.open(`https://${domain}`, '_blank');
    
    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'site_visit', {
            'site_domain': domain
        });
    }
}

function addToComparison(domain) {
    // Implementation for comparison functionality
    const comparisons = JSON.parse(localStorage.getItem('siteComparisons') || '[]');
    
    if (!comparisons.includes(domain)) {
        comparisons.push(domain);
        localStorage.setItem('siteComparisons', JSON.stringify(comparisons));
        
        // Show notification
        showNotification(`${domain} tillagd för jämförelse (${comparisons.length})`);
        
        // Update comparison counter
        updateComparisonCounter(comparisons.length);
    } else {
        showNotification(`${domain} finns redan i jämförelsen`);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateComparisonCounter(count) {
    const counter = document.getElementById('comparison-counter');
    if (counter) {
        counter.textContent = count;
        counter.style.display = count > 0 ? 'inline' : 'none';
    }
}

// Category filtering (legacy support)
function filterByCategory(categoryName) {
    const mappedCategories = {
        'coaching': ['COACHING'],
        'nutrition': ['HÄLSOKOST', 'KOSTTILLSKOTT'],
        'supplements': ['KOSTTILLSKOTT'],
        'fitness': ['TRÄNING', 'APPS'],
        'holistic': ['MINDFULNESS', 'COACHING'],
        'podcasts': ['PODDAR']
    };
    
    if (categoryName === 'alla') {
        filteredData = [...siteData];
        showPodcasts = false;
    } else if (categoryName === 'podcasts') {
        showPodcasts = true;
        filteredData = podcastData;
    } else {
        showPodcasts = false;
        const categories = mappedCategories[categoryName] || [categoryName.toUpperCase()];
        filteredData = siteData.filter(site => 
            site.categories && site.categories.some(cat => categories.includes(cat))
        );
    }
    
    displaySites(filteredData);
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[onclick*="${categoryName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

// Filter Panel functionality
function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const backdrop = document.querySelector('.filter-backdrop');
    
    if (panel.classList.contains('active')) {
        closeFilterPanel();
    } else {
        panel.classList.add('active');
        backdrop.classList.add('active');
        updateFilterCounts();
    }
}

function closeFilterPanel() {
    document.getElementById('filterPanel').classList.remove('active');
    document.querySelector('.filter-backdrop').classList.remove('active');
}

function updateFilterCounts() {
    // Update category counts
    const categories = {
        'alla': siteData.length,
        'coaching': siteData.filter(s => s.categories?.includes('COACHING')).length,
        'nutrition': siteData.filter(s => s.categories?.some(c => ['HÄLSOKOST', 'KOSTTILLSKOTT'].includes(c))).length,
        'supplements': siteData.filter(s => s.categories?.includes('KOSTTILLSKOTT')).length,
        'fitness': siteData.filter(s => s.categories?.some(c => ['TRÄNING', 'APPS'].includes(c))).length,
        'apps': siteData.filter(s => s.categories?.includes('APPS')).length
    };
    
    Object.keys(categories).forEach(key => {
        const option = document.querySelector(`#categoryFilters [data-filter="${key}"] .count`);
        if (option) option.textContent = categories[key];
    });
    
    // Update language counts
    const languages = {
        'alla': siteData.length,
        'svenska': siteData.filter(s => s.language === 'Svenska').length,
        'engelska': siteData.filter(s => s.language === 'Engelska').length
    };
    
    Object.keys(languages).forEach(key => {
        const option = document.querySelector(`#languageFilters [data-filter="${key}"] .count`);
        if (option) option.textContent = languages[key];
    });
    
    // Update smart filter counts
    const smartFilterContainer = document.getElementById('smartFilterOptions');
    if (smartFilterContainer) {
        smartFilterContainer.innerHTML = Object.keys(smartFilters).map(filterKey => {
            const count = smartFilters[filterKey](siteData).length;
            const isActive = currentSmartFilter === filterKey ? 'active' : '';
            return `
                <div class="filter-option ${isActive}" data-filter="${filterKey}" onclick="applyFilter('${filterKey}', 'smart')">
                    <span>${filterKey}</span>
                    <span class="count">${count}</span>
                </div>
            `;
        }).join('');
    }
}

function applyFilter(filter, type) {
    if (type === 'category') {
        // Update active state
        document.querySelectorAll('#categoryFilters .filter-option').forEach(opt => opt.classList.remove('active'));
        event.target.closest('.filter-option').classList.add('active');
        
        // Clear smart filter
        document.querySelectorAll('#smartFilterOptions .filter-option').forEach(opt => opt.classList.remove('active'));
        currentSmartFilter = null;
        
        currentFilter = filter;
        filterByCategory(filter);
    } else if (type === 'language') {
        // Update active state
        document.querySelectorAll('#languageFilters .filter-option').forEach(opt => opt.classList.remove('active'));
        event.target.closest('.filter-option').classList.add('active');
        
        currentLanguageFilter = filter;
        applyLanguageFilter();
    } else if (type === 'smart') {
        // Update active state
        document.querySelectorAll('#smartFilterOptions .filter-option').forEach(opt => opt.classList.remove('active'));
        
        if (currentSmartFilter === filter) {
            currentSmartFilter = null;
        } else {
            event.target.closest('.filter-option').classList.add('active');
            currentSmartFilter = filter;
        }
        
        applySmartFilter(currentSmartFilter || 'alla');
    }
    
    closeFilterPanel();
}

function applyLanguageFilter() {
    // Apply all current filters including language
    let filtered = [...siteData];
    
    // Apply category filter first
    if (currentFilter !== 'alla') {
        const mappedCategories = {
            'coaching': ['COACHING'],
            'nutrition': ['HÄLSOKOST', 'KOSTTILLSKOTT'],
            'supplements': ['KOSTTILLSKOTT'],
            'fitness': ['TRÄNING', 'APPS'],
            'apps': ['APPS']
        };
        
        const categories = mappedCategories[currentFilter] || [currentFilter.toUpperCase()];
        filtered = filtered.filter(site => 
            site.categories && site.categories.some(cat => categories.includes(cat))
        );
    }
    
    // Apply language filter
    if (currentLanguageFilter === 'svenska') {
        filtered = filtered.filter(site => site.language === 'Svenska');
    } else if (currentLanguageFilter === 'engelska') {
        filtered = filtered.filter(site => site.language === 'Engelska');
    }
    
    // Apply smart filter if active
    if (currentSmartFilter && smartFilters[currentSmartFilter]) {
        filtered = smartFilters[currentSmartFilter](filtered);
    }
    
    // Sort with Swedish sites first
    filtered.sort((a, b) => {
        // Swedish sites always come first
        if (a.language === 'Svenska' && b.language !== 'Svenska') return -1;
        if (a.language !== 'Svenska' && b.language === 'Svenska') return 1;
        
        // Then by recommendation status
        if (a.is_recommended && !b.is_recommended) return -1;
        if (!a.is_recommended && b.is_recommended) return 1;
        
        // Finally by quality score
        return b.quality_score - a.quality_score;
    });
    
    filteredData = filtered;
    displaySites(filtered);
}

function resetAllFilters() {
    // Reset category filter
    currentFilter = 'alla';
    document.querySelectorAll('#categoryFilters .filter-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('#categoryFilters [data-filter="alla"]').classList.add('active');
    
    // Reset language filter
    currentLanguageFilter = 'alla';
    document.querySelectorAll('#languageFilters .filter-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector('#languageFilters [data-filter="alla"]').classList.add('active');
    
    // Reset smart filter
    currentSmartFilter = null;
    document.querySelectorAll('#smartFilterOptions .filter-option').forEach(opt => opt.classList.remove('active'));
    
    filterByCategory('alla');
    closeFilterPanel();
}

// Update comparison functionality for new button
function goToComparison() {
    const comparisons = JSON.parse(localStorage.getItem('siteComparisons') || '[]');
    if (comparisons.length > 0) {
        window.location.href = `compare.html?sites=${comparisons.join(',')}`;
    } else {
        showNotification('Välj minst en sajt att jämföra först');
    }
}

// Initialize comparison counter on page load
document.addEventListener('DOMContentLoaded', function() {
    const comparisons = JSON.parse(localStorage.getItem('siteComparisons') || '[]');
    updateComparisonCounter(comparisons.length);
    
    // Add click handler for comparison link
    const compareLink = document.querySelector('.compare-link');
    if (compareLink) {
        compareLink.addEventListener('click', function(e) {
            e.preventDefault();
            const comparisons = JSON.parse(localStorage.getItem('siteComparisons') || '[]');
            if (comparisons.length > 0) {
                // Navigate to compare page with selected sites
                window.location.href = `compare.html?sites=${comparisons.join(',')}`;
            } else {
                showNotification('Välj minst en sajt att jämföra');
            }
        });
    }
});

console.log('🚀 Avancerad hälsoplattform JavaScript laddat!');
console.log('✨ AI-rekommendationer, smarta filter och avancerad sökning aktiverad');

