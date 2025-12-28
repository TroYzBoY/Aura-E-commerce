let products = {
  newProducts: [],
  recommendedProducts: [],
  accessories: [],
};

let allProducts = []; // For search functionality
let cart = [];
let currentFilter = "all";
let currentCategory = "all";

// Fetch products from JSON file
async function loadProducts() {
  try {
    const response = await fetch("../product.json");
    if (!response.ok) {
      throw new Error("Өгөгдөл ачаалахад алдаа гарлаа");
    }
    products = await response.json();

    // Combine all products for search
    allProducts = [
      ...(products.newProducts || []),
      ...(products.recommendedProducts || []),
      ...(products.accessories || []),
    ];

    // Show all products on the page (combine all categories)
    displayProducts(allProducts, "new-products", 0);
  } catch (error) {
    console.error("Fetch алдаа:", error);
    document.getElementById("new-products").innerHTML =
      '<div class="loading">Өгөгдөл ачаалахад алдаа гарлаа</div>';
  }
}

function displayProducts(productsArray, containerId, limit = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const list =
    limit && limit > 0 ? productsArray.slice(0, limit) : productsArray;

  container.innerHTML = list
    .map((product) => {
      // Parse price to number for filtering
      const priceNum = parseFloat(product.price.replace(/[₮,]/g, ""));

      return `
      <div class="product-card" 
           data-category="${product.category || "accessory"}"
           data-price="${priceNum}"
           data-is-new="${product.new ? "true" : "false"}"
           data-on-sale="${product.salePrice ? "true" : "false"}">
        ${product.new ? `<div class="product-new">${product.new}</div>` : ""}
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${product.price}</div>
      </div>
    `;
    })
    .join("");
}

function openDetailedPage(category) {
  currentCategory = category;
  const page = document.getElementById("detailed-page");
  const title = document.getElementById("detailed-title");
  const subtitle = document.getElementById("detailed-subtitle");

  title.textContent = "Бүх бүтээгдэхүүн";
  subtitle.textContent = "Таны хайж байгаа бүгдийг нэг дор";

  page.classList.add("active");
  filterProducts("all");
}

function closeDetailedPage() {
  document.getElementById("detailed-page").classList.remove("active");
}

function filterProducts(category) {
  currentFilter = category;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  if (event && event.target) {
    event.target.classList.add("active");
  }

  const allProducts = [
    ...products.newProducts,
    ...products.recommendedProducts,
    ...products.accessories,
  ];

  const filtered =
    category === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === category);

  displayDetailedProducts(filtered);
}

function displayDetailedProducts(productsArray) {
  const container = document.getElementById("detailed-grid");
  container.innerHTML = productsArray
    .map(
      (product, index) => `
        <div class="detailed-card" onclick="showProductPopupById(${
          product.id
        })" style="animation: fadeInUp 0.6s ease forwards ${
        index * 0.05
      }s; opacity: 0; cursor: pointer;">
          ${product.new ? `<div class="product-new">${product.new}</div>` : ""}
          <img src="${product.image}" alt="${
        product.name
      }" class="detailed-card-image">
          <div class="detailed-card-info">
            <div class="detailed-card-name">${product.name}</div>
            <div class="detailed-card-price">${product.price}</div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${
              product.id
            }, '${product.name}', '${product.price}')">
              <i class="fa-solid fa-cart-plus"></i> Сагсанд нэмэх
            </button>
          </div>
        </div>
      `
    )
    .join("");
}

// ============================================
// SIDEBAR FILTER FUNCTIONS
// ============================================

// Sidebar filter-ийг ажиллуулах үндсэн функц
function applyFilters() {
  const categoryCheckboxes = document.querySelectorAll(
    ".filter-checkbox[data-category]:checked"
  );
  const priceCheckboxes = document.querySelectorAll(
    ".filter-checkbox[data-price]:checked"
  );
  const conditionCheckboxes = document.querySelectorAll(
    ".filter-checkbox[data-condition]:checked"
  );

  const selectedCategories = Array.from(categoryCheckboxes).map(
    (cb) => cb.dataset.category
  );
  const selectedPrices = Array.from(priceCheckboxes).map(
    (cb) => cb.dataset.price
  );
  const selectedConditions = Array.from(conditionCheckboxes).map(
    (cb) => cb.dataset.condition
  );

  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    let showCard = true;

    // Category filter
    if (selectedCategories.length > 0) {
      const cardCategory = card.dataset.category;
      if (!selectedCategories.includes(cardCategory)) {
        showCard = false;
      }
    }

    // Price filter
    if (selectedPrices.length > 0 && showCard) {
      const cardPrice = parseFloat(card.dataset.price);
      let priceMatch = false;

      selectedPrices.forEach((priceRange) => {
        const [min, max] = priceRange.split("-").map(Number);
        if (cardPrice >= min && cardPrice <= max) {
          priceMatch = true;
        }
      });

      if (!priceMatch) {
        showCard = false;
      }
    }

    // Condition filter
    if (selectedConditions.length > 0 && showCard) {
      let conditionMatch = false;

      selectedConditions.forEach((condition) => {
        if (condition === "new" && card.dataset.isNew === "true") {
          conditionMatch = true;
        }
        if (condition === "sale" && card.dataset.onSale === "true") {
          conditionMatch = true;
        }
      });

      if (!conditionMatch) {
        showCard = false;
      }
    }

    // Animate card visibility
    if (showCard) {
      card.style.display = "block";
      card.style.animation = "fadeInUp 0.4s ease forwards";
    } else {
      card.style.opacity = "0";
      setTimeout(() => {
        card.style.display = "none";
      }, 300);
    }
  });
}

