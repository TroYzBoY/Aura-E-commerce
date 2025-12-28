// ================== ЗУРГИЙН ФАЙЛЫН НЭРС ==================
const imageFiles = {
  "airpod max": "airpod max.png",
  airpod: "airpod.png",
  airtag: "airtag.png",
  "apple pencil": "apple pencil.png",
  homepod: "homepod.png",
  "ipad air": "ipad air.png",
  ipad: "ipad.png",
  iphone: "iphone.png",
  iphone16promax: "iphone16promax.png",
  "iwatch se": "iwatch se.png",
  iwatch: "iwatch.png",
  "Magic Keyboard": "magick.png",
  logo: "Logo.png",
};

// ================== CART DATA (JSON) ==================
const cartData = {
  items: [],
  shipping: 50000,
  discount: 0,
  loading: true,
  error: null,
};

// ================== ЗУРГИЙН ЗАМ ЗАСАХ ==================
function fixImagePath(imagePath) {
  if (!imagePath) return "";

  // Хэрэв зураг ./IMG/-ээр эхэлвэл ../IMG/ болгох (төлбөрийн хуудсанд)
  if (imagePath.startsWith("./IMG/")) {
    return imagePath.replace("./IMG/", "../IMG/");
  }

  // Бусад тохиолдолд өөрчлөлтгүй буцаах
  return imagePath;
}

// ================== ЛОКАЛ СТОРЭЙЖЭЭС САГС АЧААЛАХ ==================
function loadCartFromLocalStorage() {
  try {
    cartData.loading = true;
    cartData.error = null;

    // localStorage-с сагсны өгөгдөл авах
    const savedCart = localStorage.getItem("cartItems");

    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);

      // Өгөгдөл зөв форматтай эсэхийг шалгах
      if (Array.isArray(parsedCart) && parsedCart.length > 0) {
        // Үнийг тоо болгон хувиргах (хэрэв string бол) + зургийн замыг засах
        cartData.items = parsedCart.map((item) => ({
          ...item,
          price:
            typeof item.price === "string"
              ? parseInt(item.price.replace(/[₮,]/g, ""))
              : item.price,
          quantity: item.quantity || 1,
          image: fixImagePath(item.image), // 🔥 Зургийн замыг засах
        }));

        console.log(
          "✅ localStorage-с сагс амжилттай ачаалагдлаа:",
          cartData.items
        );
      } else {
        console.warn("⚠️ Сагс хоосон байна");
        cartData.items = [];
      }
    } else {
      console.warn("⚠️ localStorage-д сагсны өгөгдөл олдсонгүй");
      cartData.items = [];
    }

    cartData.loading = false;
    loadCart();
  } catch (error) {
    console.error("❌ localStorage уншихад алдаа:", error);
    cartData.error = error.message;
    cartData.loading = false;

    showLoadingError();
    cartData.items = [];
    loadCart();
  }
}

// ================== АЛДААНЫ МЭДЭГДЭЛ ==================
function showLoadingError() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #86868b;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff9500; margin-bottom: 16px;"></i>
            <h3 style="margin-bottom: 8px;">Сагсны өгөгдөл ачаалж чадсангүй</h3>
            <p>Нүүр хуудас руу буцаж сагсандаа бараа нэмнэ үү.</p>
            <a href="../all Products/index.html" style="
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
            ">← Нүүр хуудас руу буцах</a>
        </div>
    `;
}

// ================== САГС АЧААЛАХ ==================
function loadCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  if (cartData.loading) {
    container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #86868b;">
                <div class="spinner"></div>
                <p>Ачаалж байна...</p>
            </div>
        `;
    return;
  }

  if (cartData.items.length === 0) {
    container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #86868b;">
                <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p style="margin-bottom: 20px;">Таны сагс хоосон байна</p>
                <a href="../all Products/index.html" style="
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                ">← Нүүр хуудас руу буцах</a>
            </div>
        `;
    return;
  }

  container.innerHTML = "";

  cartData.items.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";

    const imageContent = item.image
      ? `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-box\\'></i>'">`
      : '<i class="fas fa-box"></i>';

    itemEl.innerHTML = `
            <div class="item-image">${imageContent}</div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-variant">${item.variant || "Стандарт"}</div>
                <div class="item-quantity">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">−</button>
                    <span class="qty-number" id="qty${index}">${
      item.quantity
    }</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                </div>
            </div>
            <div class="item-price">₮${item.price.toLocaleString()}</div>
            <button class="remove-btn" onclick="removeItem(${index})" title="Устгах">
                <i class="fas fa-trash"></i>
            </button>
        `;
    container.appendChild(itemEl);
  });

  updateCartSummary();
}

// ================== ТОО ШИРХЭГ ШИНЭЧЛЭХ ==================
function updateQty(index, change) {
  if (index < 0 || index >= cartData.items.length) return;

  cartData.items[index].quantity = Math.max(
    1,
    cartData.items[index].quantity + change
  );

  const qtyElement = document.getElementById("qty" + index);
  if (qtyElement) {
    qtyElement.textContent = cartData.items[index].quantity;
  }

  // localStorage шинэчлэх
  localStorage.setItem("cartItems", JSON.stringify(cartData.items));

  updateCartSummary();
}

// ================== БҮТЭЭГДЭХҮҮН УСТГАХ ==================
function removeItem(index) {
  if (index < 0 || index >= cartData.items.length) return;

  if (confirm("Энэ бүтээгдэхүүнийг сагснаас устгах уу?")) {
    cartData.items.splice(index, 1);

    // localStorage шинэчлэх
    localStorage.setItem("cartItems", JSON.stringify(cartData.items));

    loadCart();
  }
}

