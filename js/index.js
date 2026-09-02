/* =====================================================
   FIBER OPTIC HUB — DYNAMIC JSON SEARCH SYSTEM
   - Mobile Menu Navigation
   - Asynchronous JSON Index Fetching
   - Multi-folder Relative Path Handling
===================================================== */

// 1. MOBILE MENU TOGGLE
function toggleMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const menuBtn = document.querySelector('.menu');
    if (mobileNav) {
        mobileNav.classList.toggle('show');
        const isExpanded = mobileNav.classList.contains('show');
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', isExpanded);
        }
    }
}

function closeMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const menuBtn = document.querySelector('.menu');
    if (mobileNav) {
        mobileNav.classList.remove('show');
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    }
}

// 2. DYNAMIC SEARCH INDEX FETCHING & REALTIME SEARCH
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput") || document.querySelector(".search-box input");
    const searchDropdown = document.getElementById("searchResults") || document.querySelector(".search-results-dropdown");

    if (!searchInput || !searchDropdown) return;

    let articlesIndex = [];
    
    // Determine relative path for data/articles.json based on current page location
    const currentPath = window.location.pathname;
    const isSubFolder = currentPath.includes("/articles/") || currentPath.includes("/categories/");
    const jsonPath = isSubFolder ? "../data/articles.json" : "data/articles.json";

    // Fetch Articles JSON Data dynamically
    fetch(jsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load articles index");
            }
            return response.json();
        })
        .then(data => {
            articlesIndex = data;
        })
        .catch(error => {
            console.error("Search Index Error:", error);
        });

    // Real-time Input Event Listener
    searchInput.addEventListener("input", function () {
        const query = this.value.trim().toLowerCase();

        if (query.length === 0) {
            searchDropdown.innerHTML = "";
            searchDropdown.style.display = "none";
            return;
        }

        if (articlesIndex.length === 0) {
            searchDropdown.innerHTML = `<div class="search-no-results" style="padding: 15px; color: #b8c7d9;">ဆောင်းပါးများ ရယူနေပါသည်...</div>`;
            searchDropdown.style.display = "block";
            return;
        }

        // Filter search index (articles.json ၏ Key အမည်များနှင့် ကိုက်ညီအောင် ပြင်ဆင်ထားသည်)
        const results = articlesIndex.filter(article => {
            return (
                (article.title && article.title.toLowerCase().includes(query)) ||
                (article.category && article.category.toLowerCase().includes(query)) ||
                (article.description && article.description.toLowerCase().includes(query))
            );
        });

        renderSearchResults(results, query, searchDropdown, isSubFolder);
    });

    // Close search dropdown on outside click
    document.addEventListener("click", function (e) {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.style.display = "none";
        }
    });
});

// 3. RENDER SEARCH RESULTS IN DROPDOWN
function renderSearchResults(results, query, dropdown, isSubFolder) {
    if (results.length === 0) {
        dropdown.innerHTML = `<div class="search-no-results" style="padding: 15px; color: #b8c7d9;">"${query}" နှင့် ပတ်သက်သော ဆောင်းပါး ရှာမတွေ့ပါ။</div>`;
        dropdown.style.display = "block";
        return;
    }

    let html = `<div class="search-results-header">
                    <span>ရှာဖွေတွေ့ရှိချက် (${results.length} ခု)</span>
                </div>`;

    const urlPrefix = isSubFolder ? "../" : "";

    results.forEach(item => {
        html += `
            <a href="${urlPrefix}${item.url}" class="search-result-card">
                <div class="search-result-content">
                    <h3>${item.title}</h3>
                    <div class="search-result-meta">🏷️ ${item.category} • 📊 ${item.level}</div>
                    <p>${item.description || ''}</p>
                </div>
            </a>
        `;
    });

    dropdown.innerHTML = html;
    dropdown.style.display = "block";
}

// 4. SOCIAL SHARE LINKS
document.addEventListener("DOMContentLoaded", function() {
    const currentUrl = encodeURIComponent(window.location.href);
    const fbBtn = document.getElementById("shareFacebook");
    const tgBtn = document.getElementById("shareTelegram");

    if (fbBtn) {
        fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
    }
    if (tgBtn) {
        tgBtn.href = `https://t.me/share/url?url=${currentUrl}`;
    }
});
