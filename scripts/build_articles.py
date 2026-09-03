import os
import re
import yaml
import json

# Relative Paths Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_PATH = os.path.join(BASE_DIR, "templates", "template.html")
SOURCE_FOLDER = os.path.join(BASE_DIR, "markdown_articles")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "articles")
DATA_DIR = os.path.join(BASE_DIR, "data")
JSON_OUTPUT = os.path.join(DATA_DIR, "articles.json")
ALL_ARTICLES_HTML = os.path.join(BASE_DIR, "categories", "all-articles.html")

def parse_frontmatter(file_content):
    """YAML Frontmatter metadata နှင့် Content ကို ခွဲထုတ်ပေးသည့် Function"""
    frontmatter_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", file_content, re.DOTALL)
    if frontmatter_match:
        yaml_str = frontmatter_match.group(1)
        body = frontmatter_match.group(2)
        metadata = yaml.safe_load(yaml_str)
        return metadata, body
    return {}, file_content

def build_articles():
    if not os.path.exists(TEMPLATE_PATH):
        print(f"❌ Error: {TEMPLATE_PATH} ရှာမတွေ့ပါ။")
        return

    if not os.path.exists(SOURCE_FOLDER):
        print(f"❌ Error: {SOURCE_FOLDER} folder ရှာမတွေ့ပါ။")
        return

    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)

    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template_html = f.read()

    articles_data = []

    # 1. Markdown ဖိုင်များကို ဖတ်ပြီး HTML ဖိုင်များ တည်ဆောက်ခြင်း
    for filename in os.listdir(SOURCE_FOLDER):
        if filename.endswith(".md") or filename.endswith(".html"):
            filepath = os.path.join(SOURCE_FOLDER, filename)
            
            with open(filepath, "r", encoding="utf-8") as f:
                raw_content = f.read()

            metadata, body = parse_frontmatter(raw_content)

            title = metadata.get("title", "Untitled")
            date = metadata.get("date", "2026-09-03")
            category = metadata.get("category", "Basics")
            level = metadata.get("level", "Beginner")
            read_time = metadata.get("read_time", "3 min read")
            description = metadata.get("description", "")
            prev_article = metadata.get("prev_article", "#")
            next_article = metadata.get("next_article", "#")

            output_html = template_html.replace("{{ARTICLE_TITLE}}", str(title))
            output_html = output_html.replace("{{ARTICLE_DATE}}", str(date))
            output_html = output_html.replace("{{ARTICLE_CATEGORY}}", str(category))
            output_html = output_html.replace("{{ARTICLE_LEVEL}}", str(level))
            output_html = output_html.replace("{{READ_TIME}}", str(read_time))
            output_html = output_html.replace("{{ARTICLE_DESCRIPTION}}", str(description))
            output_html = output_html.replace("{{PREV_ARTICLE}}", str(prev_article))
            output_html = output_html.replace("{{NEXT_ARTICLE}}", str(next_article))
            output_html = output_html.replace("{{ARTICLE_CONTENT}}", body.strip())

            output_filename = filename.rsplit(".", 1)[0] + ".html"
            output_filepath = os.path.join(OUTPUT_FOLDER, output_filename)

            with open(output_filepath, "w", encoding="utf-8") as f:
                f.write(output_html)

            articles_data.append({
                "title": title,
                "url": f"../articles/{output_filename}",
                "date": str(date),
                "category": category,
                "level": level,
                "description": description,
                "readingTime": read_time
            })

            print(f"✅ Built Article: {output_filepath}")

    # 2. articles.json ထဲသို့ Save ပြုလုပ်ခြင်း
    with open(JSON_OUTPUT, "w", encoding="utf-8") as jf:
        json.dump(articles_data, jf, ensure_ascii=False, indent=4)

    # 3. categories/all-articles.html ကို Auto-Update ပြုလုပ်ခြင်း
    if os.path.exists(ALL_ARTICLES_HTML):
        update_all_articles_page(articles_data)

    print(f"\n🎉 All builds completed! Updated {len(articles_data)} articles.")

def update_all_articles_page(articles_data):
    """all-articles.html အတွင်းသို့ HTML Article Cards များကို အလိုအလျောက် ထည့်သွင်းပေးသည့် Function"""
    with open(ALL_ARTICLES_HTML, "r", encoding="utf-8") as f:
        content = f.read()

    cards_html = ""
    for idx, article in enumerate(articles_data, 1):
        num_str = f"{idx:02d}"
        cards_html += f'''
<a class="related-card searchable" href="{article['url']}">
    <span class="article-number">{num_str}</span>
    <h3>{article['title']}</h3>
    <p class="article-meta">
        {article['category']} • {article['level']}<br/>
        📅 {article['date']}<br/>
        ⏱️ {article['readingTime']}
    </p>
    <p>{article['description']}</p>
    <span class="read-more">Read Article →</span>
</a>'''

    # all-articles.html ထဲက <!-- AUTO-ARTICLES-START --> နဲ့ <!-- AUTO-ARTICLES-END --> ကြားထဲ Inject လုပ်မည်
    pattern_old = r"(<!-- AUTO-ARTICLES-START -->)(.*?)(<!-- AUTO-ARTICLES-END -->)"
    pattern_new = r"(<!-- ARTICLES_LIST_START -->)(.*?)(<!-- ARTICLES_LIST_END -->)"

    if re.search(pattern_old, content, re.DOTALL):
        updated_content = re.sub(pattern_old, f"\\1\n{cards_html}\n\\3", content, flags=re.DOTALL)
        with open(ALL_ARTICLES_HTML, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print(f"✅ Updated Category Page (Old Marker): {ALL_ARTICLES_HTML}")
    elif re.search(pattern_new, content, re.DOTALL):
        updated_content = re.sub(pattern_new, f"\\1\n{cards_html}\n\\3", content, flags=re.DOTALL)
        with open(ALL_ARTICLES_HTML, "w", encoding="utf-8") as f:
            f.write(updated_content)
        print(f"✅ Updated Category Page (New Marker): {ALL_ARTICLES_HTML}")

if __name__ == "__main__":
    build_articles()
