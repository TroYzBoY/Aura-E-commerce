// script.js
let products = {
  newProducts: [],
  recommendedProducts: [],
  accessories: [],
};

let allProducts = [];
let cart = [];
let currentFilter = "all";
let currentCategory = "all";

// Өгөгдөл ачаалах функц - JSON файлаас уншина
async function loadProducts() {
  try {
    const response = await fetch("../db.json");

    if (!response.ok) {
      throw new Error(`HTTP алдаа! статус: ${response.status}`);
    }

    const data = await response.json();
    console.log("Татсан өгөгдөл:", data);

    let productsArray = [];

    if (data.Products && Array.isArray(data.Products)) {
      productsArray = data.Products;
    } else if (Array.isArray(data)) {
      productsArray = data;
    } else {
      throw new Error("JSON өгөгдлийн бүтэц буруу байна");
    }
    allProducts = productsArray;

    products.newProducts = productsArray.filter(p => p.new === "NEW");
    products.recommendedProducts = productsArray.filter(p => p.new === "20% OFF");
    products.accessories = productsArray.filter(p => p.category === "accessory");

    displayProducts(allProducts, "new-products", 0);

    console.log('Бүтээгдэхүүн амжилттай ачаалагдлаа:', allProducts.length);
  } catch (error) {
    console.error("Өгөгдөл ачаалахад алдаа гарлаа:", error);
    const container = document.getElementById("new-products");
    if (container) {
      container.innerHTML = '<div class="loading">Өгөгдөл ачаалахад алдаа гарлаа</div>';
    }
  }
}
//Бүтээгдэхүүнүүдийг хуудсан дээр харуулна
function displayProducts(productsArray, containerId, limit = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const list = limit && limit > 0 ? productsArray.slice(0, limit) : productsArray;

  if (list.length === 0) {
    container.innerHTML = '<div class="loading">Бүтээгдэхүүн олдсонгүй</div>';
    return;
  }

  container.innerHTML = list
    .map((product) => {
      const priceNum = parseFloat(product.price.replace(/[₮,]/g, ""));
      const isOnSale = product.new === "20% OFF";

      return `
      <div class="product-card" 
           data-category="${product.category || "accessory"}"
           data-price="${priceNum}"
           data-is-new="${product.new === "NEW" ? "true" : "false"}"
           data-on-sale="${isOnSale ? "true" : "false"}">
        ${product.new ? `<div class="product-new">${product.new}</div>` : ""}
        <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='./IMG/Logo.png'">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${product.price}</div>
      </div>
    `;
    })
    .join("");

  container.querySelectorAll('.product-card').forEach((card, index) => {
    card.addEventListener('click', () => {
      showProductPopupById(list[index].id);
    });
  });
}
// Дэлгэрэнгүй хуудас нээнэ
function openDetailedPage(category) {
  currentCategory = category;
  const page = document.getElementById("detailed-page");
  const title = document.getElementById("detailed-title");
  const subtitle = document.getElementById("detailed-subtitle");

  if (!page) return;

  title.textContent = "Бүх бүтээгдэхүүн";
  subtitle.textContent = "Таны хайж байгаа бүгдийг нэг дор";

  page.classList.add("active");
  filterProducts("all");
}
//Дэлгэрэнгүй хуудас хаана
function closeDetailedPage() {
  const page = document.getElementById("detailed-page");
  if (page) {
    page.classList.remove("active");
  }
}
//Дэлгэрэнгүй хуудас дээр бүтээгдэхүүн шүүх функц
function filterProducts(category) {
  currentFilter = category;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes(category) || category === 'all' && btn.textContent === 'Бүгд') {
      btn.classList.add("active");
    }
  });

  const filtered = category === "all"
    ? allProducts
    : allProducts.filter((p) => p.category === category);

  displayDetailedProducts(filtered);
}
//Дэлгэрэнгүй хуудас дээр бүтээгдэхүүн харуулах функц
function displayDetailedProducts(productsArray) {
  const container = document.getElementById("detailed-grid");
  if (!container) return;

  if (productsArray.length === 0) {
    container.innerHTML = '<div class="loading">Бүтээгдэхүүн олдсонгүй</div>';
    return;
  }

  container.innerHTML = productsArray
    .map((product, index) => `
        <div class="detailed-card" onclick="showProductPopupById('${product.id}')" 
             style="animation: fadeInUp 0.6s ease forwards ${index * 0.05}s; opacity: 0; cursor: pointer;">
          ${product.new ? `<div class="product-new">${product.new}</div>` : ""}
          <img src="${product.image}" alt="${product.name}" class="detailed-card-image" onerror="this.src='./IMG/Logo.png'">
          <div class="detailed-card-info">
            <div class="detailed-card-name">${product.name}</div>
            <div class="detailed-card-price">${product.price}</div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}', '${product.name}', '${product.price}')">
              <i class="fa-solid fa-cart-plus"></i> Сагсанд нэмэх
            </button>
          </div>
        </div>
      `)
    .join("");
}

