let allProducts = [];
const API_Product_URL = "http://localhost:3000";

// JSON-оос бүх бүтээгдэхүүн авах (хайлтын зориулалтаар)
async function loadAllData() {
  try {
    const response = await fetch(`${API_Product_URL}/Products`);
    if (!response.ok) {
      console.error("product.json файл олдсонгүй");
      return;
    }
    const data = await response.json();

    allProducts = [
      ...(data.newProducts || []),
      ...(data.recommendedProducts || []),
      ...(data.accessories || []),
    ];

    const searchResultsContainer = document.getElementById("search-results");
    if (searchResultsContainer) {
      displayProducts(allProducts, "search-results", true);
    }
  } catch (error) {
    console.error("loadAllData алдаа:", error);
  }
}

// DOM ачаалагдсаны дараа ажиллуулах
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAllData);
} else {
  loadAllData();
}

// Сагсны state
let cart = [];

// ============= LOCALSTORAGE ХОЛБОХ =============
// Хуудас ачаалагдахад localStorage-с сагсыг авах
window.addEventListener("DOMContentLoaded", () => {
  const savedCart = localStorage.getItem("cartItems");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartBadge();
      console.log("✅ Сагсны өгөгдөл localStorage-с ачаалагдлаа:", cart);
    } catch (error) {
      console.error("localStorage уншихад алдаа:", error);
      cart = [];
    }
  }
});

// Сагсыг шинэчлэх функц (localStorage-д хадгалах)
function updateCartBadge() {
  const cartIcon = document.getElementById("cart-icon");
  let badge = cartIcon.querySelector(".cart-badge");

  // localStorage-д хадгалах
  localStorage.setItem("cartItems", JSON.stringify(cart));

  if (cart.length > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      cartIcon.appendChild(badge);
    }
    badge.textContent = cart.length;
  } else {
    if (badge) {
      badge.remove();
    }
  }
}

// Сагсанд нэмэх функц (localStorage-д хадгалах)
function addToCart(product) {
  // Нэвтэрсэн эсэхийг шалгах
  if (typeof requireLogin === "function" && !requireLogin()) {
    return; // Хэрэв нэвтэрээгүй бол popup нээгдэж, функц дуусна
  }

  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  // localStorage-д хадгалах
  localStorage.setItem("cartItems", JSON.stringify(cart));

  updateCartBadge();

  // Амжилттай мэдэгдэл
  showNotification(`${product.name} сагсанд нэмэгдлээ!`);
}

// Сагснаас хасах функц (localStorage шинэчлэх)
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);

  // localStorage шинэчлэх
  localStorage.setItem("cartItems", JSON.stringify(cart));

  updateCartBadge();
  updateCartContent();
}

// Тоо ширхэг өөрчлөх (localStorage шинэчлэх)
function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      // localStorage шинэчлэх
      localStorage.setItem("cartItems", JSON.stringify(cart));
      updateCartBadge();
      updateCartContent();
    }
  }
}

// ============= CHECKOUT РУУ ШИЛЖИХ =============
function goToCheckout() {
  // Нэвтэрсэн эсэхийг шалгах
  if (typeof requireLogin === "function" && !requireLogin()) {
    return; // Хэрэв нэвтэрээгүй бол popup нээгдэж, функц дуусна
  }

  if (cart.length === 0) {
    alert("⚠️ Таны сагс хоосон байна!\n\nЭхлээд бүтээгдэхүүн сонгоно уу.");
    return;
  }

  // localStorage-д сагсны өгөгдөл хадгалах
  localStorage.setItem("cartItems", JSON.stringify(cart));

  // Мэдэгдэл харуулах
  showNotification("💳 Төлбөрийн хуудас руу шилжиж байна...");

  // 500ms дараа checkout хуудас руу шилжих
  setTimeout(() => {
    window.location.href = "./tulbur/tulbur.html";
  }, 500);
}

