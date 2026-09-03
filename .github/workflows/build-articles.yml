name: Build Articles Index

on:
  push:
    branches:
      - main

  workflow_dispatch:

permissions:
  contents: write

jobs:

  build:

    runs-on: ubuntu-latest

    steps:

      # =========================
      # CHECKOUT
      # =========================

      - name: Checkout
        uses: actions/checkout@v4


      # =========================
      # SETUP PYTHON & DEPENDENCIES
      # =========================

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.x"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install beautifulsoup4 lxml pyyaml


      # =========================
      # BUILD ARTICLES
      # =========================

      - name: Build Articles
        run: |
          python scripts/build_articles.py


      # =========================
      # COMMIT GENERATED FILES
      # =========================

      - name: Commit changes
        run: |

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

          git add articles/
          git add categories/all-articles.html
          git add index.html
          git add data/articles.json

          if git diff --cached --quiet; then
            echo "No changes to commit."
          else
            git commit -m "Auto update generated articles & JSON index"
            git push
          fi
