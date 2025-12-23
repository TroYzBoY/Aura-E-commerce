let allProducts = [];

// JSON-оос бүх бүтээгдэхүүн авах
async function loadAllData() {
  const data = await fetch("products.json").then(res => res.json());

  allProducts = [
    ...data.newProducts,
    ...data.recommendedProducts,
    ...data.accessories
  ];

  displayProducts(allProducts, "search-results", true);
}

loadAllData();

// Сагсны state
let cart = [];

// Сагсыг шинэчлэх функц
function updateCartBadge() {
  const cartIcon = document.getElementById("cart-icon");
  let badge = cartIcon.querySelector(".cart-badge");

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

// Сагсанд нэмэх функц
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartBadge();

  // Амжилттай мэдэгдэл
  showNotification(`${product.name} сагсанд нэмэгдлээ!`);
}

// Сагснаас хасах функц
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartBadge();
  updateCartContent(); // Popup-г дахин ачаалахгүйгээр зөвхөн агуулгыг шинэчлэх
}

// Тоо ширхэг өөрчлөх
function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartBadge();
      updateCartContent(); // Popup-г дахин ачаалахгүйгээр зөвхөн агуулгыг шинэчлэх
    }
  }
}

// Сагсны агуулгыг шинэчлэх (popup-г дахин нээхгүй)
function updateCartContent() {
  const popup = document.querySelector('.cart-popup');
  if (!popup) return;

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let cartHTML = "";
  if (cart.length === 0) {
    cartHTML = '<p style="text-align: center; color: #86868b; padding: 40px;">Таны сагс хоосон байна</p>';
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
            <div style="font-size: 50px;">${item.image}</div>
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 5px;">${item.name}</div>
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
              <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
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
      
      ${cart.length > 0
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
            <button onclick="alert('Худалдан авалт баталгаажлаа!')" style="
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
              Худалдан авах
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

// Сагсны popup харуулах
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
    cartHTML = '<p style="text-align: center; color: #86868b; padding: 40px;">Таны сагс хоосон байна</p>';
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
            <div style="font-size: 50px;">${item.image}</div>
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 5px;">${item.name}</div>
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
              <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
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
      
      ${cart.length > 0
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
            <button onclick="alert('Худалдан авалт баталгаажлаа!')" style="
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
              Худалдан авах
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
document.getElementById("cart-icon").addEventListener("click", showCartPopup);

// API-аас өгөгдөл татах функц
async function fetchProducts(category) {
  try {
    const response = await fetch("product.json");
    if (!response.ok) {
      throw new Error("Өгөгдөл ачаалахад алдаа гарлаа");
    }
    const data = await response.json();
    return data[category] || [];
  } catch (error) {
    console.error("Fetch алдаа:", error);
    throw error;
  }
}

// Үнийг тооноос string болгох функц
function parsePrice(priceStr) {
  if (typeof priceStr === 'number') return priceStr;
  // "₮8,999,000" -> 8999000
  return parseInt(priceStr.replace(/[₮,]/g, ''));
}

// Бүтээгдэхүүнүүдийг харуулах функц
function displayProducts(products, containerId, isInitialLoad = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!products || products.length === 0) {
    container.innerHTML = '<div class="loading">Бүтээгдэхүүн олдсонгүй</div>';
    return;
  }

  products.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    const displayPrice = typeof product.price === 'string' ? product.price : `₮${product.price.toLocaleString()}`;

    // Анхны ачаалтад animation нэмэх
    if (isInitialLoad) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
    }

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 15px;">
    <div class="product-name">${product.name}</div>
    <div class="product-price">${displayPrice}</div>
  `;

    // Бүтээгдэхүүн дээр дарахад popup нээх
    card.addEventListener("click", () => showProductPopup(product));

    container.appendChild(card);
  });

  // Animation style нэмэх
  if (isInitialLoad && !document.getElementById('product-animation-style')) {
    const style = document.createElement('style');
    style.id = 'product-animation-style';
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
    `;
    document.head.appendChild(style);
  }
}

// Хайлт хийх функц
async function initProducts() {
  try {
    const newProducts = await fetchProducts("newProducts");
    const recommendedProducts = await fetchProducts("recommendedProducts");
    const accessories = await fetchProducts("accessories");

    ALL_PRODUCTS = [
      ...newProducts,
      ...recommendedProducts,
      ...accessories
    ];

    // default view
    displayProducts(newProducts, "new-products", true);
    displayProducts(recommendedProducts, "featured-products", true);
    displayProducts(accessories, "accessories", true);

  } catch (err) {
    console.error("Init error:", err);
  }
}

initProducts();


// Хайлтын товч дарахад
document.querySelector(".icon1").addEventListener("click", () => {
  const searchTerm = document.querySelector(".input").value;

  if (searchTerm.trim() !== "") {
    searchProducts(searchTerm);
  } else {
    loadAllProducts();
  }
});

// Enter товч дарахад хайх
document.querySelector(".input-wrapper").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const searchTerm = e.target.value;
    if (searchTerm.trim() !== "") {
      searchProducts(searchTerm);
    } else {
      loadAllProducts();
    }
  }
});

// Бүх бүтээгдэхүүнийг ачаалах
async function loadAllProducts() {
  try {
    const newProducts = await fetchProducts("newProducts");
    displayProducts(newProducts, "new-products", true);

    const recommendedProducts = await fetchProducts("recommendedProducts");
    displayProducts(recommendedProducts, "featured-products", true);

    const accessories = await fetchProducts("accessories");
    displayProducts(accessories, "accessories", true);
  } catch (error) {
    console.error("Алдаа гарлаа:", error);
    document.querySelectorAll(".product-grid").forEach((grid) => {
      grid.innerHTML = '<div class="error">Өгөгдөл ачаалахад алдаа гарлаа</div>';
    });
  }
}

// Бүтээгдэхүүн дээр дарахад popup харуулах
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
  const displayPrice = typeof product.price === 'string' ? product.price : `₮${product.price.toLocaleString()}`;

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
      
      <img style="font-size: 120px; text-align: center; margin-bottom: 30px;">${product.image}</img>
      
      <h2 style="
        font-size: 32px;
        font-weight: 700;
        color: #1d1d1f;
        margin-bottom: 15px;
      ">${product.name}</h2>
      
      <p style="
        font-size: 28px;
        color: #06c;
        font-weight: 700;
        margin-bottom: 30px;
      ">${displayPrice}</p>
      
      <p style="
        font-size: 16px;
        color: #86868b;
        line-height: 1.6;
        margin-bottom: 30px;
      ">Энэхүү бүтээгдэхүүн нь хамгийн сүүлийн үеийн технологи, өндөр чанартай материалаар хийгдсэн бөгөөд таны өдөр тутмын амьдралд хялбар байдал авчирна.</p>
      
      <button onclick="addToCart({id: ${product.id}, name: '${product.name}', price: ${numericPrice}, image: '${product.image}'}); this.closest('[style*=fixed]').remove();" style="
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
}

// Хуудас ачаалагдахад бүтээгдэхүүнүүдийг харуулах
window.addEventListener("load", loadAllProducts);