// Сагсны агуулгыг шинэчлэх (popup-г дахин нээхгүй)
function updateCartContent() {
  const popup = document.querySelector(".cart-popup");
  if (!popup) return;

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let cartHTML = "";
  if (cart.length === 0) {
    cartHTML =
      '<p style="text-align: center; color: #86868b; padding: 40px;">Таны сагс хоосон байна</p>';
  } else {
    cartHTML = cart
      .map(
        (item) => `
          <div class="cart-item" style="
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f5f5f7;
            border-radius: 12px;
            margin-bottom: 15px;
          ">
            <img src="${item.image}" alt="${item.name}" style="
              width: 60px;
              height: 60px;
              object-fit: cover;
              border-radius: 8px;
            " />
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 5px;">${
                item.name
              }</div>
              <div style="color: #06c; font-weight: 700;">₮${item.price.toLocaleString()}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button onclick="updateQuantity(${item.id}, -1)" style="
                width: 30px;
                height: 30px;
                border: none;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                font-weight: 700;
              ">-</button>
              <span style="font-weight: 600; min-width: 20px; text-align: center;">${
                item.quantity
              }</span>
              <button onclick="updateQuantity(${item.id}, 1)" style="
                width: 30px;
                height: 30px;
                border: none;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                font-weight: 700;
              ">+</button>
            </div>
            <button onclick="removeFromCart(${item.id})" style="
              background: #ff3b30;
              color: white;
              border: none;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              cursor: pointer;
              font-size: 16px;
            ">×</button>
          </div>
        `
      )
      .join("");
  }

  const contentDiv = popup.querySelector('div[style*="background: white"]');
  if (contentDiv) {
    contentDiv.innerHTML = `
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
      " onmouseover="this.style.background='#e5e5e7'" onmouseout="this.style.background='#f5f5f7'">×</button>
      
      <h2 style="
        font-size: 32px;
        font-weight: 700;
        color: #1d1d1f;
        margin-bottom: 30px;
      ">Миний сагс</h2>
      
      ${cartHTML}
      
      ${
        cart.length > 0
          ? `
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
            ">
              <span>Нийт:</span>
              <span style="color: #06c;">₮${totalPrice.toLocaleString()}</span>
            </div>
            <button onclick="goToCheckout()" style="
              width: 100%;
              padding: 16px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 18px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
              💳 Худалдан авах
            </button>
          </div>
        `
          : ""
      }
    `;
  }
}