// ================== НИЙТ ДҮН ШИНЭЧЛЭХ ==================
function updateCartSummary() {
  const subtotal = cartData.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + cartData.shipping - cartData.discount;

  const updates = {
    cartCount: cartData.items.length,
    subtotal: "₮" + subtotal.toLocaleString(),
    totalAmount: "₮" + total.toLocaleString(),
    payButtonAmount: "₮" + total.toLocaleString(),
    paypalAmount: "₮" + total.toLocaleString(),
  };

  Object.entries(updates).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

// ================== ПРОМО КОД ==================
function applyPromo() {
  const input = document.getElementById("promoInput");
  if (!input) return;

  const code = input.value.trim().toUpperCase();

  if (code === "") {
    alert("⚠️ Промо код оруулна уу");
    return;
  }

  if (code === "SAVE10") {
    const subtotal = cartData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cartData.discount = Math.floor(subtotal * 0.1);

    const discountEl = document.getElementById("discount");
    if (discountEl) {
      discountEl.textContent = "-₮" + cartData.discount.toLocaleString();
    }

    updateCartSummary();
    alert("✅ Промо код амжилттай! 10% хөнгөлөлт авлаа.");
    input.value = "";
  } else {
    alert("❌ Промо код буруу байна");
  }
}

// ================== ТӨЛБӨРИЙН АРГА СОЛИХ ==================
function switchPaymentMethod(method, event) {
  const tabs = document.querySelectorAll(".method-tab");
  const contents = document.querySelectorAll(".payment-content");

  tabs.forEach((tab) => tab.classList.remove("active"));
  contents.forEach((content) => content.classList.remove("active"));

  if (event && event.target) {
    event.target.classList.add("active");
  }

  const methodContent = document.getElementById(method + "Payment");
  if (methodContent) {
    methodContent.classList.add("active");
  }
}

// ================== КАРТЫН ДУГААР ФОРМАТЛАХ ==================
function formatCardNumber(input) {
  if (!input) return;

  let value = input.value.replace(/\s/g, "").replace(/\D/g, "");
  const parts = value.match(/.{1,4}/g);
  input.value = parts ? parts.join(" ").substring(0, 19) : value;
}

// ================== ДУУСАХ ХУГАЦАА ФОРМАТЛАХ ==================
function formatExpiry(input) {
  if (!input) return;

  let value = input.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4);
  }
  input.value = value;
}

// ================== CVV ФОРМАТЛАХ ==================
function formatCVV(input) {
  if (!input) return;

  input.value = input.value.replace(/\D/g, "").substring(0, 3);
}

// ================== ТӨЛБӨР БОЛОВСРУУЛАХ ==================
function processPayment(event) {
  if (event) event.preventDefault();

  // Нэвтэрсэн эсэхийг шалгах
  if (typeof requireLogin === "function" && !requireLogin()) {
    return;
  }

  const button = document.getElementById("payButton");
  if (!button) return;

  button.disabled = true;
  button.innerHTML = '<span class="spinner"></span> Боловсруулж байна...';

  setTimeout(() => {
    button.disabled = false;
    const amount = document.getElementById("payButtonAmount");
    button.innerHTML = (amount ? amount.textContent : "₮0") + " төлөх";

    if (Math.random() > 0.3) {
      // Амжилттай бол localStorage-г цэвэрлэх
      localStorage.removeItem("cartItems");
      showModal("successModal");
    } else {
      showModal("errorModal");
    }
  }, 2000);
}

// ================== PAYPAL ТӨЛБӨР ==================
function processPayPal() {
  if (typeof requireLogin === "function" && !requireLogin()) {
    return;
  }

  const button = event.target;
  const originalText = button.innerHTML;

  button.disabled = true;
  button.innerHTML = '<span class="spinner"></span> Боловсруулж байна...';

  setTimeout(() => {
    button.disabled = false;
    button.innerHTML = originalText;

    // Амжилттай бол localStorage-г цэвэрлэх
    localStorage.removeItem("cartItems");
    showModal("successModal");
  }, 1500);
}

// ================== QPAY ТӨЛБӨР ==================
function processQPay() {
  if (typeof requireLogin === "function" && !requireLogin()) {
    return;
  }

  const button = event.target;
  const originalText = button.innerHTML;

  button.disabled = true;
  button.innerHTML = '<span class="spinner"></span> Боловсруулж байна...';

  setTimeout(() => {
    button.disabled = false;
    button.innerHTML = originalText;

    // Амжилттай бол localStorage-г цэвэрлэх
    localStorage.removeItem("cartItems");
    showModal("successModal");
  }, 1500);
}

// ================== МОДАЛ ХАРУУЛАХ ==================
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");

    // Амжилттай модал бол 3 секундын дараа нүүр хуудас руу шилжүүлэх
    if (modalId === "successModal") {
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 3000);
    }
  }
}

// ================== МОДАЛ ХААХ ==================
function closeModal() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => modal.classList.remove("active"));
}

// ================== ЭХЛҮҮЛЭХ ==================
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    // localStorage-с сагс ачаалах (JSON биш)
    loadCartFromLocalStorage();

    // Checkout хуудас дээр нэвтэрсэн эсэхийг шалгах
    setTimeout(() => {
      if (typeof requireLogin === "function" && !requireLogin()) {
        // Хэрэв нэвтэрээгүй бол popup нээгдэх
      }
    }, 500);
  });

  // Global функцууд
  window.updateQty = updateQty;
  window.removeItem = removeItem;
  window.applyPromo = applyPromo;
  window.switchPaymentMethod = switchPaymentMethod;
  window.formatCardNumber = formatCardNumber;
  window.formatExpiry = formatExpiry;
  window.formatCVV = formatCVV;
  window.processPayment = processPayment;
  window.processPayPal = processPayPal;
  window.processQPay = processQPay;
  window.closeModal = closeModal;
}
