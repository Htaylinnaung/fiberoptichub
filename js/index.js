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

// =====================================================
// ALL ARTICLES PAGE PAGINATION
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
    const articleList = document.getElementById("auto-article-list");
    const paginationContainer = document.getElementById("articlePagination");

    if (!articleList || !paginationContainer) return;

    // Static အနေဖြင့် ပါလာသော Card များကို ယူမည်
    const cards = Array.from(articleList.getElementsByClassName("related-card"));
    const itemsPerPage = 6; // တမျက်နှာလျှင် ပြသမည့် အရေအတွက်
    const totalPages = Math.ceil(cards.length / itemsPerPage);
    let currentPage = 1;

    if (cards.length <= itemsPerPage) return;

    function showPage(page) {
        currentPage = page;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        cards.forEach((card, index) => {
            if (index >= start && index < end) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });

        renderPaginationUI();
    }

    function renderPaginationUI() {
        paginationContainer.innerHTML = "";

        // Prev Button
        const prevBtn = document.createElement("button");
        prevBtn.innerText = "« Prev";
        prevBtn.className = "page-btn";
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            showPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        paginationContainer.appendChild(prevBtn);

        // Number Buttons
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;
            btn.className = `page-btn ${i === currentPage ? "active" : ""}`;
            btn.onclick = () => {
                showPage(i);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            paginationContainer.appendChild(btn);
        }

        // Next Button
const nextBtn = document.createElement("button");
nextBtn.innerText = "Next »";
nextBtn.className = "page-btn";
// currentPage နဲ့ totalPages တူနေရင် အလုပ်မလုပ်အောင် တိတိကျကျ စစ်မည်
nextBtn.disabled = (currentPage >= totalPages); 
nextBtn.onclick = () => {
    if (currentPage < totalPages) {
        showPage(currentPage + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
paginationContainer.appendChild(nextBtn);

    }

    // စတင်ချိန်တွင် Page 1 ကို ပြမည်
    showPage(1);
});
// =====================================================
// READING PROGRESS BAR LOGIC
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("scroll", function () {
        const progressBar = document.getElementById("progressBar");
        if (!progressBar) return;

        // စာမျက်နှာ၏ Scroll ဆွဲနိုင်သော Total Height ကို တွက်ချက်ခြင်း
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (totalHeight > 0) {
            const progress = (window.scrollY / totalHeight) * 100;
            progressBar.style.width = progress + "%";
        }
    });
});
