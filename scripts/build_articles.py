import os
import json
from bs4 import BeautifulSoup

# Paths
ARTICLES_DIR = 'articles'
CATEGORIES_DIR = 'categories'
DATA_DIR = 'data'
JSON_OUTPUT = os.path.join(DATA_DIR, 'articles.json')

def calculate_reading_time(text):
    words = text.split()
    word_count = len(words)
    minutes = max(1, round(word_count / 200))
    return f"{minutes} min read"

def update_header_and_footer(filepath, is_article=True):
    """HTML ဖိုင်များ (Articles သို့မဟုတ် Categories) တွင် Header, Footer နှင့် Script များကို အလိုအလျောက် ထည့်သွင်း/ပြင်ဆင်ပေးသော Function"""
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    body = soup.find('body')
    if not body:
        return soup

    # လမ်းကြောင်းအကွာအဝေးအလိုက် Link များကို ညှိရန် (articles/ က ../ သုံးရပြီး categories/ ကလည်း ../ သုံးရသည်)
    prefix = "../"

    # 1. Reading Progress Bar (Articles များအတွက်သာ)
    if is_article and not soup.find(id='progressBar'):
        progress_html = '''
        <div class="reading-progress-container">
            <div class="reading-progress-bar" id="progressBar"></div>
        </div>
        '''
        body.insert(0, BeautifulSoup(progress_html, 'html.parser'))

    # 2. Header ထည့်သွင်းခြင်း (သို့မဟုတ် Logo အဟောင်းကို 🌐 အိုင်ကွန်ဖြင့် အစားထိုးခြင်း)
    header_html = f'''
    <header>
        <div class="logo">🌐 Fiber <span>Optic Hub</span></div>
        <nav class="main-nav">
            <a href="{prefix}index.html">Home</a>
            <a href="{prefix}index.html#topics">Learn</a>
            <a href="{prefix}index.html#articles">Articles</a>
            <a href="{prefix}index.html#about">About</a>
        </nav>
        <button class="menu" type="button" aria-label="Open menu" aria-expanded="false" onclick="toggleMenu()">☰</button>
    </header>
    <div id="mobileMenu" class="mobile-menu">
        <a href="{prefix}index.html" onclick="closeMenu()">🏠 Home</a>
        <a href="{prefix}index.html#topics" onclick="closeMenu()">📚 Learn</a>
        <a href="{prefix}index.html#articles" onclick="closeMenu()">📰 Articles</a>
        <a href="{prefix}index.html#about" onclick="closeMenu()">ℹ️ About</a>
    </div>
    '''

    # Header ဟောင်း ရှိပြီးသားဆိုရင် ဖယ်ရှားမည်
    existing_header = soup.find('header')
    if existing_header:
        existing_header.decompose()
    
    # Mobile menu ဟောင်း ရှိပြီးသားဆိုရင်ပါ ဖယ်ရှားမည်
    existing_mobile_menu = soup.find(id='mobileMenu')
    if existing_mobile_menu:
        existing_mobile_menu.decompose()

    # Header အသစ်ကို ထည့်သွင်းခြင်း
    progress_div = soup.find(class_='reading-progress-container')
    if progress_div:
        progress_div.insert_after(BeautifulSoup(header_html, 'html.parser'))
    else:
        body.insert(0, BeautifulSoup(header_html, 'html.parser'))

        # 3. Footer ထည့်သွင်းခြင်း (🌐 အိုင်ကွန်အသစ်ဖြင့်)
    existing_footer = soup.find('footer')
    if existing_footer:
        existing_footer.decompose()

    footer_html = '''
    <footer>
        <div class="logo" style="font-size: 1.1rem; margin-bottom: 8px;">🌐 Fiber <span>Optic Hub</span></div>
        <p>© 2026 Fiber Optic Hub. All rights reserved.</p>
        <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 5px;">Learn • Practice • Share</p>
    </footer>
    '''
    body.append(BeautifulSoup(footer_html, 'html.parser'))

    # 4. Script JS ထည့်သွင်းခြင်း (မရှိသေးမှသာ)
    if not soup.find('script', {'src': f'{prefix}js/index.js'}):
        script_html = f'<script src="{prefix}js/index.js"></script>'
        body.append(BeautifulSoup(script_html, 'html.parser'))

    return soup