// Мэдэгдэл харуулах
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
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
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
    cartHTML =
      '<p style="text-align: center; color: #86868b; padding: 40px;">Таны сагс хоосон байна</p>';
  } else {
    cartHTML = cart
      .map(
        (item) => `
          <div class="cart-item" style="
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f5f5f7;
            border-radius: 12px;
            margin-bottom: 15px;
          ">
            <img src="${item.image}" alt="${
          item.name
        }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 5px;">${
                item.name
              }</div>
              <div style="color: #06c; font-weight: 700;">₮${item.price.toLocaleString()}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button onclick="updateQuantity(${item.id}, -1)" style="
                width: 30px;
                height: 30px;
                border: none;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                font-weight: 700;
              ">-</button>
              <span style="font-weight: 600; min-width: 20px; text-align: center;">${
                item.quantity
              }</span>
              <button onclick="updateQuantity(${item.id}, 1)" style="
                width: 30px;
                height: 30px;
                border: none;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                font-weight: 700;
              ">+</button>
            </div>
            <button onclick="removeFromCart(${item.id})" style="
              background: #ff3b30;
              color: white;
              border: none;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              cursor: pointer;
              font-size: 16px;
            ">×</button>
          </div>
        `
      )
      .join("");
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
      " onmouseover="this.style.background='#e5e5e7'" onmouseout="this.style.background='#f5f5f7'">×</button>
      
      <h2 style="
        font-size: 32px;
        font-weight: 700;
        color: #1d1d1f;
        margin-bottom: 30px;
      ">Миний сагс</h2>
      
      ${cartHTML}
      
      ${
        cart.length > 0
          ? `
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
            ">
              <span>Нийт:</span>
              <span style="color: #06c;">₮${totalPrice.toLocaleString()}</span>
            </div>
            <button onclick="goToCheckout()" style="
              width: 100%;
              padding: 16px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 18px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
              💳 Худалдан авах
            </button>
          </div>
        `
          : ""
      }
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
      @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
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

// Сагсны icon дээр дарахад сагс харуулах
const cartIcon = document.getElementById("cart-icon");
if (cartIcon) {
  cartIcon.addEventListener("click", (e) => {
    // Check if user is logged in
    if (typeof requireLogin === "function" && !requireLogin()) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    showCartPopup();
  });
}

// API-аас өгөгдөл татах функц
async function fetchProducts(tag) {
  try {
    const response = await fetch(`${API_Product_URL}/Products?new=${tag}`);
    if (!response.ok) {
      throw new Error(`HTTP алдаа: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // if (!data[category]) {
    //   console.warn(`${category} категори олдсонгүй`);
    //   return [];
    // }
    return data;
  } catch (error) {
    console.error("Fetch алдаа:", error);
    console.error("Алдааны мэдээлэл:", error.message);
    throw error;
  }
}

async function fetchCatProducts(category) {
  try {
    const response = await fetch(
      `${API_Product_URL}/Products?category=${category}`
    );
    if (!response.ok) {
      throw new Error(`HTTP алдаа: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data && data.length === 0) {
      console.warn(`${category} категори олдсонгүй`);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Fetch алдаа:", error);
    console.error("Алдааны мэдээлэл:", error.message);
    throw error;
  }
}

// Үнийг тооноос string болгох функц
function parsePrice(priceStr) {
  if (typeof priceStr === "number") return priceStr;
  return parseInt(priceStr.replace(/[₮,]/g, ""));
}

// Sale percentage-ийг badge-аас гаргаж авах
function getSalePercentage(badgeText) {
  if (!badgeText) return 0;
  const match = badgeText.match(/(\d+)%/);
  return match ? parseInt(match[1]) : 0;
}

// Үнийг форматлах функц
function formatPrice(price) {
  if (typeof price === "number") {
    return `₮${price.toLocaleString()}`;
  }
  return price;
}

// Sale үнэ тооцоолох
function calculateSalePrice(currentPrice, salePercentage) {
  if (salePercentage === 0) return null;
  const numericPrice =
    typeof currentPrice === "number" ? currentPrice : parsePrice(currentPrice);
  const originalPrice = numericPrice / (1 - salePercentage / 100);
  return Math.round(originalPrice);
}

// Store current page for each product section
const productPages = {
  NEW: 0,
  "featured-products": 0,
  accessories: 0,
};

// Store all products for each section
const allProductsData = {
  "new-products": [],
  "featured-products": [],
  accessories: [],
};

// Бүтээгдэхүүнүүдийг харуулах функц
function displayProducts(products, containerId, isInitialLoad = false) {
  const container = document.querySelector(`#${containerId}`);
  container.innerHTML = "";

  if (!products || products.length === 0) {
    container.innerHTML = '<div class="loading">Бүтээгдэхүүн олдсонгүй</div>';
    return;
  }
  allProductsData[containerId] = products;

  // Store all products

  // Display first 4 products
  showProductPage(containerId, 0);
}

// Show specific page of products (4 products per page)
function showProductPage(containerId, page) {
  const container = document.getElementById(containerId);
  console.log(`Showing page ${page} for container ${containerId}`);
  const products = allProductsData[containerId];
  console.log(`Products for ${containerId}:`, products);

  if (!products || products.length === 0) return;

  // Calculate which products to show
  const productsPerPage = 4;
  const startIndex = page * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = products.slice(startIndex, endIndex);

  container.innerHTML = "";

  productsToShow.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";

    // Sale percentage-ийг шалгах
    const salePercentage = getSalePercentage(product.new);
    const originalPrice =
      salePercentage > 0
        ? calculateSalePrice(product.price, salePercentage)
        : null;

    const displayPrice = formatPrice(product.price);
    const displayOriginalPrice = originalPrice
      ? formatPrice(originalPrice)
      : null;

    // Animation-г дэмжихгүй тохиолдолд fallback
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";

    // Animation-г ашиглах
    requestAnimationFrame(() => {
      card.style.opacity = "0";
      card.style.transform = "translateY(30px)";
      card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;

      // Animation дуусаагүй тохиолдолд fallback
      setTimeout(() => {
        if (card.style.opacity === "0") {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }
      }, 1000 + index * 100);
    });

    // Price HTML үүсгэх
    const priceHTML =
      salePercentage > 0 && displayOriginalPrice
        ? `
        <div class="product-price-container">
          <div class="product-price original-price">${displayOriginalPrice}</div>
          <div class="product-price sale-price">${displayPrice}</div>
        </div>
      `
        : `<div class="product-price">${displayPrice}</div>`;

    product.category == "accessory"
      ? (card.innerHTML = `
    <img src="${product.image}" alt="${
          product.name
        }" class="product-image" style="width: 100%; max-width: 250px; height: 250px; object-fit: contain; margin-bottom: 15px;" onerror="this.src='IMG/Logo.png'; this.alt='Зураг олдсонгүй';">
    <div class="product-details">
      <div class="product-info">
         <div class="product-name">${product.name}</div>
         ${priceHTML}
      </div>
      <div class="product-icon">${product.icon || ""}</div>
    </div> `)
      : (card.innerHTML = `
    ${product.new ? `<div class="product-new">${product.new}</div>` : ""}
    <img src="${product.image}" alt="${
          product.name
        }" class="product-image" style="width: 100%; max-width: 250px; height: 250px; object-fit: contain; margin-bottom: 15px;" onerror="this.src='IMG/Logo.png'; this.alt='Зураг олдсонгүй';">
    <div class="product-details">
      <div class="product-info">
         <div class="product-name">${product.name}</div>
         ${priceHTML}
      </div>
      <div class="product-icon">${product.icon || ""}</div>
    </div>
  `);

    // Make entire card clickable to show product popup
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".product-icon")) {
        showProductPopup(product);
      }
    });
    card.style.cursor = "pointer";

    const iconElement = card.querySelector(".product-icon");
    if (iconElement && product.icon) {
      iconElement.addEventListener("click", (e) => {
        e.stopPropagation();
        showProductPopup(product);
      });
      iconElement.style.cursor = "pointer";
    }

    container.appendChild(card);
  });

  // Update arrow buttons
  updateArrowButtons(containerId, page, products.length);
}

