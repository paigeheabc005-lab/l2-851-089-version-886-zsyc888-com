
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function renderCards(items, root) {
    root.innerHTML = items.map((item) => `
      <a class="movie-card" href="${item.url}" data-search-item data-search="${[
        item.title, item.year, item.region, item.type, item.category, ...(item.genres || []), ...(item.tags || []), item.oneLine || ""
      ].join(" ")}">
        <div class="movie-poster">
          <img src="${item.poster}" alt="${item.title}" loading="lazy">
        </div>
        <div class="movie-body">
          <h3 class="movie-title line-clamp-2">${item.title}</h3>
          <div class="movie-meta">
            <span>${item.year} · ${item.region} · ${item.type}</span>
          </div>
          <div class="movie-tags">
            ${(item.tags || []).slice(0, 3).map((tag) => `<span class="chip">${tag}</span>`).join("")}
          </div>
        </div>
      </a>
    `).join("");
  }

  function initSearchPage() {
    if (!window.SEARCH_INDEX) return;
    const input = $("#searchQuery");
    const results = $("#searchResults");
    const summary = $("#searchSummary");
    const chips = $$(".js-category-chip");
    if (!input || !results) return;

    const params = new URLSearchParams(location.search);
    const q0 = params.get("q") || "";
    input.value = q0;

    const categoryMap = new Map(chips.map((btn) => [btn.dataset.filter, btn]));

    let activeFilter = "all";

    const doSearch = () => {
      const q = input.value.trim().toLowerCase();
      const filtered = window.SEARCH_INDEX.filter((item) => {
        const hay = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.category,
          ...(item.genres || []),
          ...(item.tags || []),
          item.oneLine || ""
        ].join(" ").toLowerCase();
        const passText = !q || hay.includes(q);
        const passCat = activeFilter === "all" || (item.category || "").toLowerCase() === activeFilter;
        return passText && passCat;
      });

      const show = filtered.slice(0, 180);
      renderCards(show, results);
      summary.textContent = `共找到 ${filtered.length} 条结果，当前展示 ${show.length} 条。`;
    };

    input.addEventListener("input", doSearch);

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeFilter = chip.dataset.filter || "all";
        doSearch();
      });
    });

    const allBtn = categoryMap.get("all");
    if (allBtn) allBtn.classList.add("active");
    doSearch();
  }

  document.addEventListener("DOMContentLoaded", initSearchPage);
})();
