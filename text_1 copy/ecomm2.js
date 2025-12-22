        // Сагсны state
        let cart = [];

        // Сагсыг шинэчлэх функц
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
            } else {
                if (badge) {
                    badge.remove();
                }
            }
        }

        // Сагсанд нэмэх функц
        function addToCart(product) {
            const existingItem = cart.find(item => item.id === product.id);
            
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
            cart = cart.filter(item => item.id !== productId);
            updateCartBadge();
            showCartPopup();
        }

        // Тоо ширхэг өөрчлөх
        function updateQuantity(productId, change) {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    updateCartBadge();
                    showCartPopup();
                }
            }
        }

        // Мэдэгдэл харуулах
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
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
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

        // Сагсны popup харуулах
        function showCartPopup() {
            const existingPopup = document.querySelector('.cart-popup');
            if (existingPopup) existingPopup.remove();
            
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const popup = document.createElement('div');
            popup.className = 'cart-popup';
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
            
            let cartHTML = '';
            if (cart.length === 0) {
                cartHTML = '<p style="text-align: center; color: #86868b; padding: 40px;">Таны сагс хоосон байна</p>';
            } else {
                cartHTML = cart.map(item => `
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        padding: 15px;
                        background: #f5f5f7;
                        border-radius: 12px;
                        margin-bottom: 15px;
                    ">
                        <img src="${item.image}" alt="${item.name}" style="
                            width: 80px;
                            height: 80px;
                            object-fit: cover;
                            border-radius: 8px;
                        " onerror="this.src='https://via.placeholder.com/80x80?text=${item.name}'">
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
                `).join('');
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
                    ` : ''}
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
            
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.remove();
                }
            });
            
            document.body.appendChild(popup);
        }

        // Сагсны icon дээр дарахад сагс харуулах
        document.getElementById('cart-icon').addEventListener('click', showCartPopup);

        // Жишээ API өгөгдөл
        const mockAPIData = {
            newProducts: [
                { id: 1, name: 'MacBook Pro M4', price: 8999000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1664497359481' },
                { id: 2, name: 'iPhone 15 Pro Max', price: 5500000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692895702708' },
                { id: 3, name: 'Apple Watch Ultra 2', price: 3999000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQDY3ref_VW_34FR+watch-49-titanium-ultra2_VW_34FR+watch-face-49-ocean-ultra2_VW_34FR?wid=5120&hei=3280&fmt=p-jpg&qlt=95&.v=1694507270909' },
                { id: 4, name: 'AirPods Pro Gen 3', price: 2999000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361' },
                { id: 5, name: 'iPad Pro M2', price: 4999000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-finish-unselect-gallery-1-202212?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1670038840063' }
            ],
            featuredProducts: [
                { id: 6, name: 'MacBook Air M2', price: 5999000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034' },
                { id: 7, name: 'iPhone 14 Pro', price: 4500000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1663703841896' },
                { id: 8, name: 'Apple Watch SE', price: 1999000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MLJA3ref_VW_34FR+watch-40-alum-starlight-nc-se_VW_34FR+watch-face-40-aluminum-starlight-se_VW_34FR?wid=5120&hei=3280&fmt=p-jpg&qlt=95&.v=1694507270832' },
                { id: 9, name: 'AirPods Max', price: 3499000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-silver-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604021221000' },
                { id: 10, name: 'iPad Air', price: 3299000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-finish-unselect-gallery-1-202211_GEO_US?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1670631073967' }
            ],
            accessories: [
                { id: 11, name: 'Magic Keyboard', price: 599000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MMMR3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1645719947833' },
                { id: 12, name: 'MagSafe Charger', price: 199000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHXH3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1603831040000' },
                { id: 13, name: 'Apple Pencil Pro', price: 699000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MU8F2?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1551906522843' },
                { id: 14, name: 'HomePod Mini', price: 499000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/homepod-mini-select-blue-202110?wid=940&hei=1112&fmt=png-alpha&.v=1633086025000' },
                { id: 15, name: 'AirTag 4 Pack', price: 399000, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airtag-4pack-select-202104?wid=940&hei=1112&fmt=png-alpha&.v=1617761670000' }
            ]
        };

        // API-аас өгөгдөл татах функц
        async function fetchProducts(category) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockAPIData[category]);
                }, 1000);
            });
        }

        // Бүтээгдэхүүнүүдийг харуулах функц
        function displayProducts(products, containerId) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x300?text=${product.name}'">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">₮${product.price.toLocaleString()}</div>
                `;
                
                // Бүтээгдэхүүн дээр дарахад popup нээх
                card.addEventListener('click', () => showProductPopup(product));
                
                container.appendChild(card);
            });
        }

        // Хайлт хийх функц
        function searchProducts(searchTerm) {
            const allProducts = [...mockAPIData.newProducts, ...mockAPIData.featuredProducts, ...mockAPIData.accessories];
            const filtered = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (filtered.length > 0) {
                displayProducts(filtered, 'new-products');
                document.getElementById('featured-products').innerHTML = '';
                document.getElementById('accessories').innerHTML = '';
            }
        }

        // Хайлтын товч дарахад
        document.querySelector('.search-btn').addEventListener('click', () => {
            const searchTerm = document.querySelector('.search-input').value;
            if (searchTerm.trim() !== '') {
                searchProducts(searchTerm);
            } else {
                loadAllProducts();
            }
        });

        // Enter товч дарахад хайх
        document.querySelector('.search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value;
                if (searchTerm.trim() !== '') {
                    searchProducts(searchTerm);
                } else {
                    loadAllProducts();
                }
            }
        });

        // Бүх бүтээгдэхүүнийг ачаалах
        async function loadAllProducts() {
            try {
                const newProducts = await fetchProducts('newProducts');
                displayProducts(newProducts, 'new-products');

                const featuredProducts = await fetchProducts('featuredProducts');
                displayProducts(featuredProducts, 'featured-products');

                const accessories = await fetchProducts('accessories');
                displayProducts(accessories, 'accessories');
            } catch (error) {
                console.error('Алдаа гарлаа:', error);
                document.querySelectorAll('.product-grid').forEach(grid => {
                    grid.innerHTML = '<div class="error">Өгөгдөл ачаалахад алдаа гарлаа</div>';
                });
            }
        }

        // Бүтээгдэхүүн дээр дарахад popup харуулах
        function showProductPopup(product) {
            const popup = document.createElement('div');
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
                        width: 100%;
                        height: 300px;
                        object-fit: contain;
                        margin-bottom: 30px;
                        border-radius: 12px;
                    " onerror="this.src='https://via.placeholder.com/300x300?text=${product.name}'">
                    
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
                    ">₮${product.price.toLocaleString()}</p>
                    
                    <p style="
                        font-size: 16px;
                        color: #86868b;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    ">Энэхүү бүтээгдэхүүн нь хамгийн сүүлийн үеийн технологи, өндөр чанартай материалаар хийгдсэн бөгөөд таны өдөр тутмын амьдралд хялбар байдал авчирна.</p>
                    
                    <button onclick="addToCart({id: ${product.id}, name: '${product.name}', price: ${product.price}, image: '${product.image}'}); this.closest('[style*=fixed]').remove();" style="
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
            
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.remove();
                }
            });
            
            document.body.appendChild(popup);
        }

        // Хуудас ачаалагдахад бүтээгдэхүүнүүдийг харуулах
        window.addEventListener('load', loadAllProducts);