// Update arrow button states
function updateArrowButtons(containerId, currentPage, totalProducts) {
  const productsPerPage = 4;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const prevBtn = document.getElementById(`${containerId}-prev`);
  const nextBtn = document.getElementById(`${containerId}-next`);

  if (prevBtn) {
    prevBtn.disabled = currentPage === 0;
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages - 1;
  }
}

// Scroll products (next/prev page)
function scrollProducts(containerId, direction) {
  const products = allProductsData[containerId];
  if (!products || products.length === 0) return;

  const productsPerPage = 4;
  const totalPages = Math.ceil(products.length / productsPerPage);
  let currentPage = productPages[containerId];
  console.log(`Current page for ${containerId}: ${currentPage}`);

  if (direction === "next" && currentPage < totalPages - 1) {
    currentPage++;
  } else if (direction === "prev" && currentPage > 0) {
    currentPage--;
  } else {
    return; // Can't scroll further
  }

  productPages[containerId] = currentPage;
  showProductPage(containerId, currentPage);
}

// Хайлт хийх функц
async function initProducts() {
  try {
    const newProducts = await fetchProducts("NEW");
    const recommendedProducts = await fetchProducts("20% OFF");
    const accessories = await fetchCatProducts("accessory");

    displayProducts(newProducts, "NEW", true);
    displayProducts(recommendedProducts, "featured-products", true);
    displayProducts(accessories, "accessory", true);
  } catch (err) {
    console.error("Init error:", err);
    // Алдааны мессежийг бүх grid дээр харуулах
    const containers = ["new-products", "featured-products", "accessories"];
    containers.forEach((containerId) => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML =
          '<div class="error">Өгөгдөл ачаалахад алдаа гарлаа. Хуудсыг дахин ачаална уу.</div>';
      }
    });
  }
}

