import os
import re
import yaml
import json

# Paths Configuration (scripts/ folder ထဲမှ Run လျှင် Root Path ကို အလိုအလျောက် ယူပေးမည်)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_PATH = os.path.join(BASE_DIR, "templates", "template.html")
SOURCE_FOLDER = os.path.join(BASE_DIR, "markdown_articles")
OUTPUT_FOLDER = os.path.join(BASE_DIR, "articles")
DATA_DIR = os.path.join(BASE_DIR, "data")
JSON_OUTPUT = os.path.join(DATA_DIR, "articles.json")

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
    # Folder & Template စစ်ဆေးခြင်း
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

    # Markdown ဖိုင်များကို ဖြတ်သန်းဖတ်ယူခြင်း
    for filename in os.listdir(SOURCE_FOLDER):
        if filename.endswith(".md") or filename.endswith(".html"):
            filepath = os.path.join(SOURCE_FOLDER, filename)
            
            with open(filepath, "r", encoding="utf-8") as f:
                raw_content = f.read()

            metadata, body = parse_frontmatter(raw_content)

            # Metadata ရယူခြင်း
            title = metadata.get("title", "Untitled")
            date = metadata.get("date", "2026-09-03")
            category = metadata.get("category", "Basics")
            level = metadata.get("level", "Beginner")
            read_time = metadata.get("read_time", "3 min read")
            description = metadata.get("description", "")
            prev_article = metadata.get("prev_article", "#")
            next_article = metadata.get("next_article", "#")

            # Template ထဲသို့ Inject ပြုလုပ်ခြင်း
            output_html = template_html.replace("{{ARTICLE_TITLE}}", str(title))
            output_html = output_html.replace("{{ARTICLE_DATE}}", str(date))
            output_html = output_html.replace("{{ARTICLE_CATEGORY}}", str(category))
            output_html = output_html.replace("{{ARTICLE_LEVEL}}", str(level))
            output_html = output_html.replace("{{READ_TIME}}", str(read_time))
            output_html = output_html.replace("{{ARTICLE_DESCRIPTION}}", str(description))
            output_html = output_html.replace("{{PREV_ARTICLE}}", str(prev_article))
            output_html = output_html.replace("{{NEXT_ARTICLE}}", str(next_article))
            output_html = output_html.replace("{{ARTICLE_CONTENT}}", body.strip())

            # HTML ဖိုင်အဖြစ် Output ထုတ်ပေးခြင်း
            output_filename = filename.rsplit(".", 1)[0] + ".html"
            output_filepath = os.path.join(OUTPUT_FOLDER, output_filename)

            with open(output_filepath, "w", encoding="utf-8") as f:
                f.write(output_html)

            # articles.json အတွက် Data စုဆောင်းခြင်း
            articles_data.append({
                "title": title,
                "url": f"articles/{output_filename}",
                "date": str(date),
                "category": category,
                "level": level,
                "description": description,
                "readingTime": read_time
            })

            print(f"✅ Successfully Built: {output_filepath}")

    # articles.json သို့ Auto-Save ပြုလုပ်ခြင်း
    with open(JSON_OUTPUT, "w", encoding="utf-8") as jf:
        json.dump(articles_data, jf, ensure_ascii=False, indent=4)
        
    print(f"\n🎉 articles.json တွင် ဆောင်းပါး ( {len(articles_data)} ) ပုဒ် update ပြုလုပ်ပြီးပါပြီ။")

if __name__ == "__main__":
    build_articles()
