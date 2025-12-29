const API_Product_URL = "http://localhost:3000";

let products = {
  newProducts: [],
  recommendedProducts: [],
  accessories: [],
};

let allProducts = []; // Бүх бүтээгдэхүүн
let cart = [];
let currentFilter = "all";
let currentCategory = "all";

// API-аас бүтээгдэхүүн татаж авах функц
async function fetchProducts(tag) {
  try {
    const response = await fetch(`${API_Product_URL}/Products?new=${tag}`);
    if (!response.ok) {
      throw new Error(`HTTP алдаа: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch алдаа:", error);
    throw error;
  }
}
// Категориар бүтээгдэхүүн татах функц
async function fetchCatProducts(category) {
  try {
    const response = await fetch(
      `${API_Product_URL}/Products?category=${category}`
    );
    if (!response.ok) {
      throw new Error(`HTTP алдаа: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Fetch алдаа:", error);
    throw error;
  }
}

// Бүтээгдэхүүн ачаалах функц
async function loadProducts() {
  try {
    const newProducts = await fetchProducts("NEW");
    const recommendedProducts = await fetchProducts("20% OFF");
    const accessories = await fetchCatProducts("accessory");

    products = {
      newProducts: newProducts || [],
      recommendedProducts: recommendedProducts || [],
      accessories: accessories || [],
    };

    // Combine all products for search
    allProducts = [
      ...(products.newProducts || []),
      ...(products.recommendedProducts || []),
      ...(products.accessories || []),
    ];

    displayProducts(products.accessories, "new-products", 0);
  } catch (error) {
    console.error("Fetch алдаа:", error);
    document.getElementById("new-products").innerHTML =
      '<div class="loading">Өгөгдөл ачаалахад алдаа гарлаа</div>';
  }
}
// Бүтээгдэхүүн харуулах функц
function displayProducts(productsArray, containerId, limit = 5) {
  const container = document.getElementById(containerId);
  const list =
    limit && limit > 0 ? productsArray.slice(0, limit) : productsArray;
  container.innerHTML = list
    .map(
      (product) => `
        <div class="product-card">
          ${product.new ? `<div class="product-new">${product.new}</div>` : ""}
          <img src="${product.image}" alt="${product.name
        }" class="product-image">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${product.price}</div>
        </div>
      `
    )
    .join("");
}
// Дэлгэрэнгүй хуудсыг нээх функц
async function openDetailedPage(category) {
  currentCategory = category;
  const page = document.getElementById("detailed-page");
  const title = document.getElementById("detailed-title");
  const subtitle = document.getElementById("detailed-subtitle");

  title.textContent = "Бүх бүтээгдэхүүн";
  subtitle.textContent = "Таны хайж байгаа бүгдийг нэг дор";

  page.classList.add("active");
  // Анхдагч байдлаар "all" шүүлтүүрийг сонгох
  const allButton =
    document.querySelector(".filter-btn.active") ||
    document.querySelector(".filter-btn");
  await filterProducts("all", allButton);
}
// Дэлгэрэнгүй хуудсыг хаах функц
function closeDetailedPage() {
  document.getElementById("detailed-page").classList.remove("active");
}
// Бүтээгдэхүүн шүүх функц
async function filterProducts(category, buttonElement) {
  currentFilter = category;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (buttonElement) {
    buttonElement.classList.add("active");
  } else if (typeof event !== "undefined" && event && event.target) {
    event.target.classList.add("active");
  }

  if (allProducts.length === 0) {
    await loadProducts();
  }

  const filtered =
    category === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === category);

  displayDetailedProducts(filtered);
}
// Дэлгэрэнгүй хуудсан дахь бүтээгдэхүүн харуулах функц
function displayDetailedProducts(productsArray) {
  const container = document.getElementById("detailed-grid");
  container.innerHTML = productsArray
    .map(
      (product, index) => `
        <div class="detailed-card" onclick="showProductPopupById(${product.id
        })" style="animation: fadeInUp 0.6s ease forwards ${index * 0.05
        }s; opacity: 0; cursor:pointer;">
          ${product.new ? `<div class="product-new">${product.new}</div>` : ""}
          <img src="${product.image}" alt="${product.name
        }" class="detailed-card-image">
          <div class="detailed-card-info">
            <div class="detailed-card-name">${product.name}</div>
            <div class="detailed-card-price">${product.price}</div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id
        }, '${product.name}', '${product.price}')">
              <i class="fa-solid fa-cart-plus"></i> Сагсанд нэмэх
            </button>
          </div>
        </div>
      `
    )
    .join("");
}
// Сагсанд нэмэх функц
function addToCart(idOrObj, name, price) {
  if (typeof requireLogin === "function" && !requireLogin()) return;

  let id = idOrObj && typeof idOrObj === "object" ? idOrObj.id : idOrObj;
  let productName =
    idOrObj && typeof idOrObj === "object" ? idOrObj.name : name;
  let productPrice =
    idOrObj && typeof idOrObj === "object"
      ? parseFloat(String(idOrObj.price).replace(/[₮,]/g, "")) || 0
      : typeof price === "string"
        ? parseFloat(String(price).replace(/[₮,]/g, "")) || 0
        : Number(price) || 0;

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
// Сагсны badge-г шинэчлэх функц
function updateCartBadge() {
  const cartIcon = document.getElementById("cart-icon");
  if (!cartIcon) return;
  let badge = cartIcon.querySelector(".cart-badge");

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
// Мессеж харуулах функц
function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #000000ff 0%, #5e5e5eff 100%);
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

// CSS animations нэмэх
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

// ================= PRODUCT QUICK VIEW (Шинэ popup) =================
function showProductPopupById(id) {
  const product = allProducts.find((p) => Number(p.id) === Number(id));
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

  const priceNum = parseFloat(String(product.price).replace(/[₮,]/g, ""));

  popup.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 700px;
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
        z-index: 1;
      " onmouseover="this.style.background='#e5e5e7'; this.style.transform='rotate(90deg)'" 
         onmouseout="this.style.background='#f5f5f7'; this.style.transform='rotate(0deg)'">×</button>
      
      <div style="display: flex; gap: 30px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px;">
          ${product.new ? `<div style="
            position: absolute;
            top: 50px;
            left: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          ">${product.new}</div>` : ""}
          
          <img src="${product.image}" alt="${product.name}" style="
            width: 100%;
            max-width: 350px;
            height: 350px;
            object-fit: contain;
            border-radius: 12px;
            margin: 0 auto;
            display: block;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            background: #f9f9f9;
          " onerror="this.src='./IMG/Logo.png';" />
        </div>
        
        <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column;">
          <h2 style="
            font-size: 28px;
            font-weight: 700;
            color: #1d1d1f;
            margin: 0 0 15px 0;
            padding-right: 30px;
            line-height: 1.2;
          ">${product.name}</h2>
          
          <div style="
            font-size: 32px;
            color: #ff3b30;
            font-weight: 700;
            margin-bottom: 20px;
          ">₮${priceNum.toLocaleString()}</div>
          
          <div style="
            padding: 15px;
            background: #f5f5f7;
            border-radius: 12px;
            margin-bottom: 20px;
          ">
            <div style="font-weight: 600; color: #1d1d1f; margin-bottom: 8px;">📦 Дэлгэрэнгүй мэдээлэл</div>
            <p style="
              font-size: 15px;
              color: #666;
              line-height: 1.6;
              margin: 0;
            ">${product.description || "Бүтээгдэхүүний дэлгэрэнгүй тайлбар одоогоор байхгүй байна."}</p>
          </div>
          
          <div style="
            display: flex;
            gap: 12px;
            margin-top: auto;
          ">
            <button onclick="addToCart(${product.id}, '${product.name}', '${product.price}'); this.closest('.product-popup').remove();" style="
              flex: 1;
              padding: 16px 24px;
              background: linear-gradient(135deg, #000000 0%, #4a4a4a 50%, #bebebe 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 0, 0, 0.4)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.3)'">
              <i class="fa-solid fa-cart-plus"></i> Сагсанд нэмэх
            </button>
            
            <button onclick="addToCart(${product.id}, '${product.name}', '${product.price}'); goToCheckout();" style="
              padding: 16px 24px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
              white-space: nowrap;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.5)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.4)'">
              💳 Шууд авах
            </button>
          </div>
          
          <div style="
            margin-top: 20px;
            padding: 12px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 8px;
          ">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              ℹ️ <strong>Анхаар:</strong> Үнэ болон бараа байгаа эсэх талаар лавлах утас: 7777-7777
            </p>
          </div>
        </div>
      </div>
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
      
      @media (max-width: 768px) {
        .product-popup > div {
          padding: 20px !important;
          max-width: 95% !important;
        }
        .product-popup img {
          height: 250px !important;
        }
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
    item.addEventListener("click", async () => {
      const productId = parseInt(item.getAttribute("data-product-id"));
      const searchTerm = document.querySelector(".input").value;
      hideSearchDropdown();
      await openDetailedPage("all");
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
  searchIcon.addEventListener("click", async () => {
    const searchTerm = searchInput.value;
    if (searchTerm.trim() !== "") {
      await openDetailedPage("all");
      setTimeout(() => {
        searchProductsInDetailed(searchTerm);
      }, 100);
      hideSearchDropdown();
    }
  });

  // Enter товч дарахад хайх
  inputWrapper.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const searchTerm = e.target.value || searchInput.value;
      if (searchTerm.trim() !== "") {
        await openDetailedPage("all");
        setTimeout(() => {
          searchProductsInDetailed(searchTerm);
        }, 100);
        hideSearchDropdown();
      }
    }
  });
}

// DOM ачаалагдсаны дараа search listener-уудыг тохируулах
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupSearchListeners);
} else {
  setupSearchListeners();
}

// Initialize
// Load cart from localStorage
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
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

loadProducts();
// Сагсны popup харуулах функц
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
            <button onclick="updateQuantity(${item.id}, -1)" style="
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
            <button onclick="updateQuantity(${item.id}, 1)" style="
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
          <button onclick="removeFromCart(${item.id})" style="
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

// Сагснаас устгах функц
function removeFromCart(productId) {
  cart = cart.filter((item) => Number(item.id) !== Number(productId));
  localStorage.setItem("cartItems", JSON.stringify(cart));
  updateCartBadge();
  const openPopup = document.querySelector(".cart-popup");
  if (openPopup) showCartPopup();
}

// Тоо ширхэг өөрчлөх функц
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

// Төлбөр хийх хуудас руу шилжих
function goToCheckout() {
  if (cart.length === 0) {
    alert("⚠️ Таны сагс хоосон байна!\n\nЭхлээд бүтээгдэхүүн сонгоно уу.");
    return;
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));
  showNotification("💳 Төлбөрийн хуудас руу шилжиж байна...");
  setTimeout(() => {
    window.location.href = "../tulbur/tulbur.html"; // Төлбөрийн хуудасны зам
  }, 500);
}