def build_articles():
    if not os.path.exists(ARTICLES_DIR):
        print(f"Error: {ARTICLES_DIR} folder not found!")
        return

    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    articles_data = []

    # --- အပိုင်း ၁။ Articles များကို တည်ဆောက်ခြင်း ---
    for filename in os.listdir(ARTICLES_DIR):
        if filename.endswith('.html'):
            filepath = os.path.join(ARTICLES_DIR, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
            
            title_meta = soup.find('meta', attrs={'name': 'article-title'})
            date_meta = soup.find('meta', attrs={'name': 'article-date'})
            category_meta = soup.find('meta', attrs={'name': 'article-category'})
            level_meta = soup.find('meta', attrs={'name': 'article-level'})
            desc_meta = soup.find('meta', attrs={'name': 'article-description'})
            
            title = title_meta['content'] if title_meta else "Untitled"
            date = date_meta['content'] if date_meta else ""
            category = category_meta['content'] if category_meta else "General"
            level = level_meta['content'] if level_meta else "Beginner"
            description = desc_meta['content'] if desc_meta else ""
            
            article_content_tag = soup.find('article', class_='article-content')
            reading_time = "3 min read"
            if article_content_tag:
                reading_time = calculate_reading_time(article_content_tag.get_text())

            # Header နှင့် အခြား Shared Component များကို Update လုပ်ရန်
            soup = update_header_and_footer(filepath, is_article=True)

            # Article Meta ထဲတွင် Reading Time ကို အလိုအလျောက် ပေါင်းထည့်ရန်
            meta_p = soup.find('p', class_='article-meta')
            if meta_p and "min read" not in meta_p.text:
                updated_meta_html = f"{category} • {level} • ⏱️ {reading_time}<br>Published: {date.split('T')[0]}"
                meta_p.clear()
                meta_p.append(BeautifulSoup(updated_meta_html, 'html.parser'))

            # Social Share Section ထည့်သွင်းခြင်း
            main_tag = soup.find('main', class_='article-page')
            if main_tag and not soup.find(class_='social-share-container'):
                share_html = '''
                <div class="social-share-container">
                    <span>📌 ဤဆောင်းပါးကို သူငယ်ချင်းများထံ မျှဝေရန်:</span>
                    <div class="share-buttons-group">
                        <a href="#" id="shareFacebook" target="_blank" class="share-btn fb">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            <span>Facebook</span>
                        </a>
                        <a href="#" id="shareTelegram" target="_blank" class="share-btn tg">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.622-.168.9-.5 1.201-.82 1.23-.697.064-1.228-.46-1.903-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.12.098.153.228.166.331.011.093.024.304.007.469z"/></svg>
                            <span>Telegram</span>
                        </a>
                    </div>
                </div>
                '''
                main_tag.insert_after(BeautifulSoup(share_html, 'html.parser'))

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(str(soup))

            articles_data.append({
                "title": title,
                "url": f"articles/{filename}",
                "date": date,
                "category": category,
                "level": level,
                "description": description,
                "readingTime": reading_time
            })

            print(f"Successfully Built Article: {filename}")

        # --- အပိုင်း ၂။ Categories ဖိုင်များကိုပါ အလိုအလျောက် Header Update လုပ်ခြင်း ---
    if os.path.exists(CATEGORIES_DIR):
        for cat_filename in os.listdir(CATEGORIES_DIR):
            if cat_filename.endswith('.html'):
                cat_filepath = os.path.join(CATEGORIES_DIR, cat_filename)
                
                # Header Update လုပ်ခြင်း
                soup = update_header_and_footer(cat_filepath, is_article=False)
                
                # ပြင်ဆင်ပြီးသား HTML ကို ဖိုင်ထဲသို့ ပြန်လည်ရေးသားခြင်း (ဒီနေရာလေး ကျန်နေခဲ့တာပါ)
                with open(cat_filepath, 'w', encoding='utf-8') as f:
                    f.write(str(soup))
                
                print(f"Successfully Updated Category: {cat_filename}")

    # articles.json ဖိုင်သို့ ထုတ်ပေးရန်
    with open(JSON_OUTPUT, 'w', encoding='utf-8') as jf:
        json.dump(articles_data, jf, ensure_ascii=False, indent=4)
    
    print(f"\nAll builds & category updates completed successfully!")

if __name__ == '__main__':
    build_articles()

    # articles.json ဖိုင်သို့ ထုတ်ပေးရန်
    with open(JSON_OUTPUT, 'w', encoding='utf-8') as jf:
        json.dump(articles_data, jf, ensure_ascii=False, indent=4)
    
    print(f"\nAll builds & category updates completed successfully!")

if __name__ == '__main__':
    build_articles()
