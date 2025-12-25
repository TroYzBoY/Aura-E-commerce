// ================== ЗУРГИЙН ФАЙЛЫН НЭРС ==================
const imageFiles = {
    'airpod max': 'airpod max.png',
    'airpod': 'airpod.png',
    'airtag': 'airtag.png',
    'apple pencil': 'apple pencil.png',
    'homepod': 'homepod.png',
    'ipad air': 'ipad air.png',
    'ipad': 'ipad.png',
    'iphone': 'iphone.png',
    'iphone16promax': 'iphone16promax.png',
    'iwatch se': 'iwatch se.png',
    'iwatch': 'iwatch.png',
    'Magic Keyboard': 'magick.png',
    'logo': 'Logo.png'
};

// ================== CART DATA (JSON) ==================
const cartData = {
    items: [],
    shipping: 50000,
    discount: 0,
    loading: true,
    error: null
};

// ================== БҮТЭЭГДЭХҮҮНИЙ ӨГӨГДӨЛ ==================
const productDatabase = {
    "newProducts": [
        {
            "id": 1,
            "name": "Macbook Pro M4",
            "price": 8999000,
            "image": "image/mac.png",
            "category": "laptop",
            "variant": "16GB RAM, 512GB SSD"
        },
        {
            "id": 2,
            "name": "iPhone 17 Pro Max",
            "price": 5500000,
            "image": "image/iphone.png",
            "category": "phone",
            "variant": "256GB, Titanium"
        },
        {
            "id": 3,
            "name": "Apple Watch",
            "price": 3999000,
            "image": "image/iwatch.png",
            "category": "watch",
            "variant": "45mm, GPS + Cellular"
        },
        {
            "id": 4,
            "name": "AirPods Pro Gen3",
            "price": 2999000,
            "image": "image/airpod.png",
            "category": "audio",
            "variant": "USB-C"
        },
        {
            "id": 5,
            "name": "iPad Pro",
            "price": 4999000,
            "image": "image/ipad.png",
            "category": "tablet",
            "variant": "12.9 inch, M2"
        }
    ],
    "recommendedProducts": [
        {
            "id": 6,
            "name": "Macbook Air M3",
            "price": 5999000,
            "image": "image/mac air.png",
            "category": "laptop",
            "variant": "8GB RAM, 256GB SSD"
        },
        {
            "id": 7,
            "name": "iPhone 16 Pro Max",
            "price": 4500000,
            "image": "image/iphone16promax.png",
            "category": "phone",
            "variant": "128GB, Black"
        },
        {
            "id": 8,
            "name": "Apple Watch SE",
            "price": 1999000,
            "image": "image/iwatch se.png",
            "category": "watch",
            "variant": "40mm, GPS"
        },
        {
            "id": 9,
            "name": "AirPods Max",
            "price": 3499000,
            "image": "image/airpod max.png",
            "category": "audio",
            "variant": "Silver"
        },
        {
            "id": 10,
            "name": "iPad Air",
            "price": 3299000,
            "image": "image/ipad air.png",
            "category": "tablet",
            "variant": "10.9 inch, M1"
        }
    ],
    "accessories": [
        {
            "id": 11,
            "name": "Magic Keyboard",
            "price": 599000,
            "image": "image/magick.png",
            "category": "accessory",
            "variant": "Монгол хэл"
        },
        {
            "id": 12,
            "name": "MagSafe Charger",
            "price": 199000,
            "image": "image/magsafe.png",
            "category": "accessory",
            "variant": "White"
        },
        {
            "id": 13,
            "name": "Apple Pencil Pro",
            "price": 699000,
            "image": "image/apple pencil.png",
            "category": "accessory",
            "variant": "2nd Gen"
        },
        {
            "id": 14,
            "name": "HomePod Mini",
            "price": 499000,
            "image": "image/homepod.png",
            "category": "accessory",
            "variant": "Blue"
        },
        {
            "id": 15,
            "name": "AirTag 4 Pack",
            "price": 399000,
            "image": "image/airtag.png",
            "category": "accessory",
            "variant": "4 ширхэг"
        }
    ]
};

// ================== JSON ӨГӨГДӨЛ АЧААЛАХ ==================
async function loadDataFromJSON() {
    try {
        cartData.loading = true;
        cartData.error = null;

        const response = await fetch('./data/products.json');

        if (!response.ok) {
            throw new Error('JSON файл олдсонгүй');
        }

        const jsonData = await response.json();

        // Сагсанд анхны бүтээгдэхүүнүүдийг нэмэх
        cartData.items = [
            { ...jsonData.newProducts[0], quantity: 1 },
            { ...jsonData.newProducts[1], quantity: 1 }
        ];

        cartData.loading = false;
        loadCart();

    } catch (error) {
        console.error('JSON уншихад алдаа гарлаа:', error);
        cartData.error = error.message;
        cartData.loading = false;

        showLoadingError();
        useLocalData();
    }
}

// ================== ЛОКАЛ ӨГӨГДӨЛ АШИГЛАХ ==================
function useLocalData() {
    cartData.items = [
        { ...productDatabase.newProducts[0], quantity: 1 },
        { ...productDatabase.newProducts[1], quantity: 1 },
        { ...productDatabase.accessories[0], quantity: 2 }
    ];

    setTimeout(() => {
        cartData.loading = false;
        loadCart();
    }, 1000);
}