// Бүх filter-ийг цэвэрлэх
function clearFilters() {
  const allCheckboxes = document.querySelectorAll(".filter-checkbox");
  allCheckboxes.forEach((cb) => (cb.checked = false));
  applyFilters();
}

// ============================================
// CART FUNCTIONS
// ============================================

function addToCart(idOrObj, name, price) {
  // Нэвтэрсэн эсэхийг шалгах
  if (typeof requireLogin === "function" && !requireLogin()) {
    return;
  }

  // Support passing a product object or (id, name, price)
  let id = idOrObj && typeof idOrObj === "object" ? idOrObj.id : idOrObj;
  let productName =
    idOrObj && typeof idOrObj === "object" ? idOrObj.name : name;
  let productPrice =
    idOrObj && typeof idOrObj === "object"
      ? parseFloat(String(idOrObj.price).replace(/[₮,]/g, "")) || 0
      : typeof price === "string"
      ? parseFloat(String(price).replace(/[₮,]/g, "")) || 0
      : Number(price) || 0;

  // find product data if exists
  const productObj = allProducts.find((p) => Number(p.id) === Number(id)) || {};

  const existing = cart.find((c) => Number(c.id) === Number(id));
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      id: Number(id),
      name: productObj.name || productName,
      price: productPrice || Number(productObj.price) || 0,
      image: productObj.image || "",
      quantity: 1,
    });
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));
  updateCartBadge();
  showNotification(`${productObj.name || productName} сагсанд нэмэгдлээ!`);
}

