"use strict";

const newsPosts = document.getElementById("articles");
const loadMoreBtn = document.querySelector("button");
const loaderBtn = document.getElementById("loader");
const singlePostPage = document.getElementById("articles-single");

const showLoaderIcon = function () {
  loaderBtn.classList.add("active");
  if (loadMoreBtn) {
    loadMoreBtn.style.visibility = "hidden";
  }
};

const hideLoaderIcon = function () {
  loaderBtn.classList.remove("active");
  loadMoreBtn.style.visibility = "visible";
};

let defaults = {
  per_page: 10,
  page: 1,
  countryID: 206,
};

const renderPosts = function (data) {
  const dateMod = data.date.split("T");
  const html = `
  <article class="article" id="articles">
  <h1>${data.title.rendered}</h1>
  <a href="/single.html?postId=${data.id}">
  <img src= ${data._embedded["wp:featuredmedia"][0].link}/>
  </a>
  <span>${dateMod[0]}</span>
  <p>${data.excerpt.rendered}</p>
  </article>
  `;
  newsPosts.insertAdjacentHTML("beforeend", html);
};

const renderSinglePost = function (data) {
  const dateMod = data.date.split("T");
  const html = `
  <article class="article" id="articles">
  <h1>${data.title.rendered}</h1>
  <a href="/single.html?postId=${data.id}">
  <img src= ${data._embedded["wp:featuredmedia"][0].link}/>
  </a>
  <span>${dateMod[0]}</span>
  <p>${data.excerpt.rendered}</p>
  </article>
  `;
  singlePostPage.insertAdjacentHTML("beforeend", html);
};

const singlePostID = window.location.search.split("?postId=").join("");
console.log(singlePostID);

const singlePost = async function (singlePostID) {
  try {
    const res = await fetch(
      `https://balkaninsight.com/wp-json/wp/v2/posts/${singlePostID}?_embed=1`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch posts`);
    }
    const data = await res.json();
    renderSinglePost(data);
  } catch (e) {
    console.log(e);
  }
};
singlePost(singlePostID);

const newsData = async function (
  per_page = defaults.per_page,
  page = page,
  countryID = 206
) {
  try {
    showLoaderIcon();
    const res = await fetch(
      `https://balkaninsight.com/wp-json/wp/v2/posts?per_page=${per_page}&page=${page}&_embed=1&categories=${countryID}`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch posts`);
    }
    const data = await res.json();
    for (const item of data) {
      renderPosts(item);
    }
    if (data.length > 0) {
      hideLoaderIcon();
    }
  } catch (e) {
    console.log(e);
  }
  loadMoreBtn.addEventListener("click", async function () {
    defaults.page++;
    const res = await fetch(
      `https://balkaninsight.com/wp-json/wp/v2/posts?per_page=${defaults.per_page}&page=${defaults.page}&_embed=1&categories=${defaults.countryID}`
    );
    let dataLoadMore = await res.json();
    console.log(dataLoadMore);
    for (const post of dataLoadMore) {
      renderPosts(post);
    }
  });
};
if (newsPosts) {
  newsData(4, 1, 206);
}
