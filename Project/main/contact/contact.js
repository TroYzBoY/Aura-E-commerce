// ===== CART POPUP (ecomm2.js-тэй яг адилхан) =====
let cart = [];

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("cartItems");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      cart = (parsed || []).map((it) => ({
        ...it,
        id: Number(it.id),
        quantity: Number(it.quantity) || 0,
        price: Number(it.price) || it.price,
      }));
    } catch (e) {
      cart = [];
    }
  }
  updateCartBadge();

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
});

function updateCartBadge() {
  const cartIcon = document.getElementById("cart-icon");
  if (!cartIcon) {
    localStorage.setItem("cartItems", JSON.stringify(cart));
    return;
  }
  let badge = cartIcon.querySelector(".cart-badge");
  localStorage.setItem("cartItems", JSON.stringify(cart));

  const totalCount =
    cart.reduce((s, i) => s + (Number(i.quantity) || 0), 0) || cart.length;

  if (totalCount > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      cartIcon.appendChild(badge);
    }
    badge.textContent = totalCount;
  } else {
    if (badge) badge.remove();
  }
}

function updateQuantity(productId, change) {
  const idNum = Number(productId);
  const item = cart.find((it) => Number(it.id) === idNum);
  if (!item) return;
  item.quantity = (Number(item.quantity) || 0) + change;
  if (item.quantity <= 0) {
    removeFromCart(idNum);
  } else {
    localStorage.setItem("cartItems", JSON.stringify(cart));
    updateCartBadge();
    updateCartContent();
  }
}

function removeFromCart(productId) {
  const idNum = Number(productId);
  cart = cart.filter((item) => Number(item.id) !== idNum);
  localStorage.setItem("cartItems", JSON.stringify(cart));
  updateCartBadge();
  updateCartContent();
}

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
              <div style="color: rgba(255, 0, 0, 1); font-weight: 700;">₮${item.price.toLocaleString()}</div>
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
              <span style="color: rgba(255, 0, 0, 1);">₮${totalPrice.toLocaleString()}</span>
            </div>
            <button onclick="goToCheckout()" style="
              width: 100%;
              padding: 16px;
              background: linear-gradient(135deg, #000000ff 0%, #bebebeff 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 18px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(255, 0, 0, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
              💳 Худалдан авах
            </button>
          </div>
        `
          : ""
      }
    `;
  }
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
              <div style="color: rgba(255, 0, 0, 1); font-weight: 700;">₮${item.price.toLocaleString()}</div>
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
              <span style="color: rgba(255, 0, 0, 1);">₮${totalPrice.toLocaleString()}</span>
            </div>
            <button onclick="goToCheckout()" style="
              width: 100%;
              padding: 16px;
              background: linear-gradient(135deg, #000000ff 50%, #bebebeff 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 18px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(234, 102, 102, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
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

function goToCheckout() {
  // Нэвтэрсэн эсэхийг шалгах
  if (typeof requireLogin === "function" && !requireLogin()) {
    return;
  }

  if (cart.length === 0) {
    alert("⚠️ Таны сагс хоосон байна!\n\nЭхлээд бүтээгдэхүүн сонгоно уу.");
    return;
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));

  // showNotification функц байвал ашиглах
  if (typeof showNotification === "function") {
    showNotification("💳 Төлбөрийн хуудас руу шилжиж байна...");
  }

  setTimeout(() => {
    window.location.href = "../tulbur/tulbur.html";
  }, 500);
}

// Notification function (if doesn't exist)
function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #000000ff 0%, #bebebeff 100%);
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
