(function () {
  var nav = document.querySelector(".main-nav");
  var menuToggle = document.querySelector(".menu-toggle");
  var progress = document.querySelector(".reading-progress");
  var searchInput = document.getElementById("siteSearch");
  var searchDropdown = document.getElementById("searchDropdown");
  var popularContainer = document.getElementById("popularArticles");
  var recentContainer = document.getElementById("recentArticles");
  var refreshButton = document.getElementById("refreshArticles");
  var cookiePopup = document.getElementById("cookiePopup");
  var cookieAccept = document.getElementById("cookieAccept");

  var articles = Array.isArray(window.AUTO_ARTICLES) ? window.AUTO_ARTICLES : [];

  function articleUrl(item) {
    return item.url || "#";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function shuffle(items) {
    return items
      .map(function (item) { return { item: item, sort: Math.random() }; })
      .sort(function (a, b) { return a.sort - b.sort; })
      .map(function (entry) { return entry.item; });
  }

  function renderRecent() {
    if (!recentContainer) return;
    recentContainer.innerHTML = articles.slice(0, 8).map(function (item) {
      return [
        '<a class="recent-card" href="' + articleUrl(item) + '">',
        '<small>новое</small>',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<span>' + escapeHtml(item.icon + " " + item.category) + '</span>',
        '</a>'
      ].join("");
    }).join("");
  }

  function renderPopular(source) {
    if (!popularContainer) return;
    var list = (source || articles).slice(0, 9);
    popularContainer.innerHTML = list.map(function (item) {
      return [
        '<a class="article-card" href="' + articleUrl(item) + '">',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<p>' + escapeHtml(item.description) + '</p>',
        '<span>' + escapeHtml(item.icon + " " + item.category) + '</span>',
        '</a>'
      ].join("");
    }).join("");
  }

  function runSearch() {
    if (!searchInput || !searchDropdown) return;
    var query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
      searchDropdown.style.display = "none";
      searchDropdown.innerHTML = "";
      return;
    }

    var results = articles.filter(function (item) {
      var haystack = [item.title, item.description, item.category].join(" ").toLowerCase();
      return haystack.indexOf(query) !== -1;
    }).slice(0, 7);

    if (!results.length) {
      searchDropdown.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
    } else {
      searchDropdown.innerHTML = results.map(function (item) {
        return [
          '<a class="search-result" href="' + articleUrl(item) + '">',
          '<span class="search-result-icon">' + escapeHtml(item.icon) + '</span>',
          '<span><strong>' + escapeHtml(item.title) + '</strong>',
          '<span>' + escapeHtml(item.category) + '</span></span>',
          '</a>'
        ].join("");
      }).join("");
    }
    searchDropdown.style.display = "block";
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  window.addEventListener("scroll", function () {
    if (!progress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = percent + "%";
  }, { passive: true });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll("[data-reveal]").forEach(function (element) {
    revealObserver.observe(element);
  });

  if (searchInput) {
    searchInput.addEventListener("input", runSearch);
    searchInput.addEventListener("focus", runSearch);
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".hero-search") && searchDropdown) {
        searchDropdown.style.display = "none";
      }
    });
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", function () {
      renderPopular(shuffle(articles));
      refreshButton.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
        { duration: 420, easing: "ease-out" }
      );
    });
  }

  if (cookiePopup && !localStorage.getItem("autoTemplateCookieAccepted")) {
    window.setTimeout(function () {
      cookiePopup.classList.add("is-visible");
    }, 600);
  }
  if (cookieAccept && cookiePopup) {
    cookieAccept.addEventListener("click", function () {
      localStorage.setItem("autoTemplateCookieAccepted", "1");
      cookiePopup.classList.remove("is-visible");
    });
  }

  renderRecent();
  renderPopular();
})();
