// This will hold our fetched data
let allData = [];

// Get references to the DOM elements we'll be interacting with
const cardContainer = document.getElementsByClassName("card-list-container")[0];
const filterButtons = document.querySelectorAll(
  ".extension-list-activity-button"
);

// Get a reference to the light/dark mode icon and the main logo
const themeToggleButton = document.querySelector(".light-dark-mode-icon");
const mainLogo = document.querySelector(".main-logo-text");
const themeIcon = document.querySelector(".theme-icon");

// Function to set the theme based on a given mode ('light' or 'dark')
function setTheme(mode) {
  if (mode === "dark") {
    document.documentElement.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    // Sun icon appears in dark mode
    themeIcon.src = "assets/images/icon-sun.svg";
  } else {
    document.documentElement.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    // Moon icon appears in light mode
    themeIcon.src = "assets/images/icon-moon.svg";
  }
}

// Function to initialize the theme on page load
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");
  // Check if a theme is saved in localStorage, otherwise default to light mode
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // Default to light mode if no preference is saved
    setTheme("light");
  }
}

// This async function fetches the data, stores it, and then renders the UI
async function initializeApp() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allData = await response.json(); // Store the data in the master 'allData' array

    // Initially render all cards and highlight the "All" button
    renderCards(allData);
    document
      .querySelector(".extension-list-activity-button")
      .classList.add("active");
  } catch (error) {
    console.error("Could not initialize app:", error);
  }
}

// Function to render the UI based on a provided array of data
function renderCards(dataToRender) {
  // Clear the existing cards before re-rendering
  cardContainer.innerHTML = "";

  dataToRender.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    // Set a data attribute with a unique value (the name) for identification
    card.dataset.name = item.name;

    card.innerHTML = `
      <div class="card-header">
        <img class="card-logo" src="${item.logo}" alt="${item.name}" />
        <div class="card-data-container">
          <div class="card-header-text">${item.name}</div>
          <div class="card-header-description">${item.description}</div>
        </div>
      </div>
      <div class="card-button-container">
        <div class="remove-button">Remove</div>
        <label class="switch">
          <input type="checkbox" ${item.isActive ? "checked" : ""} />
          <span class="slider round"></span>
        </label>
      </div>
    `;
    cardContainer.appendChild(card);
  });
}

// Function to handle the filtering logic
function handleFilterClick(event) {
  filterButtons.forEach((button) => button.classList.remove("active"));
  event.target.classList.add("active");

  const filterType = event.target.textContent;
  let filteredData = allData;

  if (filterType === "Active") {
    filteredData = allData.filter((item) => item.isActive);
  } else if (filterType === "Inactive") {
    filteredData = allData.filter((item) => !item.isActive);
  }

  renderCards(filteredData);
}

// Event handler for clicks on the container (for remove buttons)
function handleContainerClick(event) {
  if (event.target.classList.contains("remove-button")) {
    const cardElement = event.target.closest(".card");
    if (cardElement) {
      // Get the unique identifier (name) from the data attribute
      const nameToRemove = cardElement.dataset.name;

      // Use filter to create a new array without the item to be removed
      allData = allData.filter((item) => item.name !== nameToRemove);

      // Re-render the cards based on the currently active filter
      const activeFilter = document.querySelector(
        ".extension-list-activity-button.active"
      ).textContent;
      let dataToRender = allData;
      if (activeFilter === "Active") {
        dataToRender = allData.filter((item) => item.isActive);
      } else if (activeFilter === "Inactive") {
        dataToRender = allData.filter((item) => !item.isActive);
      }

      renderCards(dataToRender);
    }
  }
}

// Event handler for changes (e.g., checkbox toggles)
function handleContainerChange(event) {
  if (event.target.type === "checkbox") {
    const cardElement = event.target.closest(".card");
    if (cardElement) {
      // Find the item in the master array based on the name from the data attribute
      const itemName = cardElement.dataset.name;
      const itemToUpdate = allData.find((item) => item.name === itemName);

      if (itemToUpdate) {
        itemToUpdate.isActive = event.target.checked;
      }
    }
  }
}

// Add event listeners
filterButtons.forEach((button) => {
  button.addEventListener("click", handleFilterClick);
});

cardContainer.addEventListener("click", handleContainerClick);
cardContainer.addEventListener("change", handleContainerChange);

themeToggleButton.addEventListener("click", () => {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    setTheme("light");
  } else {
    setTheme("dark");
  }
});

// Start the application
initializeTheme();
initializeApp();
