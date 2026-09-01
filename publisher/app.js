/* =====================================================
   FIBER OPTIC HUB
   ONE-CLICK ARTICLE PUBLISHER
   COMPLETE FINAL VERSION
   app.js
===================================================== */


/* =====================================================
   CONFIGURATION
===================================================== */

const WORKER_URL =
  "https://fiberoptichub-ai.htaylinnaung-ep.workers.dev/";


const WEBSITE_URL =
  "https://fiberoptichub.github.io";


/* =====================================================
   GLOBAL STATE
===================================================== */

let generatedArticle =
  null;

let selectedImageData =
  null;


/* =====================================================
   ELEMENTS
===================================================== */

const titleInput =
  document.getElementById(
    "articleTitle"
  );


const categoryInput =
  document.getElementById(
    "articleCategory"
  );


const levelInput =
  document.getElementById(
    "articleLevel"
  );


const descriptionInput =
  document.getElementById(
    "articleDescription"
  );


const imageInput =
  document.getElementById(
    "articleImage"
  );


const previewSection =
  document.getElementById(
    "previewSection"
  );


const articlePreview =
  document.getElementById(
    "articlePreview"
  );


const facebookPreview =
  document.getElementById(
    "facebookPreview"
  );


const publishButton =
  document.getElementById(
    "publishButton"
  );


const statusBox =
  document.getElementById(
    "status"
  );


const previewStatus =
  document.getElementById(
    "previewStatus"
  );


/* =====================================================
   IMAGE SELECT
===================================================== */