initProducts();

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
      const salePercentage = getSalePercentage(product.new);
      const originalPrice =
        salePercentage > 0
          ? calculateSalePrice(product.price, salePercentage)
          : null;
      const displayPrice = formatPrice(product.price);
      const displayOriginalPrice = originalPrice
        ? formatPrice(originalPrice)
        : null;

      const priceHTML =
        salePercentage > 0 && displayOriginalPrice
          ? `<div class="search-result-item-price original-price">${displayOriginalPrice}</div>
           <div class="search-result-item-price sale-price">${displayPrice}</div>`
          : `<div class="search-result-item-price">${displayPrice}</div>`;

      return `
        <div class="search-result-item" data-product-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='IMG/Logo.png';">
          <div class="search-result-item-info">
            <div class="search-result-item-name">${product.name}</div>
            <div style="display: flex; align-items: center; gap: 4px;">
              ${priceHTML}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  // Item дээр дарахад popup харуулах
  container.querySelectorAll(".search-result-item").forEach((item) => {
    item.addEventListener("click", () => {
      const productId = parseInt(item.getAttribute("data-product-id"));
      const product = allProducts.find((p) => p.id === productId);
      if (product) {
        showProductPopup(product);
        hideSearchDropdown();
      }
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
    loadAllProducts();
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
} // ✅ Энэ хаалтыг нэмнэ үү!

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
      searchProducts(searchTerm);
    } else {
      loadAllProducts();
    }
  });

  // Enter товч дарахад хайх
  inputWrapper.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const searchTerm = e.target.value || searchInput.value;
      if (searchTerm.trim() !== "") {
        searchProducts(searchTerm);
      } else {
        loadAllProducts();
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

// Dropdown search функц
function setupDropdownSearch() {
  const dropdownSearchInput = document.getElementById("dropdown-search-input");
  const dropdownItems = document.querySelectorAll(".dropdown-item");

  if (!dropdownSearchInput || dropdownItems.length === 0) {
    setTimeout(setupDropdownSearch, 100);
    return;
  }

  // Debounce-тай live search
  const debouncedDropdownSearch = debounce((searchTerm) => {
    filterDropdownItems(searchTerm, dropdownItems);
  }, 200);

  // Live search - input бичих бүрт автоматаар шүүх
  dropdownSearchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    debouncedDropdownSearch(searchTerm);
  });

  // Dropdown item дээр дарахад категориар шүүх
  dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
      const category = item.getAttribute("data-category");
      if (category) {
        filterProductsByCategory(category);
        // Dropdown-г хаах
        const menuItem = item.closest(".menu-item");
        if (menuItem) {
          menuItem.dispatchEvent(new MouseEvent("mouseleave"));
        }
      }
    });
  });
}

// Dropdown item-уудыг шүүх
function filterDropdownItems(searchTerm, items) {
  items.forEach((item) => {
    const itemText = item.textContent.toLowerCase().trim();
    if (searchTerm === "" || itemText.includes(searchTerm)) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });
}

// Категориар бүтээгдэхүүн шүүх
function filterProductsByCategory(category) {
  const filteredProducts = allProducts.filter((product) => {
    return product.category?.toLowerCase() === category.toLowerCase();
  });

  if (filteredProducts.length > 0) {
    displayProducts(filteredProducts, "new-products", true);
    displayProducts(filteredProducts, "featured-products", true);
    displayProducts(filteredProducts, "accessories", true);

    // Scroll to products section
    const firstSection = document.querySelector(".container");
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } else {
    // Хэрэв бүтээгдэхүүн олдохгүй бол бүх бүтээгдэхүүнийг харуулах
    loadAllProducts();
  }
}

// DOM ачаалагдсаны дараа dropdown search listener-уудыг тохируулах
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupDropdownSearch);
} else {
  setupDropdownSearch();
}

// Бүх бүтээгдэхүүнийг ачаалах
async function loadAllProducts() {
  try {
    const newProducts = await fetchProducts("NEW");

    // const recommendedProducts = await fetchProducts("recommendedProducts");
    // displayProducts(recommendedProducts, "featured-products", true);

    const accessories = await fetchCatProducts("accessory");
    displayProducts(accessories, "accessory", true);
  } catch (error) {
    console.error("Алдаа гарлаа:", error);
    document.querySelectorAll(".product-grid").forEach((grid) => {
      grid.innerHTML =
        '<div class="error">Өгөгдөл ачаалахад алдаа гарлаа. Хуудсыг дахин ачаална уу.<br><small style="color: #86868b;">Алдаа: ' +
        error.message +
        "</small></div>";
    });
  }
}

// Бүтээгдэхүүн дээр дарахад popup харуулах (localStorage холбоотой)
function showProductPopup(product) {
  const popup = document.createElement("div");
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

  const numericPrice = parsePrice(product.price);
  const salePercentage = getSalePercentage(product.new);
  const originalPrice =
    salePercentage > 0
      ? calculateSalePrice(product.price, salePercentage)
      : null;
  const displayPrice = formatPrice(product.price);
  const displayOriginalPrice = originalPrice
    ? formatPrice(originalPrice)
    : null;

  const priceHTML =
    salePercentage > 0 && displayOriginalPrice
      ? `
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 30px;">
        <p style="
          font-size: 20px;
          color: #86868b;
          font-weight: 500;
          text-decoration: line-through;
          margin: 0;
        ">${displayOriginalPrice}</p>
        <p style="
          font-size: 32px;
          color: #ff3b30;
          font-weight: 700;
          margin: 0;
        ">${displayPrice}</p>
      </div>
    `
      : `
      <p style="
        font-size: 28px;
        color: #06c;
        font-weight: 700;
        margin-bottom: 30px;
      ">${displayPrice}</p>
    `;

  popup.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      position: relative;
      animation: slideUp 0.3s;
    ">
      <button onclick="this.closest('[style*=fixed]').remove()" style="
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
      " onmouseover="this.style.background='#e5e5e7'" onmouseout="this.style.background='#f5f5f7'">×</button>
      
      <img src="${product.image}" alt="${product.name}" style="
        max-width: 300px;
        height: 300px;
        object-fit: contain;
        border-radius: 12px;
        margin: 0 auto 30px;
        display: block;
      " onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
      <div style="
        max-width: 300px;
        height: 300px;
        background: #f5f5f7;
        border-radius: 12px;
        margin: 0 auto 30px;
        display: none;
        align-items: center;
        justify-content: center;
        color: #86868b;
        font-size: 18px;
      ">Зураг олдсонгүй</div>
      
      <h2 style="
        font-size: 32px;
        font-weight: 700;
        color: #1d1d1f;
        margin-bottom: 15px;
      ">${product.name}</h2>
      
      ${priceHTML}
      
      <p style="
        font-size: 16px;
        color: #86868b;
        line-height: 1.6;
        margin-bottom: 30px;
      ">Энэхүү бүтээгдэхүүн нь хамгийн сүүлийн үеийн технологи, өндөр чанартай материалаар хийгдсэн бөгөөд таны өдөр тутмын амьдралд хялбар байдал авчирна.</p>
      
      <button id="add-btn-${product.id}" style="
        width: 100%;
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
        Сагсанд нэмэх
      </button>
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
    </style>
  `;

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });

  document.body.appendChild(popup);

  // Товч дээр event listener нэмэх
  const addBtn = document.getElementById(`add-btn-${product.id}`);
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addToCart({
        id: product.id,
        name: product.name,
        price: numericPrice,
        image: product.image,
      });
      popup.remove();
    });
  }
}

// Хуудас ачаалагдахад бүтээгдэхүүнүүдийг харуулах
window.addEventListener("load", loadAllProducts);
