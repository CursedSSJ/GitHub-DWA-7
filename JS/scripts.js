import { BOOKS_PER_PAGE, authors, genres, books } from "./data.js";
import { dataSelectors } from "./selector.js";

const matches = books;
let page = 1;

if (!books && !Array.isArray(books)) throw new Error("Source required");

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
const populatePage = () => {
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

  dataSelectors.listItems.appendChild(booksfragment);
};

populatePage();

//This code creates a set of <option> elements representing all existing genres and populates a dropdown list in the DOM.

const populateDropdown = (list, data, allText) => {
  const fragment = document.createDocumentFragment();

  // Create the "All" option
  let allOption = document.createElement("option");
  allOption.value = "any";
  allOption.textContent = allText;
  fragment.appendChild(allOption);

  // Create options for each item in the data object
  for (const [id, name] of Object.entries(data)) {
    const optionElement = document.createElement("option");
    optionElement.value = id;
    optionElement.textContent = name;
    fragment.appendChild(optionElement);
  }

  // Append the options to the dropdown list
  list.appendChild(fragment);
};

populateDropdown(dataSelectors.genreList, genres, "All Genres");
populateDropdown(dataSelectors.authorList, authors, "All Authors");

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

const remainingBooks = matches.length - page * BOOKS_PER_PAGE;

dataSelectors.databutton.innerHTML = `
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

  dataSelectors.listItems.appendChild(fragment);

  const remainingBooks =
    matches.length - newPage * BOOKS_PER_PAGE > 0
      ? matches.length - newPage * BOOKS_PER_PAGE
      : 0;

  dataSelectors.databutton.innerHTML = `
      <span>Show more</span>
      <span class="list__remaining">(${remainingBooks})</span>
    `;

  page = newPage;
};

dataSelectors.databutton.addEventListener("click", dataButtonClick);

//This checks how many matches are remaining and if there are none, it disables the button

const remainingMatches = matches.length - page * BOOKS_PER_PAGE;
dataSelectors.databutton.disabled = !(remainingMatches > 0);

const sliceArray = (arr) => {
  let start = 0;
  let end = arr.length;
  let range = [start, end];

  if (!range && range.length < 2)
    throw new Error("Range must be an array with two numbers");

  return range;
};

//This function allows you to search for certain books based off the title, author and genre
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

  dataSelectors.databutton.disabled = true;
  dataSelectors.databutton.textContent = `Show more (0)`;

  window.scrollTo({ top: 0, behavior: "smooth" });
  const dataSearchOverlay = document.querySelector("[data-search-overlay]");
  dataSearchOverlay.open = false;
};

dataSelectors.searchForm.addEventListener("submit", searchBooks);

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

//These event listeners are attached to different elements in the DOM and define actions to perform when certain events

dataSelectors.dataSearchCancel.addEventListener("click", () => {
  dataSelectors.dataSearchOverlay.open = false;
});

dataSelectors.dataSettingsFormSubmit.addEventListener("submit", () => {});

dataSelectors.dataListClose.addEventListener("click", () => {
  dataSelectors.dataListActive.open = false;
});

dataSelectors.dataHeaderSearch.addEventListener("click", () => {
  dataSelectors.dataSearchOverlay.open = true;
});

dataSelectors.dataHeaderSettings.addEventListener("click", () => {
  dataSelectors.dataHeaderSettingsOverlay.open = true;
});
