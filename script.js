// SVERIGES MEST AVANCERADE HÄLSOJÄMFÖRELSEPLATTFORM
// AI-driven recommendations & smart filtering

let currentFilter = 'alla';
let currentSmartFilter = null;
let currentLanguageFilter = 'alla';
let filteredData = [];
let showPodcasts = false;

// Force display all sites immediately when script loads
function forceDisplayAllSites() {
    if (typeof siteData !== 'undefined' && siteData.length > 0) {
        console.log('🚀 Force displaying all sites immediately');
        filteredData = [...siteData];
        displaySites(filteredData);
        return true;
    }
    return false;
}

// Try to display sites immediately
if (!forceDisplayAllSites()) {
    // If siteData not ready, wait for it
    const waitForData = setInterval(() => {
        if (forceDisplayAllSites()) {
            clearInterval(waitForData);
        }
    }, 50);
}

// Initialize the platform
document.addEventListener('DOMContentLoaded', function() {
    // Wait for siteData to be available
    if (typeof siteData === 'undefined') {
        console.log('⏳ Väntar på att siteData ska laddas...');
        // Check every 100ms for siteData to be available
        const checkDataInterval = setInterval(function() {
            if (typeof siteData !== 'undefined' && siteData.length > 0) {
                clearInterval(checkDataInterval);
                initializePlatformWithData();
            }
        }, 100);
    } else {
        initializePlatformWithData();
    }
});

function initializePlatformWithData() {
    initializePlatform();
    filteredData = [...siteData]; // Ensure all sites are shown initially
    displaySites(filteredData);
    setupSmartFilters();
    setupAdvancedSearch();
    setupPersonalizationEngine();
    
    console.log('🎯 Avancerad hälsoplattform initialiserad');
    console.log(`📊 Laddat ${siteData.length} sajter med fullständig data`);
}

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
    
    // Automatically show all sites when filters are set up
    applySmartFilter('alla');
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
    ].filter((item, index, arr) => arr.indexOf(item) === index).sort();
    
    let autocompleteContainer = null;
    
    // Create autocomplete on input
    input.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        // Remove existing dropdown
        removeAutocompleteDropdown();
        
        if (query.length < 2) return;
        
        // Filter suggestions
        const filteredSuggestions = suggestions.filter(suggestion => 
            suggestion.toLowerCase().includes(query)
        ).slice(0, 8); // Max 8 suggestions
        
        if (filteredSuggestions.length > 0) {
            createAutocompleteDropdown(input, filteredSuggestions, query);
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !autocompleteContainer?.contains(e.target)) {
            removeAutocompleteDropdown();
        }
    });
    
    // Hide dropdown on escape
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            removeAutocompleteDropdown();
        }
    });
    
    function createAutocompleteDropdown(inputElement, suggestions, query) {
        removeAutocompleteDropdown();
        
        autocompleteContainer = document.createElement('div');
        autocompleteContainer.className = 'autocomplete-dropdown';
        
        // Position dropdown
        const rect = inputElement.getBoundingClientRect();
        autocompleteContainer.style.cssText = `
            position: absolute;
            top: ${rect.bottom + window.scrollY}px;
            left: ${rect.left + window.scrollX}px;
            width: ${rect.width}px;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
        `;
        
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
                transition: background-color 0.2s;
            `;
            
            // Highlight matching text
            const regex = new RegExp(`(${query})`, 'gi');
            const highlightedText = suggestion.replace(regex, '<strong style="color: #2d6a4f;">$1</strong>');
            item.innerHTML = highlightedText;
            
            // Hover effects
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f9fafb';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
            
            // Click to select
            item.addEventListener('click', function() {
                inputElement.value = suggestion;
                removeAutocompleteDropdown();
                
                // Trigger search
                const event = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(event);
            });
            
            autocompleteContainer.appendChild(item);
        });
        
        document.body.appendChild(autocompleteContainer);
    }
    
    function removeAutocompleteDropdown() {
        if (autocompleteContainer) {
            autocompleteContainer.remove();
            autocompleteContainer = null;
        }
    }
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