if (
  imageInput
) {

  imageInput.addEventListener(
    "change",
    function () {

      const file =
        this.files[0];


      if (!file) {

        selectedImageData =
          null;

        return;

      }


      if (
        file.size >
        5 * 1024 * 1024
      ) {

        showStatus(
          "⚠️ Image size 5MB ထက် မကျော်ရပါ။",
          true
        );

        this.value =
          "";

        selectedImageData =
          null;

        return;

      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        showStatus(
          "⚠️ Image file သာ ရွေးပါ။",
          true
        );

        this.value =
          "";

        selectedImageData =
          null;

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function (
          event
        ) {

          selectedImageData =
            event.target.result;

        };


      reader.onerror =
        function () {

          selectedImageData =
            null;

          showStatus(
            "⚠️ Image ဖတ်လို့ မရပါ။",
            true
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =====================================================
   GENERATE ARTICLE
===================================================== */

async function generateArticle() {

  const title =
    titleInput
      ? titleInput.value.trim()
      : "";


  const category =
    categoryInput
      ? categoryInput.value
      : "Fiber Optic Basics";


  const level =
    levelInput
      ? levelInput.value
      : "Beginner";


  const description =
    descriptionInput
      ? descriptionInput.value.trim()
      : "";


  if (!title) {

    showStatus(
      "⚠️ Article Topic / Title ထည့်ပါ။",
      true
    );

    if (
      titleInput
    ) {

      titleInput.focus();

    }

    return;

  }


  const generateButton =
    document.querySelector(
      ".generate-btn"
    );


  if (
    generateButton
  ) {

    generateButton.disabled =
      true;

    generateButton.textContent =
      "🤖 Generating...";

  }


  if (
    publishButton
  ) {

    publishButton.disabled =
      true;

  }


  if (
    previewStatus
  ) {

    previewStatus.textContent =
      "GENERATING";

  }


  showStatus(
    "🤖 Gemini AI က Article ရေးနေပါတယ်..."
  );


  const requestData = {

    action:
      "generate",

    title:
      title,

    category:
      category,

    level:
      level,

    description:
      description

  };


  try {

    const response =
      await fetch(

        WORKER_URL,

        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(
              requestData
            )

        }

      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(

        result.message ||
        "Article generate မအောင်မြင်ပါ။"

      );

    }


    const article =
      result.article;


    if (!article) {

      throw new Error(
        "Article data မရပါ။"
      );

    }


    generatedArticle = {

      title:
        String(
          article.title ||
          title
        ),

      category:
        category,

      level:
        level,

      description:
        String(
          article.description ||
          description ||
          ""
        ),

      introduction:
        String(
          article.introduction ||
          ""
        ),

      sections:
        Array.isArray(
          article.sections
        )
          ? article.sections
          : [],

      key_points:
        Array.isArray(
          article.key_points
        )
          ? article.key_points
          : [],

      conclusion:
        String(
          article.conclusion ||
          ""
        ),

      facebook_summary:
        Array.isArray(
          article.facebook_summary
        )
          ? article.facebook_summary
          : [],

      facebook_note:
        Array.isArray(
          article.facebook_note
        )
          ? article.facebook_note
          : [],

      facebook_hashtags:
        Array.isArray(
          article.facebook_hashtags
        )
          ? article.facebook_hashtags
          : [],

      date:
        new Date().toISOString(),

      image:
        selectedImageData

    };


    renderArticlePreview(
      generatedArticle
    );


    renderFacebookPreview(
      generatedArticle
    );


    if (
      publishButton
    ) {

      publishButton.disabled =
        false;

    }


    if (
      previewStatus
    ) {

      previewStatus.textContent =
        "READY";

    }


    showStatus(
      "✅ Article Preview Ready!"
    );


    if (
      previewSection
    ) {

      previewSection.scrollIntoView({

        behavior:
          "smooth",

        block:
          "start"

      });

    }


  } catch (
    error
  ) {

    console.error(
      "Generate Error:",
      error
    );


    generatedArticle =
      null;


    if (
      publishButton
    ) {

      publishButton.disabled =
        true;

    }


    if (
      previewStatus
    ) {

      previewStatus.textContent =
        "ERROR";

    }


    showStatus(

      "❌ " +
      (
        error.message ||
        "Article Generate မအောင်မြင်ပါ။"
      ),

      true

    );

  } finally {

    if (
      generateButton
    ) {

      generateButton.disabled =
        false;

      generateButton.textContent =
        "🤖 Generate Article";

    }

  }

}


/* =====================================================
   ARTICLE PREVIEW
===================================================== */

function renderArticlePreview(
  article
) {

  if (
    !articlePreview
  ) {

    return;

  }


  const formattedDate =
    formatDate(
      article.date
    );


  let imageHTML =
    "";


  if (
    article.image
  ) {

    imageHTML = `

      <figure class="preview-figure">

        <img
          src="${article.image}"
          alt="${escapeHTML(article.title)}"
          class="preview-image"
        >

      </figure>

    `;

  }


  let contentHTML =
    "";


  if (
    article.introduction
  ) {

    contentHTML += `

      <h2>
        Introduction
      </h2>

      <p>
        ${escapeHTML(
          article.introduction
        )}
      </p>

    `;

  }


  if (
    Array.isArray(
      article.sections
    )
  ) {

    article.sections.forEach(
      section => {

        if (!section) {

          return;

        }


        const heading =
          String(
            section.heading ||
            ""
          ).trim();


        if (
          heading
        ) {

          contentHTML += `

            <h2>
              ${escapeHTML(
                heading
              )}
            </h2>

          `;

        }


        if (
          Array.isArray(
            section.paragraphs
          )
        ) {

          section.paragraphs.forEach(
            paragraph => {

              if (
                paragraph
              ) {

                contentHTML += `

                  <p>
                    ${escapeHTML(
                      paragraph
                    )}
                  </p>

                `;

              }

            }
          );

        }


        if (
          Array.isArray(
            section.bullets
          ) &&
          section.bullets.length
        ) {

          contentHTML +=
            "<ul>";


          section.bullets.forEach(
            bullet => {

              if (
                bullet
              ) {

                contentHTML += `

                  <li>
                    ${escapeHTML(
                      bullet
                    )}
                  </li>

                `;

              }

            }
          );


          contentHTML +=
            "</ul>";

        }

      }
    );

  }


  if (
    Array.isArray(
      article.key_points
    ) &&
    article.key_points.length
  ) {

    contentHTML += `

      <h2>
        Key Points
      </h2>

      <ul>

    `;


    article.key_points.forEach(
      point => {

        if (
          point
        ) {

          contentHTML += `

            <li>
              ${escapeHTML(
                point
              )}
            </li>

          `;

        }

      }
    );


    contentHTML +=
      "</ul>";

  }


  if (
    article.conclusion
  ) {

    contentHTML += `

      <h2>
        Conclusion
      </h2>

      <p>
        ${escapeHTML(
          article.conclusion
        )}
      </p>

    `;

  }


  articlePreview.innerHTML = `

    <article>

      <h1 class="preview-article-title">

        ${escapeHTML(
          article.title
        )}

      </h1>


      <div class="preview-meta">

        ${escapeHTML(
          article.category
        )}

        •

        ${escapeHTML(
          article.level
        )}

        •

        ${formattedDate}

      </div>


      ${imageHTML}


      <div class="preview-content">

        ${contentHTML}

      </div>

    </article>

  `;

}


/* =====================================================
   FACEBOOK PREVIEW
===================================================== */

function renderFacebookPreview(
  article
) {

  if (
    !facebookPreview
  ) {

    return;

  }


  const title =
    String(
      article.title ||
      ""
    ).trim();


  const description =
    String(
      article.description ||
      ""
    ).trim();


  let postText =
    "";


  postText +=
    "🌐 " +
    title +
    "\n\n";


  if (
    description
  ) {

    postText +=
      description +
      "\n\n";

  }


  if (
    Array.isArray(
      article.facebook_summary
    ) &&
    article.facebook_summary.length
  ) {

    postText +=
      "📚 ဒီ Article မှာ ဘာတွေ လေ့လာနိုင်မလဲ?\n\n";


    article.facebook_summary
      .slice(0, 6)
      .forEach(
        item => {

          postText +=
            "🔹 " +
            String(
              item
            ).trim() +
            "\n";

        }
      );


    postText +=
      "\n";

  }


  if (
    Array.isArray(
      article.facebook_note
    ) &&
    article.facebook_note.length
  ) {

    postText +=
      "💡 မှတ်သားစရာ\n\n";


    article.facebook_note
      .slice(0, 6)
      .forEach(
        item => {

          postText +=
            "🔹 " +
            String(
              item
            ).trim() +
            "\n";

        }
      );


    postText +=
      "\n";

  }


  const slug =
    createSlug(
      title
    );


  const articleURL =
    WEBSITE_URL +
    "/articles/" +
    slug +
    ".html";


  postText +=
    "📚 Read Full Article:\n" +
    articleURL +
    "\n\n";


  postText +=
    "Learn • Practice • Share\n\n";


  const hashtags =
    Array.isArray(
      article.facebook_hashtags
    )
      ? article.facebook_hashtags
      : [];


  postText +=
    hashtags.join(
      " "
    );


  facebookPreview.textContent =
    postText;

}


/* =====================================================
   PUBLISH ARTICLE
===================================================== */

async function publishArticle() {

  if (
    !generatedArticle
  ) {

    showStatus(
      "⚠️ Article မရှိသေးပါ။",
      true
    );

    return;

  }


  if (
    publishButton
  ) {

    publishButton.disabled =
      true;

    publishButton.textContent =
      "🚀 Publishing...";

  }


  if (
    previewStatus
  ) {

    previewStatus.textContent =
      "PUBLISHING";

  }


  showStatus(
    "🚀 GitHub မှာ Article Publish လုပ်နေပါတယ်..."
  );


  try {

    const response =
      await fetch(

        WORKER_URL,

        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              action:
                "publish",

              article:
                generatedArticle

            })

        }

      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(

        result.message ||
        "Publish မအောင်မြင်ပါ။"

      );

    }


    /* =================================================
       SUCCESS
    ================================================= */

    if (
      previewStatus
    ) {

      previewStatus.textContent =
        "PUBLISHED";

    }


    showStatus(
      "✅ Article Published Successfully!"
    );


    if (
      facebookPreview &&
      result.facebookPost
    ) {

      facebookPreview.textContent =
        result.facebookPost;

    }


    /* =================================================
       SHOW LIVE LINK
    ================================================= */

    if (
      articlePreview &&
      result.articleURL
    ) {

      articlePreview.insertAdjacentHTML(

        "afterbegin",

        `

          <div class="publish-success">

            ✅ Published Successfully

            <br>

            <a
              href="${result.articleURL}"
              target="_blank"
              rel="noopener"
            >
              🌐 Open Published Article
            </a>

          </div>

        `

      );

    }


  } catch (
    error
  ) {

    console.error(
      "Publish Error:",
      error
    );


    if (
      previewStatus
    ) {

      previewStatus.textContent =
        "ERROR";

    }


    showStatus(

      "❌ " +
      (
        error.message ||
        "Publish မအောင်မြင်ပါ။"
      ),

      true

    );


  } finally {

    if (
      publishButton
    ) {

      publishButton.disabled =
        false;

      publishButton.textContent =
        "🚀 Publish Article";

    }

  }

}


/* =====================================================
   CLEAR
===================================================== */

function clearPublisher() {

  if (
    titleInput
  ) {

    titleInput.value =
      "";

  }


  if (
    descriptionInput
  ) {

    descriptionInput.value =
      "";

  }


  if (
    categoryInput
  ) {

    categoryInput.selectedIndex =
      0;

  }


  if (
    levelInput
  ) {

    levelInput.selectedIndex =
      0;

  }


  if (
    imageInput
  ) {

    imageInput.value =
      "";

  }


  selectedImageData =
    null;


  generatedArticle =
    null;


  if (
    articlePreview
  ) {

    articlePreview.innerHTML = `

      <div class="empty-preview">

        <div class="empty-icon">
          📄
        </div>

        <h3>
          No Article Yet
        </h3>

        <p>
          Topic ထည့်ပြီး
          Generate Article ကိုနှိပ်ပါ။
        </p>

      </div>

    `;

  }


  if (
    facebookPreview
  ) {

    facebookPreview.textContent =
      "Facebook Post ကို Generate လုပ်ပြီးနောက် ဒီနေရာမှာ ပြပါမယ်။";

  }


  if (
    publishButton
  ) {

    publishButton.disabled =
      true;

  }


  if (
    previewStatus
  ) {

    previewStatus.textContent =
      "DRAFT";

  }


  if (
    statusBox
  ) {

    statusBox.textContent =
      "";

  }

}


/* =====================================================
   STATUS
===================================================== */

function showStatus(
  message,
  isError = false
) {

  if (
    !statusBox
  ) {

    return;

  }


  statusBox.textContent =
    message;


  statusBox.style.color =
    isError
      ? "#ff8a80"
      : "#8fa3b8";

}


/* =====================================================
   DATE
===================================================== */

function formatDate(
  dateString
) {

  const date =
    new Date(
      dateString
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  return date.toLocaleDateString(
    "en-GB",
    {

      year:
        "numeric",

      month:
        "short",

      day:
        "numeric"

    }
  );

}


/* =====================================================
   SLUG
===================================================== */

function createSlug(
  text
) {

  const slug =
    String(
      text || ""
    )

      .toLowerCase()

      .trim()

      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )

      .replace(
        /\s+/g,
        "-"
      )

      .replace(
        /-+/g,
        "-"
      )

      .replace(
        /^-+|-+$/g,
        "");


  return (
    slug ||
    "fiber-optic-article"
  );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(
  value
) {

  return String(
    value || ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =====================================================
   INITIAL STATE
===================================================== */

if (
  publishButton
) {

  publishButton.disabled =
    true;

}


if (
  previewSection
) {

  previewSection.style.display =
    "block";

}


if (
  previewStatus
) {

  previewStatus.textContent =
    "DRAFT";

}
