//I am importing variables from the data javascript file in order to use it in my scripts file
import { BOOKS_PER_PAGE, authors, genres, books } from "/data.js";
//I am creating two variables that I can use in all functions in my scripts file
const matches = books;
let page = 1;

//This if statement checks whether the variable books is falsy or not an array.
//If books does not exist or if it is not an array, it throws an error saying "Source required."
//It's a safety measure to ensure that the books variable contains a valid array before proceeding with further operations.

if (!books && !Array.isArray(books)) throw new Error("Source required");

//I have created a function that creates a range of the minimum and maximum length of an array
//that is passed into the function, I set them as two values in a range array and return it

function sliceArray(arr) {
  let start = 0;
  let end = arr.length;
  let range = [start, end];

  if (!range && range.length < 2)
    throw new Error("Range must be an array with two numbers");

  return range;
}

// This function  takes an object with properties author, image, title, and id as its argument.
// It is designed to generate a preview of a book and it's associated content, dynamically within a web page.

const createPreview = ({ author, image, title, id }) => {
  const previewContainer = document.createElement("div");
  previewContainer.classList.add("preview");

  const previewInfoContainer = document.createElement("div");
  previewInfoContainer.classList.add("preview__info");

  const imageElement = document.createElement("img");
  imageElement.classList.add("preview__image");
  imageElement.src = image;
  imageElement.alt = title;

  const titleElement = document.createElement("h2");
  titleElement.classList.add("preview__title");
  titleElement.textContent = title;

  const authorElement = document.createElement("p");
  authorElement.classList.add("preview__author");
  authorElement.textContent = author;

  previewContainer.dataset.bookId = id;

  previewInfoContainer.appendChild(titleElement);
  previewInfoContainer.appendChild(authorElement);

  previewContainer.appendChild(imageElement);
  previewContainer.appendChild(previewInfoContainer);

  return previewContainer;
};

// This part of the function creates a preview of books and adds them to a document fragment
// which will eventually append them to the DOM.
const booksfragment = document.createDocumentFragment();
let extractedbooks = books
  .slice(0, 36)
  .map((book) => ({ ...book, author: authors[book.author] }));

for (const { author, image, title, id } of extractedbooks) {
  const preview = createPreview({
    author,
    id,
    image,
    title,
  });

  booksfragment.appendChild(preview);
}

const listItems = document.querySelector("[data-list-items]");
listItems.appendChild(booksfragment);

//This code creates a set of <option> elements representing all existing genres and populates a dropdown list in the DOM.

const genresFragment = document.createDocumentFragment();

let genreElement = document.createElement("option");
genreElement.value = "any";
genreElement.textContent = "All Genres";
genresFragment.appendChild(genreElement);

for (const [id, name] of Object.entries(genres)) {
  const genreElement = document.createElement("option");
  genreElement.value = id;
  genreElement.textContent = name;
  genresFragment.appendChild(genreElement);
}

const genreList = document.querySelector("[data-search-genres]");
genreList.appendChild(genresFragment);

//This code creates a set of <option> elements representing all existing authors and populates a dropdown list in the DOM.

const authorsFragment = document.createDocumentFragment();

let authorElement = document.createElement("option");
authorElement.value = "any";
authorElement.innerText = "All Authors";
authorsFragment.appendChild(authorElement);

for (const [id, name] of Object.entries(authors)) {
  const authorElement = document.createElement("option");
  authorElement.value = id;
  authorElement.innerText = name;
  authorsFragment.appendChild(authorElement);
}

const authorList = document.querySelector("[data-search-authors]");
authorList.appendChild(authorsFragment);

//This is a css object which contains a collection of color values structured in an object format.
//Each color has variations for both a "day" and a "night" theme,
//each with "dark" and "light" variants represented as strings of RGB values.

const css = {
  day: {
    dark: "10, 10, 20",
    light: "255, 255, 255",
  },

  night: {
    dark: "255, 255, 255",
    light: "10, 10, 20",
  },
};

//This function manages a settings overlay related to the theme selection

const handleSettingsOverlay = () => {
  const dataSettingsOverlay = document.querySelector("[data-settings-overlay]");
  const theme = document.querySelector("[data-settings-theme]");

  const applyTheme = (selectedTheme) => {
    const chosenTheme = selectedTheme === "day" ? "day" : "night";
    document.documentElement.style.setProperty(
      "--color-dark",
      css[chosenTheme].dark
    );
    document.documentElement.style.setProperty(
      "--color-light",
      css[chosenTheme].light
    );
  };

  const applyThemeFromPref = () => {
    const preferredTheme =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "night"
        : "day";
    theme.value = preferredTheme;
    applyTheme(preferredTheme);
  };

  const handleSettingsOverlayConfig = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = Object.fromEntries(formData);
    applyTheme(result.theme);
    dataSettingsOverlay.open = false;
  };

  dataSettingsOverlay.addEventListener("submit", handleSettingsOverlayConfig);
  applyThemeFromPref();
};

handleSettingsOverlay();

//This code is related to the "Show more" button functionality that allows users to load more book previews from a list,
//as well as see the remaining books that can be loaded

const dataButton = document.querySelector("[data-list-button]");
const remainingBooks = matches.length - page * BOOKS_PER_PAGE;

dataButton.innerHTML = `
      <span>Show more</span>
      <span class="list__remaining">(${remainingBooks})</span>
    `;

