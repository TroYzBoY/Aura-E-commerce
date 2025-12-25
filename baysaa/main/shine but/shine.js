let products = {
  newProducts: [],
  recommendedProducts: [],
  accessories: []
};

let cart = [];
let currentFilter = 'all';
let currentCategory = 'all';

// Fetch products from JSON file
async function loadProducts() {
  try {
    const response = await fetch('shine.json');
    if (!response.ok) {
      throw new Error('Өгөгдөл ачаалахад алдаа гарлаа');
    }
    products = await response.json();
    displayProducts(products.newProducts, 'new-products');
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

// Initialize
loadProducts();