// ============= FILTER FUNCTIONS =============
function applyFilters() {
  const categoryCheckboxes = document.querySelectorAll(".filter-checkbox[data-category]:checked");
  const priceCheckboxes = document.querySelectorAll(".filter-checkbox[data-price]:checked");
  const conditionCheckboxes = document.querySelectorAll(".filter-checkbox[data-condition]:checked");

  const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.dataset.category);
  const selectedPrices = Array.from(priceCheckboxes).map(cb => cb.dataset.price);
  const selectedConditions = Array.from(conditionCheckboxes).map(cb => cb.dataset.condition);

  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    let showCard = true;

    if (selectedCategories.length > 0) {
      const cardCategory = card.dataset.category;
      if (!selectedCategories.includes(cardCategory)) {
        showCard = false;
      }
    }

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
// Тохиргоог цэвэрлэх функц
function clearFilters() {
  const allCheckboxes = document.querySelectorAll(".filter-checkbox");
  allCheckboxes.forEach((cb) => (cb.checked = false));
  applyFilters();
}

// ============= CART FUNCTIONS (дизайн) =============
function addToCart(idOrObj, name, price) {
  let id = idOrObj && typeof idOrObj === "object" ? idOrObj.id : idOrObj;
  let productName = idOrObj && typeof idOrObj === "object" ? idOrObj.name : name;
  let productPrice = idOrObj && typeof idOrObj === "object"
    ? parseFloat(String(idOrObj.price).replace(/[₮,]/g, "")) || 0
    : typeof price === "string"
      ? parseFloat(String(price).replace(/[₮,]/g, "")) || 0
      : Number(price) || 0;

  const productObj = allProducts.find((p) => String(p.id) === String(id)) || {};

  const existing = cart.find((c) => String(c.id) === String(id));
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      id: String(id),
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
// Сагсны тэмдэглэгээг шинэчлэх функц
function updateCartBadge() {
  const cartIcon = document.getElementById("cart-icon");
  if (!cartIcon) return;

  let badge = cartIcon.querySelector(".cart-badge");

  localStorage.setItem("cartItems", JSON.stringify(cart));

  const totalCount = cart.reduce((s, i) => s + (Number(i.quantity) || 0), 0) || cart.length;

  if (totalCount > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      cartIcon.appendChild(badge);
    }
    badge.textContent = totalCount;
  } else if (badge) {
    badge.remove();
  }
}
// Сагсанд нэмэгдсэн тухай мэдэгдэл харуулах функц
function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #000000 0%, #4a4a4a 50%, #bebebe 100%);
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
// Сагсны дэлгэрэнгүй мэдээлэл харуулах функц
function showCartPopup() {
  const existingPopup = document.querySelector(".cart-popup");
  if (existingPopup) existingPopup.remove();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
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
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s;
  `;

  let cartHTML = "";
  if (cart.length === 0) {
    cartHTML = '<p style="text-align: center; color: #86868b; padding: 40px; font-size: 18px;">Таны сагс хоосон байна</p>';
  } else {
    cartHTML = cart
      .map((item) => `
        <div class="cart-item" style="
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f5f5f7;
          border-radius: 12px;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='#e8e8ea'" onmouseout="this.style.background='#f5f5f7'">
          <img src="${item.image}" alt="${item.name}" 
               style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" 
               onerror="this.src='./IMG/Logo.png';" />
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 5px; font-size: 16px; color: #1d1d1f;">${item.name}</div>
            <div style="color: #ff3b30; font-weight: 700; font-size: 18px;">₮${item.price.toLocaleString()}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button onclick="updateQuantity('${item.id}', -1)" style="
              width: 32px;
              height: 32px;
              border: none;
              background: white;
              border-radius: 50%;
              cursor: pointer;
              font-size: 18px;
              font-weight: 700;
              color: #1d1d1f;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              transition: all 0.2s ease;
            " onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" 
               onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">−</button>
            <span style="font-weight: 600; min-width: 24px; text-align: center; font-size: 16px;">${item.quantity}</span>
            <button onclick="updateQuantity('${item.id}', 1)" style="
              width: 32px;
              height: 32px;
              border: none;
              background: white;
              border-radius: 50%;
              cursor: pointer;
              font-size: 18px;
              font-weight: 700;
              color: #1d1d1f;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              transition: all 0.2s ease;
            " onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" 
               onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">+</button>
          </div>
          <button onclick="removeFromCart('${item.id}')" style="
            background: #ff3b30;
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(255,59,48,0.3);
          " onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(255,59,48,0.5)'" 
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(255,59,48,0.3)'">×</button>
        </div>
      `).join("");
  }

  popup.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.3s;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    ">
      <button onclick="this.closest('.cart-popup').remove()" style="
        position: absolute;
        top: 20px;
        right: 20px;
        background: #f5f5f7;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        color: #1d1d1f;
        transition: all 0.3s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      " onmouseover="this.style.background='#e5e5e7'; this.style.transform='rotate(90deg)'" 
         onmouseout="this.style.background='#f5f5f7'; this.style.transform='rotate(0deg)'">×</button>
      
      <h2 style="
        font-size: 32px;
        font-weight: 700;
        color: #1d1d1f;
        margin-bottom: 30px;
        padding-right: 40px;
      ">🛒 Миний сагс</h2>
      
      ${cartHTML}
      
      ${cart.length > 0 ? `
        <div style="
          border-top: 2px solid #e5e5e7;
          padding-top: 20px;
          margin-top: 20px;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            padding: 15px;
            background: #f5f5f7;
            border-radius: 12px;
          ">
            <span style="color: #1d1d1f;">Нийт:</span>
            <span style="color: #ff3b30;">₮${totalPrice.toLocaleString()}</span>
          </div>
          <button onclick="goToCheckout()" style="
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #000000 0%, #4a4a4a 50%, #bebebe 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 0, 0, 0.4)'" 
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.3)'">
            💳 Худалдан авах
          </button>
        </div>
      ` : ""}
    </div>
    
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .cart-popup::-webkit-scrollbar {
        width: 8px;
      }
      .cart-popup::-webkit-scrollbar-track {
        background: #f5f5f7;
        border-radius: 10px;
      }
      .cart-popup::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #000000 0%, #4a4a4a 100%);
        border-radius: 10px;
      }
      .cart-popup::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
      }
    </style>
  `;

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });

  document.body.appendChild(popup);
}
// Сагсаас бүтээгдэхүүн устгах функц
function removeFromCart(productId) {
  cart = cart.filter((item) => String(item.id) !== String(productId));
  localStorage.setItem("cartItems", JSON.stringify(cart));
  updateCartBadge();
  const openPopup = document.querySelector(".cart-popup");
  if (openPopup) showCartPopup();
}
// Бүтээгдэхүүний тоог шинэчлэх функц
function updateQuantity(productId, change) {
  const item = cart.find((i) => String(i.id) === String(productId));
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
// Төлбөрийн хуудас руу шилжих функц
function goToCheckout() {
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

// ============= SEARCH =============
function showSearchDropdown(results) {
  const dropdown = document.getElementById("search-dropdown");
  const container = document.getElementById("search-results-container");

  if (!dropdown || !container) return;

  if (results.length === 0) {
    container.innerHTML = '<div class="search-no-results">Бүтээгдэхүүн олдсонгүй</div>';
    dropdown.classList.add("show");
    return;
  }

  const displayResults = results.slice(0, 5);

  container.innerHTML = displayResults
    .map((product) => {
      return `
        <div class="search-result-item" data-product-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='./IMG/Logo.png';">
          <div class="search-result-item-info">
            <div class="search-result-item-name">${product.name}</div>
            <div class="search-result-item-price">${product.price}</div>
          </div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".search-result-item").forEach((item) => {
    item.addEventListener("click", () => {
      const productId = item.getAttribute("data-product-id");
      const searchTerm = document.querySelector(".input").value;
      hideSearchDropdown();
      openDetailedPage("all");
      setTimeout(() => {
        searchProductsInDetailed(searchTerm);
      }, 100);
    });
  });

  dropdown.classList.add("show");
}
// Search dropdown хаах функц
function hideSearchDropdown() {
  const dropdown = document.getElementById("search-dropdown");
  if (dropdown) {
    dropdown.classList.remove("show");
  }
}
// Бүтээгдэхүүн хайх функц
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

  showSearchDropdown(filteredProducts);
}
// Дэлгэрэнгүй хуудсан дээр бүтээгдэхүүн хайх функц
function searchProductsInDetailed(searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") {
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
// Функц дуудалтыг хойшлуулна
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
// Search оролтын сонсогчид тохируулах функц
function setupSearchListeners() {
  const searchInput = document.querySelector(".input");
  const searchIcon = document.querySelector(".icon1");
  const inputWrapper = document.querySelector(".input-wrapper");

  if (!searchInput || !searchIcon || !inputWrapper) {
    setTimeout(setupSearchListeners, 100);
    return;
  }

  const debouncedSearch = debounce((searchTerm) => {
    searchProducts(searchTerm);
  }, 300);

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value;
    debouncedSearch(searchTerm);
  });

  searchInput.addEventListener("blur", (e) => {
    setTimeout(() => {
      const dropdown = document.getElementById("search-dropdown");
      if (dropdown && !dropdown.matches(":hover") && !searchInput.matches(":focus")) {
        hideSearchDropdown();
      }
    }, 200);
  });

  const dropdown = document.getElementById("search-dropdown");
  if (dropdown) {
    dropdown.addEventListener("mouseenter", () => {
      searchInput.focus();
    });
  }

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

// CSS ANIMATIONS
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
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style);

// Бүтээгдэхүүний дэлгэрэнгүй мэдээлэл харуулах функц
function showProductPopupById(id) {
  const product = allProducts.find((p) => String(p.id) === String(id));
  if (!product) return;

  const existing = document.querySelector(".product-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.className = "product-popup";
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10002;
    animation: fadeIn 0.3s;
  `;

  const priceNum = parseFloat(product.price.replace(/[₮,]/g, ""));

  popup.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      position: relative;
      animation: slideUp 0.3s;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    ">
      <button onclick="this.closest('.product-popup').remove()" style="
        position: absolute;
        top: 20px;
        right: 20px;
        background: #f5f5f7;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        color: #1d1d1f;
        transition: all 0.3s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      " onmouseover="this.style.background='#e5e5e7'; this.style.transform='rotate(90deg)'" 
         onmouseout="this.style.background='#f5f5f7'; this.style.transform='rotate(0deg)'">×</button>
      
      <img src="${product.image}" alt="${product.name}" style="
        max-width: 300px;
        height: 300px;
        object-fit: contain;
        border-radius: 12px;
        margin: 0 auto 30px;
        display: block;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      " onerror="this.src='./IMG/Logo.png';" />
      
      <h2 style="
        font-size: 32px;
        font-weight: 700;
        color: #1d1d1f;
        margin-bottom: 15px;
        padding-right: 30px;
      ">${product.name}</h2>
      
      <p style="
        font-size: 28px;
        color: #ff3b30;
        font-weight: 700;
        margin-bottom: 20px;
      ">₮${priceNum.toLocaleString()}</p>
      
      <p style="
        font-size: 16px;
        color: #86868b;
        line-height: 1.6;
        margin-bottom: 30px;
      ">${product.description || "Дэлгэрэнгүй мэдээлэл байхгүй"}</p>
      
      <button onclick="addToCart('${product.id}', '${product.name}', '${product.price}'); this.closest('.product-popup').remove();" style="
        width: 100%;
        padding: 18px;
        background: linear-gradient(135deg, #000000 0%, #4a4a4a 50%, #bebebe 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 0, 0, 0.4)'" 
         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.3)'">
        🛒 Сагсанд нэмэх
      </button>
    </div>
  `;

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });

  document.body.appendChild(popup);
}

// DOM ачаалагдсан үед эхлэх
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
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

    loadProducts();
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

  loadProducts();
}