const dataButtonClick = () => {
  const newPage = page + 1;
  const nextPageStart = newPage * BOOKS_PER_PAGE;
  const nextPageEnd = (newPage + 1) * BOOKS_PER_PAGE;
  const extracted = matches
    .slice(nextPageStart, nextPageEnd)
    .map((matches) => ({ ...matches, author: authors[matches.author] }));

  const fragment = document.createDocumentFragment();
  for (const { author, image, title, id } of extracted) {
    const preview = createPreview({ author, id, image, title });
    fragment.appendChild(preview);
  }

  const listItems = document.querySelector("[data-list-items]");
  listItems.appendChild(fragment);

  const remainingBooks =
    matches.length - newPage * BOOKS_PER_PAGE > 0
      ? matches.length - newPage * BOOKS_PER_PAGE
      : 0;

  dataButton.innerHTML = `
      <span>Show more</span>
      <span class="list__remaining">(${remainingBooks})</span>
    `;

  page = newPage;
};

dataButton.addEventListener("click", dataButtonClick);

//This checks how many matches are remaining and if there are none, it disables the button

const remainingMatches = matches.length - page * BOOKS_PER_PAGE;
dataButton.disabled = !(remainingMatches > 0);

//These event listeners are attached to different elements in the DOM and define actions to perform when certain events occur.
const dataSearchCancel = document.querySelector("[data-search-cancel]");

dataSearchCancel.addEventListener("click", () => {
  const dataSearchOverlay = document.querySelector("[data-search-overlay]");
  dataSearchOverlay.open = false;
});

const dataSettingsCancel = document.querySelector("[data-settings-cancel]");

dataSettingsCancel.addEventListener("click", () => {
  const dataSettingsOverlay = document.querySelector("[data-settings-overlay]");
  dataSettingsOverlay.open = false;
});

const dataSettingsFormSubmit = document.querySelector("[form='settings']");

dataSettingsFormSubmit.addEventListener("submit", () => {});

const dataListClose = document.querySelector("[data-list-close]");

dataListClose.addEventListener("click", () => {
  const dataListActive = document.querySelector("[data-list-active]");
  dataListActive.open = false;
});

const dataheaderSearch = document.querySelector("[data-header-search]");

dataheaderSearch.addEventListener("click", () => {
  const dataSearchOverlay = document.querySelector("[data-search-overlay]");
  const dataSearchtitle = document.querySelector("[data-search-title]");
  dataSearchOverlay.open = true;
  dataSearchtitle.focus();
});

const dataHeaderSettings = document.querySelector("[data-header-settings]");

dataHeaderSettings.addEventListener("click", () => {
  const dataSettingsOverlay = document.querySelector("[data-settings-overlay]");
  dataSettingsOverlay.open = true;
});

//This function allows you to search for certain books based off the title, author and genre

const searchForm = document.querySelector("[data-search-form]");

const searchBooks = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = [];

  for (const book of books) {
    const titleMatch =
      filters.title.trim() == "" ||
      book.title.toLowerCase().includes(filters.title.toLowerCase());
    const authorMatch =
      filters.author == "any" || book.author == filters.author;
    let genreMatch = filters.genre == "any";

    for (const singleGenre of book.genres) {
      if (singleGenre == filters.genre) {
        genreMatch = true;
      }
    }

    if (titleMatch && authorMatch && genreMatch) {
      result.push(book);
    }
  }

  const dataListMessage = document.querySelector("[data-list-message]");

  if (result.length < 1) {
    dataListMessage.classList.add("list__message_show");
  } else {
    dataListMessage.classList.remove("list__message_show");
  }

  const dataListItems = document.querySelector("[data-list-items]");
  dataListItems.innerHTML = "";

  const range = sliceArray(result);

  const datafragment = document.createDocumentFragment();
  const dataExtracted = result
    .slice(range[0], range[1])
    .map((result) => ({ ...result, author: authors[result.author] }));

  for (const { author, image, title, id } of dataExtracted) {
    let dataElement = createPreview({
      author,
      id,
      image,
      title,
    });

    datafragment.appendChild(dataElement);
  }

  dataListItems.appendChild(datafragment);
  const dataButton = document.querySelector("[data-list-button]");

  dataButton.disabled = true;
  dataButton.textContent = `Show more (0)`;

  window.scrollTo({ top: 0, behavior: "smooth" });
  const dataSearchOverlay = document.querySelector("[data-search-overlay]");
  dataSearchOverlay.open = false;
};

searchForm.addEventListener("submit", searchBooks);

//This code handles the preview functionality when a book is selected within a list.

const selectedBook = document.querySelector(".list__items");

const previewSelectedBook = (event) => {
  const dataListActive = document.querySelector("[data-list-active]");
  const dataListBlur = document.querySelector("[data-list-blur]");
  const dataListImage = document.querySelector("[data-list-image]");
  const dataListTitle = document.querySelector("[data-list-title]");
  const dataListSubtitle = document.querySelector("[data-list-subtitle]");
  const dataListDescription = document.querySelector("[data-list-description]");
  const pathArray = Array.from(event.path || event.composedPath());
  let active = "";

  for (const node of pathArray) {
    const previewId = node?.dataset?.bookId;

    for (const singleBook of books) {
      if (singleBook.id == previewId) {
        active = singleBook;
      }
    }
  }

  if (active) {
    dataListActive.open = true;
    dataListDescription.innerHTML = active.description;
    dataListImage.setAttribute("src", active.image);
    dataListBlur.setAttribute("src", active.image);
    dataListTitle.innerHTML = active.title;

    dataListSubtitle.innerHTML = `${authors[active.author]} (${new Date(
      active.published
    ).getFullYear()})`;
  }
};

selectedBook.addEventListener("click", previewSelectedBook);
