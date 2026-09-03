function toggleMenu() {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) mobileNav.classList.toggle('show');
}

function closeMenu() {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) mobileNav.classList.remove('show');
}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const searchDropdown = document.getElementById("searchResults");
    const articleContainer = document.getElementById("latestArticles");

    let articlesData = [];

    // Fetch JSON Data
    fetch(`data/articles.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            articlesData = data;
            renderArticles(articlesData);
        })
        .catch(err => console.error("Data Load Error:", err));

    // Render Articles function
    function renderArticles(articles) {
        if (!articleContainer) return;
        articleContainer.innerHTML = "";

        articles.forEach((item, index) => {
            const num = String(index + 1).padStart(2, '0');
            const card = document.createElement("div");
            card.className = "article-card";
            card.dataset.category = (item.category || '').toLowerCase();
            card.innerHTML = `
                <div>
                    <span class="article-number">ARTICLE ${num}</span>
                    <h3>${item.title}</h3>
                    <div class="article-meta">🏷️ ${item.category || 'General'} • 📊 ${item.level || 'Beginner'}</div>
                    <p>${item.description || ''}</p>
                </div>
                <a href="${item.url}" class="read-more">ဖတ်ရှုရန် →</a>
            `;
            articleContainer.appendChild(card);
        });
    }

    // Realtime Search
    if (searchInput && searchDropdown) {
        searchInput.addEventListener("input", function () {
            const query = this.value.trim().toLowerCase();
            if (!query) {
                searchDropdown.style.display = "none";
                return;
            }

            const filtered = articlesData.filter(a => 
                (a.title && a.title.toLowerCase().includes(query)) ||
                (a.category && a.category.toLowerCase().includes(query))
            );

            if (filtered.length === 0) {
                searchDropdown.innerHTML = `<div style="padding:10px; color:#94a3b8;">ရှာမတွေ့ပါ။</div>`;
            } else {
                searchDropdown.innerHTML = filtered.map(item => `
                    <a href="${item.url}" style="display:block; padding:10px; border-bottom:1px solid #193957; color:#fff;">
                        <strong style="color:#29b6f6;">${item.title}</strong><br>
                        <small style="color:#7890a8;">${item.category}</small>
                    </a>
                `).join('');
            }
            searchDropdown.style.display = "block";
        });
    }
});

// Category Filter
function filterCategory(category, event) {
    const cards = document.querySelectorAll('.article-card');
    const buttons = document.querySelectorAll('.pill-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');

    const selected = category.toLowerCase();
    cards.forEach(card => {
        const cat = card.dataset.category || '';
        card.style.display = (selected === 'all' || cat === selected) ? 'flex' : 'none';
    });
}

// Loss Calculator
function calculateLoss() {
    const len = parseFloat(document.getElementById('fiberLength').value) || 0;
    const splices = parseInt(document.getElementById('spliceCount').value) || 0;
    const total = (len * 0.35) + (splices * 0.1);
    document.getElementById('calcResult').innerText = `Estimated Loss: ${total.toFixed(2)} dB`;
}
