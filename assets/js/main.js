"use strict";

const newsPosts = document.getElementById("articles");
const loadMoreBtn = document.querySelector("button");
const loaderBtn = document.getElementById("loader");
const singlePostPage = document.getElementById("articles-single");
const filterEl = document.getElementById("filter");
const postLinks = document.getElementById("post-links");
const singlePostID = window.location.search.split("?postId=").join("");
const backBtn = document.getElementById("btn-single");

let defaults = {
  baseUrl: "https://balkaninsight.com/wp-json/wp/v2/posts",
  per_page: 10,
  page: 1,
  countryID: 206,
  filters: [
    { id: 206, title: "Albania" },
    { id: 211, title: "Bulgaria" },
    { id: 191, title: "Croatia" },
  ],
};

const renderFilters = () => {
  defaults.filters.forEach(({ id, title }) => {
    filterEl.innerHTML += `
    <li class="post-links" id="post-links">
      <a href="#" categoryId="${id}" title="${title}">${title}</a>
    </li>`;
  });
  filterEl.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      defaults.page = 1;
      const countryID = a.getAttribute("categoryId");
      newsPosts.innerHTML = "";
      defaults.countryID = countryID;
      fetchNewsData({ countryID });
    });
  });
};

const showLoaderIcon = function () {
  loaderBtn.classList.add("active");
  if (!singlePostID) {
    loadMoreBtn.style.visibility = "hidden";
  }
};

const hideLoaderIcon = function () {
  loaderBtn.classList.remove("active");
  loadMoreBtn.style.visibility = "visible";
};

const renderPost = ({ date, title, id, _embedded, excerpt, content }, type) => {
  const dateMod = date.split("T");
  const isSingle = type === "single";
  const contentData = isSingle ? content : excerpt;
  const singleStyle = newsPosts ? "articles" : "articles-single";
  const html = `
  <article class="article" id="${singleStyle}">
  <h1>${title.rendered}</h1>
  <a href="/single.html?postId=${id}">
  <div class="img-content"> 
  <img src= ${
    _embedded["wp:featuredmedia"]?.[0]?.link || ""
  }  alt= "This is an image"/>
  </div>
  </a>
  <p class="date">${dateMod?.[0] || ""}</p>
  <div class="post-content">${contentData.rendered}</div>
  </article>
  `;
  const insertToEl = isSingle ? singlePostPage : newsPosts;
  insertToEl.insertAdjacentHTML("beforeend", html);
};

const singlePost = async function (singlePostID) {
  try {
    showLoaderIcon();
    const res = await fetch(`${defaults.baseUrl}/${singlePostID}?_embed=1`);
    if (!res.ok) {
      throw new Error(`Failed to fetch posts`);
    }
    const data = await res.json();
    renderPost(data, "single");
  } catch (e) {
    console.log(e);
  }
  backBtn.addEventListener("click", function () {
    history.back();
  });
};

const fetchNewsData = async function ({
  countryID = defaults.countryID,
  per_page = defaults.per_page,
  page = defaults.page,
}) {
  try {
    showLoaderIcon();
    const res = await fetch(
      `${defaults.baseUrl}?per_page=${per_page}&page=${page}&_embed=1&categories=${countryID}`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch posts`);
    }
    const data = await res.json();
    for (const item of data) {
      renderPost(item);
    }
    if (data.length > 0) {
      hideLoaderIcon();
    }
  } catch (e) {
    console.log(e);
  }
};
if (singlePostID) {
  singlePost(singlePostID);
}

if (!singlePostID) {
  renderFilters();
  fetchNewsData({});
  loadMoreBtn.addEventListener("click", async function () {
    ++defaults.page;
    fetchNewsData({
      page: defaults.page,
    });
  });
}