// ================== АЛДААНЫ МЭДЭГДЭЛ ==================
function showLoadingError() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #86868b;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff9500; margin-bottom: 16px;"></i>
            <h3 style="margin-bottom: 8px;">Өгөгдөл ачаалж чадсангүй</h3>
            <p>JSON файл олдсонгүй. Локал өгөгдлийг ашиглаж байна...</p>
        </div>
    `;
}

// ================== САГС АЧААЛАХ ==================
function loadCart() {
    const container = document.getElementById('cartItems');
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
                <p>Таны сагс хоосон байна</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    cartData.items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';

        const imageContent = item.image
            ? `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-box\\'></i>'">`
            : '<i class="fas fa-box"></i>';

        itemEl.innerHTML = `
            <div class="item-image">${imageContent}</div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-variant">${item.variant || 'Стандарт'}</div>
                <div class="item-quantity">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">−</button>
                    <span class="qty-number" id="qty${index}">${item.quantity}</span>
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

    cartData.items[index].quantity = Math.max(1, cartData.items[index].quantity + change);

    const qtyElement = document.getElementById('qty' + index);
    if (qtyElement) {
        qtyElement.textContent = cartData.items[index].quantity;
    }

    updateCartSummary();
}

// ================== БҮТЭЭГДЭХҮҮН УСТГАХ ==================
function removeItem(index) {
    if (index < 0 || index >= cartData.items.length) return;

    if (confirm('Энэ бүтээгдэхүүнийг сагснаас устгах уу?')) {
        cartData.items.splice(index, 1);
        loadCart();
    }
}

// ================== НИЙТ ДҮН ШИНЭЧЛЭХ ==================
function updateCartSummary() {
    const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + cartData.shipping - cartData.discount;

    const updates = {
        'cartCount': cartData.items.length,
        'subtotal': '₮' + subtotal.toLocaleString(),
        'totalAmount': '₮' + total.toLocaleString(),
        'payButtonAmount': '₮' + total.toLocaleString(),
        'paypalAmount': '₮' + total.toLocaleString()
    };

    Object.entries(updates).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// ================== ПРОМО КОД ==================
function applyPromo() {
    const input = document.getElementById('promoInput');
    if (!input) return;

    const code = input.value.trim().toUpperCase();

    if (code === '') {
        alert('⚠️ Промо код оруулна уу');
        return;
    }

    if (code === 'SAVE10') {
        const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartData.discount = Math.floor(subtotal * 0.1);

        const discountEl = document.getElementById('discount');
        if (discountEl) {
            discountEl.textContent = '-₮' + cartData.discount.toLocaleString();
        }

        updateCartSummary();
        alert('✅ Промо код амжилттай! 10% хөнгөлөлт авлаа.');
        input.value = '';
    } else {
        alert('❌ Промо код буруу байна');
    }
}

// ================== ТӨЛБӨРИЙН АРГА СОЛИХ ==================
function switchPaymentMethod(method, event) {
    const tabs = document.querySelectorAll('.method-tab');
    const contents = document.querySelectorAll('.payment-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    if (event && event.target) {
        event.target.classList.add('active');
    }

    const methodContent = document.getElementById(method + 'Payment');
    if (methodContent) {
        methodContent.classList.add('active');
    }
}

// ================== КАРТЫН ДУГААР ФОРМАТЛАХ ==================
function formatCardNumber(input) {
    if (!input) return;

    let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
    const parts = value.match(/.{1,4}/g);
    input.value = parts ? parts.join(' ').substring(0, 19) : value;
}

// ================== ДУУСАХ ХУГАЦАА ФОРМАТЛАХ ==================
function formatExpiry(input) {
    if (!input) return;

    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

// ================== CVV ФОРМАТЛАХ ==================
function formatCVV(input) {
    if (!input) return;

    input.value = input.value.replace(/\D/g, '').substring(0, 3);
}

// ================== ТӨЛБӨР БОЛОВСРУУЛАХ ==================
function processPayment(event) {
    if (event) event.preventDefault();

    // Нэвтэрсэн эсэхийг шалгах
    if (typeof requireLogin === 'function' && !requireLogin()) {
        return; // Хэрэв нэвтэрээгүй бол popup нээгдэж, функц дуусна
    }

    const button = document.getElementById('payButton');
    if (!button) return;

    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Боловсруулж байна...';

    setTimeout(() => {
        button.disabled = false;
        const amount = document.getElementById('payButtonAmount');
        button.innerHTML = (amount ? amount.textContent : '₮0') + ' төлөх';

        // 70% магадлалтай амжилттай
        if (Math.random() > 0.3) {
            showModal('successModal');
        } else {
            showModal('errorModal');
        }
    }, 2000);
}

// ================== PAYPAL ТӨЛБӨР ==================
function processPayPal() {
    // Нэвтэрсэн эсэхийг шалгах
    if (typeof requireLogin === 'function' && !requireLogin()) {
        return; // Хэрэв нэвтэрээгүй бол popup нээгдэж, функц дуусна
    }

    const button = event.target;
    const originalText = button.innerHTML;

    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Боловсруулж байна...';

    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalText;
        showModal('successModal');
    }, 1500);
}

// ================== QPAY ТӨЛБӨР ==================
function processQPay() {
    // Нэвтэрсэн эсэхийг шалгах
    if (typeof requireLogin === 'function' && !requireLogin()) {
        return; // Хэрэв нэвтэрээгүй бол popup нээгдэж, функц дуусна
    }

    const button = event.target;
    const originalText = button.innerHTML;

    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Боловсруулж байна...';

    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalText;
        showModal('successModal');
    }, 1500);
}

// ================== МОДАЛ ХАРУУЛАХ ==================
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// ================== МОДАЛ ХААХ ==================
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('active'));
}

// ================== ЭХЛҮҮЛЭХ ==================
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        loadDataFromJSON();
        // Checkout хуудас дээр нэвтэрсэн эсэхийг шалгах
        setTimeout(() => {
            if (typeof requireLogin === 'function' && !requireLogin()) {
                // Хэрэв нэвтэрээгүй бол popup нээгдэх (requireLogin() функц popup-г нээнэ)
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
