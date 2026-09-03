/* =====================================================
   FIBER OPTIC HUB — DYNAMIC JSON SEARCH SYSTEM
   - Mobile Menu Navigation
   - Asynchronous JSON Index Fetching
   - Multi-folder Relative Path Handling
   - Home Page & Category Pages Dynamic Rendering
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

    // Fetch Articles JSON Data dynamically (Cache Busting)
    fetch(`${jsonPath}?v=${new Date().getTime()}`)
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

        // Filter search index
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
// HOME PAGE & ALL ARTICLES DYNAMIC RENDER
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
    const articleContainer = document.getElementById("latestArticles") || document.getElementById("auto-article-list");
    const paginationContainer = document.getElementById("articlePagination");

    if (!articleContainer) return;

    const currentPath = window.location.pathname;
    const isSubFolder = currentPath.includes("/articles/") || currentPath.includes("/categories/");
    const jsonPath = isSubFolder ? "../data/articles.json" : "data/articles.json";

    fetch(`${jsonPath}?v=${new Date().getTime()}`)
        .then(response => response.json())
        .then(articles => {
            if (!articles || articles.length === 0) return;

            // ရက်စွဲအလိုက် စစ်ဆေးပြီး အသစ်ဆုံး ဆောင်းပါးကို အပေါ်ဆုံး စီစဉ်ခြင်း
            articles.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA;
            });

            const urlPrefix = isSubFolder ? "../" : "";

            // ၁။ Home Page (latestArticles) ဖြစ်ပါက နောက်ဆုံး ၃ ခုကို ပြမည်
            if (articleContainer.id === "latestArticles") {
                const latestThree = articles.slice(0, 3);
                articleContainer.innerHTML = "";

                latestThree.forEach((item, index) => {
                    const articleNum = String(index + 1).padStart(2, '0');
                    const card = document.createElement("div");
                    card.className = "article searchable latest-article";
                    card.innerHTML = `
                        <span class="article-number">${articleNum}</span>
                        <h3>${item.title}</h3>
                        <p class="article-meta">
                            ${item.category || 'General'} • ${item.level || 'Beginner'}
                            <br>
                            📅 ${item.date ? item.date.split('T')[0] : ''}
                        </p>
                        <p>${item.description || ''}</p>
                        <a href="${urlPrefix}${item.url}" class="read-more">Read Article →</a>
                    `;
                    articleContainer.appendChild(card);
                });
            } 
            // ၂။ Pagination ပါရှိသော All Articles Page ဖြစ်ပါက
            else if (paginationContainer) {
                const itemsPerPage = 6;
                const totalPages = Math.ceil(articles.length / itemsPerPage);
                let currentPage = 1;

                function showPage(page) {
                    currentPage = page;
                    const start = (page - 1) * itemsPerPage;
                    const end = start + itemsPerPage;
                    const pageArticles = articles.slice(start, end);

                    articleContainer.innerHTML = "";
                    pageArticles.forEach(item => {
                        const card = document.createElement("a");
                        card.className = "related-card";
                        card.href = `${urlPrefix}${item.url}`;
                        card.innerHTML = `
                            <div class="card-content">
                                <span class="category-tag">${item.category || 'General'}</span>
                                <h3>${item.title}</h3>
                                <p>${item.description || ''}</p>
                                <div class="card-meta">
                                    <span>📊 ${item.level || 'Beginner'}</span>
                                    <span>⏱️ ${item.readingTime || ''}</span>
                                </div>
                            </div>
                        `;
                        articleContainer.appendChild(card);
                    });

                    renderPaginationUI();
                }

                function renderPaginationUI() {
                    paginationContainer.innerHTML = "";
                    if (totalPages <= 1) return;

                    const prevBtn = document.createElement("button");
                    prevBtn.innerText = "« Prev";
                    prevBtn.className = "page-btn";
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.onclick = () => { showPage(currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
                    paginationContainer.appendChild(prevBtn);

                    for (let i = 1; i <= totalPages; i++) {
                        const btn = document.createElement("button");
                        btn.innerText = i;
                        btn.className = `page-btn ${i === currentPage ? "active" : ""}`;
                        btn.onclick = () => { showPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); };
                        paginationContainer.appendChild(btn);
                    }

                    const nextBtn = document.createElement("button");
                    nextBtn.innerText = "Next »";
                    nextBtn.className = "page-btn";
                    nextBtn.disabled = currentPage >= totalPages;
                    nextBtn.onclick = () => { if (currentPage < totalPages) { showPage(currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
                    paginationContainer.appendChild(nextBtn);
                }

                showPage(1);
            }
            // ၃။ Pagination မပါဘဲ auto-article-list တစ်ခုတည်း ရှိနေပါက အားလုံးကို အသစ်မှ အဟောင်း စီပြမည်
            else {
                articleContainer.innerHTML = "";
                articles.forEach(item => {
                    const card = document.createElement("a");
                    card.className = "related-card";
                    card.href = `${urlPrefix}${item.url}`;
                    card.innerHTML = `
                        <div class="card-content">
                            <span class="category-tag">${item.category || 'General'}</span>
                            <h3>${item.title}</h3>
                            <p>${item.description || ''}</p>
                            <div class="card-meta">
                                <span>📊 ${item.level || 'Beginner'}</span>
                                <span>⏱️ ${item.readingTime || ''}</span>
                            </div>
                        </div>
                    `;
                    articleContainer.appendChild(card);
                });
            }
        })
        .catch(err => console.error("Error loading articles:", err));
});

// 1. Live Search
function searchArticles() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let cards = document.querySelectorAll('.article-card');
    
    cards.forEach(card => {
        let text = card.innerText.toLowerCase();
        card.style.display = text.includes(input) ? "block" : "none";
    });
}

// 2. Category Filter
function filterCategory(category) {
    let cards = document.querySelectorAll('.article-card');
    let buttons = document.querySelectorAll('.pill-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 3. Loss Budget Calculator Tool
function calculateLoss() {
    let len = parseFloat(document.getElementById('fiberLength').value) || 0;
    let splices = parseInt(document.getElementById('spliceCount').value) || 0;
    
    // Standard: Fiber loss (1310nm) ~0.35dB/km, Splice loss ~0.1dB/splice
    let totalLoss = (len * 0.35) + (splices * 0.1);
    document.getElementById('calcResult').innerText = `Estimated Max Loss: ${totalLoss.toFixed(2)} dB`;
}
