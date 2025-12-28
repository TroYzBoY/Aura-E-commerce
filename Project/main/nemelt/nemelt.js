let products = {
  newProducts: [],
  recommendedProducts: [],
  accessories: []
};

let allProducts = []; // For search functionality
let cart = [];
let currentFilter = 'all';
let currentCategory = 'all';

// Fetch products from JSON file
async function loadProducts() {
  try {
    const response = await fetch('../product.json');
    if (!response.ok) {
      throw new Error('Өгөгдөл ачаалахад алдаа гарлаа');
    }
    products = await response.json();
    
    // Combine all products for search
    allProducts = [
      ...(products.newProducts || []),
      ...(products.recommendedProducts || []),
      ...(products.accessories || [])
    ];
    
    displayProducts(products.accessories, 'new-products');
  } catch (error) {
    console.error('Fetch алдаа:', error);
    document.getElementById('new-products').innerHTML = '<div class="loading">Өгөгдөл ачаалахад алдаа гарлаа</div>';
  }
}

function displayProducts(productsArray, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = productsArray.slice(0, 5).map(product => `
        <div class="product-card">
          ${product.new ? `<div class="product-new">${product.new}</div>` : ''}
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${product.price}</div>
        </div>
      `).join('');
}

function openDetailedPage(category) {
  currentCategory = category;
  const page = document.getElementById('detailed-page');
  const title = document.getElementById('detailed-title');
  const subtitle = document.getElementById('detailed-subtitle');

  title.textContent = 'Бүх бүтээгдэхүүн';
  subtitle.textContent = 'Таны хайж байгаа бүгдийг нэг дор';

  page.classList.add('active');
  filterProducts('all');
}

function closeDetailedPage() {
  document.getElementById('detailed-page').classList.remove('active');
}

function filterProducts(category) {
  currentFilter = category;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  const allProducts = [...products.newProducts, ...products.recommendedProducts, ...products.accessories];

  const filtered = category === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === category);

  displayDetailedProducts(filtered);
}

function displayDetailedProducts(productsArray) {
  const container = document.getElementById('detailed-grid');
  container.innerHTML = productsArray.map((product, index) => `
        <div class="detailed-card" style="animation: fadeInUp 0.6s ease forwards ${index * 0.05}s; opacity: 0;">
          ${product.new ? `<div class="product-new">${product.new}</div>` : ''}
          <img src="${product.image}" alt="${product.name}" class="detailed-card-image">
          <div class="detailed-card-info">
            <div class="detailed-card-name">${product.name}</div>
            <div class="detailed-card-price">${product.price}</div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.name}', '${product.price}')">
              <i class="fa-solid fa-cart-plus"></i> Сагсанд нэмэх
            </button>
          </div>
        </div>
      `).join('');
}

function addToCart(id, name, price) {
  // Нэвтэрсэн эсэхийг шалгах
  if (typeof requireLogin === 'function' && !requireLogin()) {
    return; // Хэрэв нэвтэрээгүй бол popup нээгдэж, функц дуусна
  }

  cart.push({ id, name, price });
  updateCartBadge();
  showNotification(`${name} сагсанд нэмэгдлээ!`);
}

function updateCartBadge() {
  const cartIcon = document.getElementById('cart-icon');
  let badge = cartIcon.querySelector('.cart-badge');

  if (cart.length > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      cartIcon.appendChild(badge);
    }
    badge.textContent = cart.length;
  } else if (badge) {
    badge.remove();
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
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
    notification.style.animation = 'slideOutRight 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
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
      openDetailedPage('all');
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
    // Бүх бүтээгдэхүнийг харуулах
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
      openDetailedPage('all');
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
        openDetailedPage('all');
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
loadProducts();