function updateCartBadge() {
  const cartIcon = document.getElementById("cart-icon");
  if (!cartIcon) return;
  let badge = cartIcon.querySelector(".cart-badge");

  // persist
  localStorage.setItem("cartItems", JSON.stringify(cart));

  if (cart.length > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      cartIcon.appendChild(badge);
    }
    badge.textContent = cart.length;
  } else if (badge) {
    badge.remove();
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        animation: slideInRight 0.3s;
        font-weight: 600;
      `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// ================= CART POPUP & HELPERS =================
function showCartPopup() {
  const existingPopup = document.querySelector(".cart-popup");
  if (existingPopup) existingPopup.remove();

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1),
    0
  );

  const popup = document.createElement("div");
  popup.className = "cart-popup";
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s;
  `;

  let cartHTML = "";
  if (cart.length === 0) {
    cartHTML =
      '<p style="text-align: center; color: #86868b; padding: 40px;">Таны сагс хоосон байна</p>';
  } else {
    cartHTML = cart
      .map(
        (item) => `
      <div class="cart-item" style="display:flex;align-items:center;gap:15px;padding:15px;background:#f5f5f7;border-radius:12px;margin-bottom:15px;">
        <img src="${item.image || "./IMG/Logo.png"}" alt="${
          item.name
        }" style="width:50px;height:50px;object-fit:cover;border-radius:8px;" />
        <div style="flex:1;">
          <div style="font-weight:600;margin-bottom:5px;">${item.name}</div>
          <div style="color:#06c;font-weight:700;">₮${Number(
            item.price
          ).toLocaleString()}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button onclick="updateQuantity(${
            item.id
          }, -1)" style="width:30px;height:30px;border:none;background:white;border-radius:50%;cursor:pointer;font-size:18px;font-weight:700;">-</button>
          <span style="font-weight:600;min-width:20px;text-align:center;">${
            item.quantity || 1
          }</span>
          <button onclick="updateQuantity(${
            item.id
          }, 1)" style="width:30px;height:30px;border:none;background:white;border-radius:50%;cursor:pointer;font-size:18px;font-weight:700;">+</button>
        </div>
        <button onclick="removeFromCart(${
          item.id
        })" style="background:#ff3b30;color:white;border:none;width:30px;height:30px;border-radius:50%;">×</button>
      </div>
    `
      )
      .join("");
  }

  popup.innerHTML = `
    <div style="width:520px; max-width:95%; background:white; padding:20px; border-radius:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="margin:0;">Таны сагс</h3>
        <button onclick="this.closest('.cart-popup').remove()" style="background:none;border:none;font-size:20px;">✕</button>
      </div>
      <div style="max-height:420px; overflow:auto;">${cartHTML}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-weight:700;">
        <div>Нийт</div>
        <div>₮${Number(totalPrice).toLocaleString()}</div>
      </div>
      <div style="display:flex;gap:10px;margin-top:18px;">
        <button onclick="this.closest('.cart-popup').remove();" style="flex:1;padding:12px;border-radius:8px;border:1px solid #ccc;background:white;">Үргэлжлүүлэх</button>
        <button onclick="goToCheckout()" style="flex:1;padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,#667eea 0%, #764ba2 100%);color:white;">Төлбөр рүү</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => Number(item.id) !== Number(productId));
  localStorage.setItem("cartItems", JSON.stringify(cart));
  updateCartBadge();
  const openPopup = document.querySelector(".cart-popup");
  if (openPopup) showCartPopup();
}

function updateQuantity(productId, change) {
  const item = cart.find((i) => Number(i.id) === Number(productId));
  if (!item) return;
  item.quantity = (item.quantity || 1) + change;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    localStorage.setItem("cartItems", JSON.stringify(cart));
    updateCartBadge();
    const openPopup = document.querySelector(".cart-popup");
    if (openPopup) showCartPopup();
  }
}

function goToCheckout() {
  if (typeof requireLogin === "function" && !requireLogin()) return;
  if (cart.length === 0) {
    alert("⚠️ Таны сагс хоосон байна!\n\nЭхлээд бүтээгдэхүүн сонгоно уу.");
    return;
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));
  showNotification("💳 Төлбөрийн хуудас руу шилжиж байна...");
  setTimeout(() => {
    window.location.href = "../tulbur/tulbur.html";
  }, 500);
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

// Search dropdown-оор үр дүнг харуулах
function showSearchDropdown(results) {
  const dropdown = document.getElementById("search-dropdown");
  const container = document.getElementById("search-results-container");

  if (!dropdown || !container) return;

  if (results.length === 0) {
    container.innerHTML =
      '<div class="search-no-results">Бүтээгдэхүүн олдсонгүй</div>';
    dropdown.classList.add("show");
    return;
  }

  // Хамгийн ихдээ 5 үр дүнг харуулах
  const displayResults = results.slice(0, 5);

  container.innerHTML = displayResults
    .map((product) => {
      return `
        <div class="search-result-item" data-product-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='IMG/Logo.png';">
          <div class="search-result-item-info">
            <div class="search-result-item-name">${product.name}</div>
            <div class="search-result-item-price">${product.price}</div>
          </div>
        </div>
      `;
    })
    .join("");

  // Item дээр дарахад detailed page нээж, хайлтын үр дүнг харуулах
  container.querySelectorAll(".search-result-item").forEach((item) => {
    item.addEventListener("click", () => {
      const productId = parseInt(item.getAttribute("data-product-id"));
      const searchTerm = document.querySelector(".input").value;
      hideSearchDropdown();
      openDetailedPage("all");
      // Хайлтын үр дүнг харуулах
      setTimeout(() => {
        searchProductsInDetailed(searchTerm);
      }, 100);
    });
  });

  dropdown.classList.add("show");
}

// Search dropdown-г нуух
function hideSearchDropdown() {
  const dropdown = document.getElementById("search-dropdown");
  if (dropdown) {
    dropdown.classList.remove("show");
  }
}

// Хайлтын функц
function searchProducts(searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") {
    hideSearchDropdown();
    return;
  }

  const searchLower = searchTerm.toLowerCase().trim();
  const filteredProducts = allProducts.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const categoryMatch = product.category?.toLowerCase().includes(searchLower);
    return nameMatch || categoryMatch;
  });

  // Dropdown-оор үр дүнг харуулах
  showSearchDropdown(filteredProducts);
}

// Detailed page дотор хайх функц
function searchProductsInDetailed(searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") {
    // Бүх бүтээгдэхүүнийг харуулах
    displayDetailedProducts(allProducts);
    return;
  }

  const searchLower = searchTerm.toLowerCase().trim();
  const filteredProducts = allProducts.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const categoryMatch = product.category?.toLowerCase().includes(searchLower);
    return nameMatch || categoryMatch;
  });

  displayDetailedProducts(filteredProducts);
}

// Debounce функц - хэт олон удаа дуудагдахаас сэргийлэх
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// DOM ачаалагдсаны дараа search event listener-ууд нэмэх
function setupSearchListeners() {
  const searchInput = document.querySelector(".input");
  const searchIcon = document.querySelector(".icon1");
  const inputWrapper = document.querySelector(".input-wrapper");

  if (!searchInput || !searchIcon || !inputWrapper) {
    // DOM бэлэн биш бол дахин оролдох
    setTimeout(setupSearchListeners, 100);
    return;
  }

  // Debounce-тай live search (300ms хүлээгээд хайх)
  const debouncedSearch = debounce((searchTerm) => {
    searchProducts(searchTerm);
  }, 300);

  // Live search - input бичих бүрт автоматаар хайх
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value;
    debouncedSearch(searchTerm);
  });

  // Input focus алдахад dropdown нуух
  searchInput.addEventListener("blur", (e) => {
    // Click event-ийг боловсруулахаас өмнө dropdown нуухгүй байх
    setTimeout(() => {
      const dropdown = document.getElementById("search-dropdown");
      if (
        dropdown &&
        !dropdown.matches(":hover") &&
        !searchInput.matches(":focus")
      ) {
        hideSearchDropdown();
      }
    }, 200);
  });

  // Dropdown дээр hover байхад нуухгүй байх
  const dropdown = document.getElementById("search-dropdown");
  if (dropdown) {
    dropdown.addEventListener("mouseenter", () => {
      searchInput.focus();
    });
  }

  // Хайлтын товч дарахад
  searchIcon.addEventListener("click", () => {
    const searchTerm = searchInput.value;
    if (searchTerm.trim() !== "") {
      openDetailedPage("all");
      setTimeout(() => {
        searchProductsInDetailed(searchTerm);
      }, 100);
      hideSearchDropdown();
    }
  });

  // Enter товч дарахад хайх
  inputWrapper.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const searchTerm = e.target.value || searchInput.value;
      if (searchTerm.trim() !== "") {
        openDetailedPage("all");
        setTimeout(() => {
          searchProductsInDetailed(searchTerm);
        }, 100);
        hideSearchDropdown();
      }
    }
  });
}

// ============================================
// CSS ANIMATIONS
// ============================================

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
      }
    `;
document.head.appendChild(style);

// ============================================
// INITIALIZATION
// ============================================

// DOM ачаалагдсаны дараа search listener-уудыг тохируулах
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupSearchListeners();

    // load cart from localStorage and bind cart icon
    const saved = localStorage.getItem("cartItems");
    if (saved) {
      try {
        cart = JSON.parse(saved);
      } catch (e) {
        cart = [];
      }
    }
    updateCartBadge();
    const cartIcon = document.getElementById("cart-icon");
    if (cartIcon) cartIcon.addEventListener("click", showCartPopup);
  });
} else {
  setupSearchListeners();
  const saved = localStorage.getItem("cartItems");
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch (e) {
      cart = [];
    }
  }
  updateCartBadge();
  const cartIcon = document.getElementById("cart-icon");
  if (cartIcon) cartIcon.addEventListener("click", showCartPopup);
}

