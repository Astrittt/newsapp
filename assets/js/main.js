"use strict";

const newsPosts = document.getElementById("articles");
const loadMoreBtn = document.querySelector("button");
const loaderBtn = document.getElementById("loader");
const singlePostPage = document.getElementById("articles-single");
const filterEl = document.getElementById("filter");
const isSinglePage =
  !!window.location.search && !window.location.search.includes("categories");

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

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const updateQueryParams = (per_page, page, countryID) => {
  const newUrl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    `?per_page=${per_page}&page=${page}&_embed=1&categories=${countryID}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
};

const renderFilters = () => {
  defaults.filters.forEach(({ id, title }) => {
    filterEl.innerHTML += `
    <li>
      <a href="#" categoryId="${id}" title="${title}">${title}</a>
    </li>`;
  });
  filterEl.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      const countryID = a.getAttribute("categoryId");
      newsPosts.innerHTML = "";
      fetchNewsData({ countryID });
    });
  });
};

const showLoaderIcon = function () {
  loaderBtn.classList.add("active");
  if (!isSinglePage) {
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
  const html = `
  <article class="article" id="articles">
  <h1>${title.rendered}</h1>
  <a href="/single.html?postId=${id}">
  <img src= ${_embedded["wp:featuredmedia"][0].link}/>
  </a>
  <span>${dateMod[0]}</span>
  <p>${contentData.rendered}</p>
  </article>
  `;
  const insertToEl = isSingle ? singlePostPage : newsPosts;
  insertToEl.insertAdjacentHTML("beforeend", html);
};

const singlePost = async function (singlePostID) {
  try {
    const res = await fetch(`${defaults.baseUrl}/${singlePostID}?_embed=1`);
    if (!res.ok) {
      throw new Error(`Failed to fetch posts`);
    }
    const data = await res.json();
    renderPost(data, "single");
  } catch (e) {
    console.log(e);
  }
};

const fetchNewsData = async function ({
  countryID = defaults.countryID,
  per_page = defaults.per_page,
  page = defaults.page,
}) {
  try {
    updateQueryParams(per_page, page, countryID);
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
if (isSinglePage) {
  const singlePostID = window.location.search.split("?postId=").join("");
  singlePost(singlePostID);
}

if (!isSinglePage) {
  renderFilters();
  fetchNewsData({
    per_page: getParameterByName("per_page"),
    page: getParameterByName("page"),
    countryID: getParameterByName("categories"),
  });
  loadMoreBtn.addEventListener("click", async function () {
    const page = ++defaults.page;
    fetchNewsData({
      per_page: getParameterByName("per_page"),
      page,
      countryID: getParameterByName("categories"),
    });
  });
}
