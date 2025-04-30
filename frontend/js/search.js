document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const resultsContainer = document.querySelector(".search-results");
  let filter = "all";

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  const debouncedSearch = debounce(() => performSearch(), 300);
  input.addEventListener("input", debouncedSearch);
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filter = btn.dataset.filter;
      performSearch();
    });
  });

  async function performSearch() {
    const query = input.value.trim();
    if (!query) {
      resultsContainer.innerHTML = "";
      return;
    }
    try {
      const url = new URL(`${window.CONFIG.API_URL}/api/search`);
      url.searchParams.set("searchQuery", query);
      url.searchParams.set("filter", filter);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      renderResults(data);
    } catch (err) {
      console.error(err);
      resultsContainer.innerHTML = `<p class="error-message">Unable to perform search.</p>`;
    }
  }

  function renderResults({ users = [], posts = [], products = [] }) {
    resultsContainer.innerHTML = "";

    if ((filter === "all" || filter === "people") && users.length) {
      const section = document.createElement("div");
      section.className = "search-result-section";
      section.innerHTML = `<h3>People</h3><div class="search-result-list"></div>`;
      const list = section.querySelector(".search-result-list");
      users.forEach((u) => {
        const avatarUrl = `${window.CONFIG.API_URL}/api/avatar/${u.id}`;
        const item = document.createElement("div");
        item.className = "search-result-item person";
        console.log("URLS");
        item.innerHTML = `
          <div class="avatar"><img src="${u.avatar_url}" alt="${u.username}" /></div>
          <div class="search-result-info"><h4>${u.username}</h4><p>@${u.username}</p></div>
          <button class="message-btn">Message</button>
        `;

        item.querySelector(".message-btn").addEventListener("click", () => {
          localStorage.setItem(
            "redirectToMessageUser",
            JSON.stringify({
              id: u.id,
              username: u.username,
            })
          );

          window.location.href = "/messages.html";
        });
        list.appendChild(item);
      });
      resultsContainer.appendChild(section);
    }

    if ((filter === "all" || filter === "posts") && posts.length) {
      const section = document.createElement("div");
      section.className = "search-result-section";
      section.innerHTML = `<h3>Posts</h3><div class="search-result-list"></div>`;
      const list = section.querySelector(".search-result-list");
      posts.forEach((p) => {
        console.log("Personsdf", p);
        const avatarUrl = `${window.CONFIG.API_URL}/api/avatar/${p.user_id}`;
        const item = document.createElement("div");
        item.className = "search-result-item post";
        item.innerHTML = `
          <div class="avatar"><img src="${p.url}" alt="${p.username}" /></div>
          <div class="search-result-info">
            <div class="post-header"><h4>${
              p.username
            }</h4><span class="post-time">${new Date(
          p.created_at
        ).toLocaleString()}</span></div>
            <p class="post-content">${p.body}</p>
          </div>
        `;
        list.appendChild(item);
      });
      resultsContainer.appendChild(section);
    }

    if ((filter === "all" || filter === "products") && products.length) {
      const section = document.createElement("div");
      section.className = "search-result-section";
      section.innerHTML = `<h3>Products</h3><div class="search-result-list"></div>`;
      const list = section.querySelector(".search-result-list");
      products.forEach((prod) => {
        const item = document.createElement("div");
        item.className = "search-result-item product";
        item.innerHTML = `
          <div class="product-image"><img src="${
            prod.image || "/api/placeholder/50/50"
          }" alt="${prod.title}"></div>
          <div class="search-result-info"><h4>${
            prod.title
          }</h4><p class="product-price">$${parseFloat(prod.price).toFixed(
          2
        )}</p></div>
          <button class="buy-btn">Buy Now</button>
        `;
        list.appendChild(item);
      });
      resultsContainer.appendChild(section);
    }
  }
});