// Initialize
loadProducts();

// ================= PRODUCT QUICK VIEW =================
function showProductPopupById(id) {
  const product = allProducts.find((p) => Number(p.id) === Number(id));
  if (!product) return;

  const existing = document.querySelector(".product-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.className = "product-popup";
  popup.style.cssText = `position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.6); z-index:10002;`;

  popup.innerHTML = `
    <div style="background:white; padding:20px; border-radius:12px; width:520px; max-width:95%;">
      <div style="display:flex; gap:12px; align-items:flex-start;">
        <img src="${product.image}" alt="${
    product.name
  }" style="width:180px; height:180px; object-fit:cover; border-radius:8px;" />
        <div style="flex:1;">
          <h3 style="margin:0 0 8px 0;">${product.name}</h3>
          <div style="font-weight:700; color:#06c; margin-bottom:8px;">₮${Number(
            product.price
          ).toLocaleString()}</div>
          <p style="color:#666;">${product.description || ""}</p>
          <div style="display:flex; gap:8px; margin-top:12px;">
            <button onclick="addToCart(${product.id}, '${product.name}', '${
    product.price
  }'); this.closest('.product-popup').remove();" style="padding:10px 14px; background:linear-gradient(135deg,#667eea 0%, #764ba2 100%); color:white; border:none; border-radius:8px;">Сагсанд нэмэх</button>
            <button onclick="this.closest('.product-popup').remove();" style="padding:10px 14px; border-radius:8px; border:1px solid #ccc; background:white;">Хаах</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}
