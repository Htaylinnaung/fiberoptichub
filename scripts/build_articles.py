import os
import re
import yaml
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_PATH = os.path.join(BASE_DIR, "templates", "template.html")
SOURCE_FOLDER = os.path.join(BASE_DIR, "markdown_articles")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "articles")
DATA_DIR = os.path.join(BASE_DIR, "data")
JSON_OUTPUT = os.path.join(DATA_DIR, "articles.json")
INDEX_HTML = os.path.join(BASE_DIR, "index.html")

def parse_frontmatter(file_content):
    frontmatter_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", file_content, re.DOTALL)
    if frontmatter_match:
        return yaml.safe_load(frontmatter_match.group(1)), frontmatter_match.group(2)
    return {}, file_content

def build_articles():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)

    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template_html = f.read()

    articles_data = []

    for filename in os.listdir(SOURCE_FOLDER):
        if filename.endswith(".md"):
            filepath = os.path.join(SOURCE_FOLDER, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                metadata, body = parse_frontmatter(f.read())

            output_filename = filename.rsplit(".", 1)[0] + ".html"
            output_filepath = os.path.join(OUTPUT_FOLDER, output_filename)

            # Template Injecting
            output_html = template_html.replace("{{ARTICLE_TITLE}}", str(metadata.get("title", "")))
            output_html = output_html.replace("{{ARTICLE_DATE}}", str(metadata.get("date", "")))
            output_html = output_html.replace("{{ARTICLE_CATEGORY}}", str(metadata.get("category", "")))
            output_html = output_html.replace("{{ARTICLE_LEVEL}}", str(metadata.get("level", "")))
            output_html = output_html.replace("{{READ_TIME}}", str(metadata.get("read_time", "")))
            output_html = output_html.replace("{{ARTICLE_DESCRIPTION}}", str(metadata.get("description", "")))
            output_html = output_html.replace("{{ARTICLE_CONTENT}}", body.strip())

            with open(output_filepath, "w", encoding="utf-8") as f:
                f.write(output_html)

            articles_data.append({
                "title": metadata.get("title", "Untitled"),
                "url": f"articles/{output_filename}",
                "date": str(metadata.get("date", "2026-01-01")),
                "category": metadata.get("category", "General"),
                "level": metadata.get("level", "Beginner"),
                "description": metadata.get("description", ""),
                "readingTime": metadata.get("read_time", "3 min read")
            })

    # 🔥 အသစ်ဆုံး ဆောင်းပါး အပေါ်ဆုံးရောက်အောင် ရက်စွဲဖြင့် SORT လုပ်ခြင်း
    articles_data.sort(key=lambda x: str(x['date']), reverse=True)

    # Save JSON
    with open(JSON_OUTPUT, "w", encoding="utf-8") as jf:
        json.dump(articles_data, jf, ensure_ascii=False, indent=4)

    # Homepage Injection
    if os.path.exists(INDEX_HTML):
        update_homepage(articles_data)

def update_homepage(articles_data):
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        content = f.read()

    cards_html = ""
    for article in articles_data:
        cards_html += f'''
        <div class="article-card" data-category="{article['category']}">
            <span class="category-tag">{article['category']}</span>
            <h3><a href="{article['url']}">{article['title']}</a></h3>
            <p>{article['description']}</p>
            <div class="card-meta">
                <span>{article['level']} • {article['readingTime']}</span>
                <span>📅 {article['date']}</span>
            </div>
        </div>'''

    pattern = r"(<!-- HOMEPAGE_ARTICLES_START -->)(.*?)(<!-- HOMEPAGE_ARTICLES_END -->)"
    updated_content = re.sub(pattern, f"\\1\n{cards_html}\n\\3", content, flags=re.DOTALL)

    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(updated_content)

if __name__ == "__main__":
    build_articles()
