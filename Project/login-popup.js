// Login Popup Functionality
let isLoggedIn = false;

/* =========================
   CONFIG
========================= */
const API_URL = "http://localhost:3000";

/* =========================
   INIT
========================= */
function initLoginPopup() {
  console.log("Login popup initialized");
  const popup = document.querySelector(".form-popup");
  if (!popup) return;

  initPopupClose(popup.querySelector(".close-btn"));
  initFormSwitching(popup);

  initLoginForm(document.getElementById("login-form"));
  initSignupForm(document.getElementById("signup-form"));
}

document.addEventListener("DOMContentLoaded", initLoginPopup);

/* =========================
   POPUP CONTROLS
========================= */
function initPopupClose(btn) {
  if (!btn) return;
  btn.addEventListener("click", closeLoginPopup);
}

function initFormSwitching(popup) {
  popup.querySelectorAll(".bottom-link a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      popup.classList.toggle("show-signup", link.id === "signup-link");
    });
  });
}

/* =========================
   LOGIN
========================= */
function initLoginForm(form) {
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { username, password } = getLoginValues(form);
    if (!username || !password) {
      showNotification("Мэдээллээ бүрэн оруулна уу!");
      return;
    }

    try {
      const users = await fetchUsers();
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        showNotification("Нэвтрэх нэр эсвэл нууц үг буруу байна!");
        return;
      }

      handleSuccessfulLogin(user);
      showNotification("Амжилттай нэвтэрлээ!");
    } catch (err) {
      console.error(err);
      showNotification("Сервертэй холбогдож чадсангүй!");
    }
  });
}

function getLoginValues(form) {
  return {
    username: form.querySelector('input[type="text"]')?.value.trim(),
    password: form.querySelector('input[type="password"]')?.value,
  };
}

/* =========================
   SIGNUP
========================= */
function initSignupForm(form) {
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Signup form initialized");

    if (!isPolicyAccepted()) return;

    const { username, email, password } = getSignupValues(form);
    if (!username || !password) {
      showNotification("Мэдээллээ бүрэн оруулна уу!");
      return;
    }

    try {
      const users = await fetchUsers();
      const exists = users.some((u) => u.username === username);

      if (exists) {
        showNotification("Энэ нэвтрэх нэр аль хэдийн бүртгэгдсэн байна!");
        return;
      }

      const newUser = await createUser({
        username,
        email,
        password,
      });

      handleSuccessfulLogin(newUser);
      showNotification("Бүртгэл амжилттай үүслээ!");
    } catch (err) {
      console.error(err);
      showNotification("Сервертэй холбогдож чадсангүй!");
    }
  });
}

function getSignupValues(form) {
  return {
    username: form.querySelector('input[type="text"]')?.value.trim(),
    email: form.querySelector('input[type="email"]')?.value.trim(),
    password: form.querySelector('input[type="password"]')?.value,
  };
}

function isPolicyAccepted() {
  const policy = document.getElementById("policy");
  if (!policy.checked) {
    alert("Terms & Conditions-ийг зөвшөөрнө үү!");
    return false;
  }
  return true;
}

/* =========================
   API (JSON SERVER)
========================= */
async function fetchUsers() {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Fetch users failed");
  return res.json();
}
  
async function createUser(user) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Create user failed");
  return res.json();
}

/* =========================
   AUTH STATE
========================= */
function handleSuccessfulLogin(user) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("currentUser", JSON.stringify(user));
  closeLoginPopup();
  updateLoginUI();
}

/* =========================
   UI HELPERS (stub)
========================= */
function closeLoginPopup() {
  document.querySelector(".form-popup")?.classList.remove("show");
}

function updateLoginUI() {
  console.log("UI updated");
}

function showNotification(msg) {
  alert(msg);
}

// Show login popup
function showLoginPopup() {
  document.body.classList.add("show-popup");
  const formPopup = document.querySelector(".form-popup");
  if (formPopup) {
    formPopup.classList.remove("show-signup");
  }
}

// Close login popup
function closeLoginPopup() {
  document.body.classList.remove("show-popup");
}

// Check if user is logged in
function checkLoginStatus() {
  const loggedIn = localStorage.getItem("isLoggedIn");
  if (loggedIn === "true") {
    isLoggedIn = true;
    updateLoginUI();
  }
}

// Check if user needs to login (returns true if login required)
function requireLogin() {
  checkLoginStatus();
  if (!isLoggedIn) {
    showLoginPopup();
    return false;
  }
  return true;
}

// Update UI based on login status
function updateLoginUI() {
  const userIcon =
    document.getElementById("user-icon") || document.querySelector(".fa-user");
  const cartIcon = document.getElementById("cart-icon");

  if (userIcon) {
    if (isLoggedIn) {
      userIcon.style.color = "#00bcd4";
      userIcon.title = "Профайл";
    } else {
      userIcon.style.color = "";
      userIcon.title = "Нэвтэрэх";
    }
  }

  // Update cart icon based on login status
  if (cartIcon) {
    if (isLoggedIn) {
      cartIcon.style.opacity = "1";
      cartIcon.style.cursor = "pointer";
      cartIcon.title = "Сагс";
    } else {
      cartIcon.style.opacity = "0.5";
      cartIcon.style.cursor = "not-allowed";
      cartIcon.title = "Нэвтэрнэ үү";
    }
  }
}

// Logout function
function logout() {
  isLoggedIn = false;
  localStorage.removeItem("isLoggedIn");
  updateLoginUI();
  showNotification("Гарах амжилттай!");
}

// Show profile popup
function showProfilePopup() {
  const existingPopup = document.querySelector(".profile-popup");
  if (existingPopup) existingPopup.remove();

  // Load user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userName = userData.name || "";
  const userAge = userData.age || "";
  const userGender = userData.gender || "";
  const userEmail = userData.email || "";
  const userPhone = userData.phone || "";
  const userAddress = userData.address || "";
  const profileImageData = userData.profileImage || "";

  const popup = document.createElement("div");
  popup.className = "profile-popup";
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
        overflow-y: auto;
        padding: 20px;
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
            max-height: 90vh;
            overflow-y: auto;
        ">
            <button onclick="this.closest('.profile-popup').remove()" style="
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
                z-index: 1;
            " onmouseover="this.style.background='#e5e5e7'" onmouseout="this.style.background='#f5f5f7'">×</button>
            
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            ">
                <div id="profile-image-container" style="
                    width: 150px;
                    height: 150px;
                    min-width: 150px;
                    min-height: 150px;
                    border-radius: 50%;
                    background: #f5f5f7;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    border: 3px solid #00bcd4;
                    overflow: hidden;
                    box-sizing: border-box;
                    aspect-ratio: 1 / 1;
                    position: relative;
                ">
                    <img id="profile-image" src="${profileImageData}" alt="Profile" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        display: ${profileImageData ? "block" : "none"};
                    " />
                    <div id="profile-icon-container" style="
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute;
                        top: 0;
                        left: 0;
                    ">
                        <i class="fa-solid fa-user" id="profile-icon" style="
                            font-size: 60px; 
                            color: #86868b; 
                            display: ${profileImageData ? "none" : "block"};
                        "></i>
                    </div>
                </div>
                
                <label for="profile-image-upload" style="
                    margin-bottom: 30px;
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s;
                    display: inline-block;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <i class="fa-solid fa-camera" style="margin-right: 8px;"></i>
                    Зураг сонгох
                </label>
                <input type="file" id="profile-image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
                
                <h2 style="
                    font-size: 28px;
                    font-weight: 700;
                    color: #1d1d1f;
                    margin-bottom: 30px;
                ">Миний профайл</h2>
                
                <div style="
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                ">
                    <div style="display: flex; flex-direction: column; gap: 8px; text-align: left;">
                        <label style="font-size: 14px; font-weight: 600; color: #1d1d1f;">Нэр</label>
                        <input type="text" id="profile-name" value="${userName}" placeholder="Нэрээ оруулна уу" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1px solid #e5e5e7;
                            border-radius: 8px;
                            font-size: 16px;
                            outline: none;
                            transition: border 0.3s;
                        " onfocus="this.style.border='1px solid #00bcd4'" onblur="this.style.border='1px solid #e5e5e7'">
                    </div>

                    <div style="display: flex; gap: 15px;">
                        <div style="display: flex; flex-direction: column; gap: 8px; text-align: left; flex: 1;">
                            <label style="font-size: 14px; font-weight: 600; color: #1d1d1f;">Нас</label>
                            <input type="number" id="profile-age" value="${userAge}" placeholder="Нас" min="1" max="120" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #e5e5e7;
                                border-radius: 8px;
                                font-size: 16px;
                                outline: none;
                                transition: border 0.3s;
                            " onfocus="this.style.border='1px solid #00bcd4'" onblur="this.style.border='1px solid #e5e5e7'">
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 8px; text-align: left; flex: 1;">
                            <label style="font-size: 14px; font-weight: 600; color: #1d1d1f;">Хүйс</label>
                            <select id="profile-gender" style="
                                width: 100%;
                                padding: 12px 16px;
                                border: 1px solid #e5e5e7;
                                border-radius: 8px;
                                font-size: 16px;
                                outline: none;
                                background: white;
                                cursor: pointer;
                                transition: border 0.3s;
                            " onfocus="this.style.border='1px solid #00bcd4'" onblur="this.style.border='1px solid #e5e5e7'">
                                <option value="">Сонгох</option>
                                <option value="male" ${
                                  userGender === "male" ? "selected" : ""
                                }>Эрэгтэй</option>
                                <option value="female" ${
                                  userGender === "female" ? "selected" : ""
                                }>Эмэгтэй</option>
                                <option value="other" ${
                                  userGender === "other" ? "selected" : ""
                                }>Бусад</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px; text-align: left;">
                        <label style="font-size: 14px; font-weight: 600; color: #1d1d1f;">Имэйл</label>
                        <input type="email" id="profile-email" value="${userEmail}" placeholder="имэйл@example.com" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1px solid #e5e5e7;
                            border-radius: 8px;
                            font-size: 16px;
                            outline: none;
                            transition: border 0.3s;
                        " onfocus="this.style.border='1px solid #00bcd4'" onblur="this.style.border='1px solid #e5e5e7'">
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px; text-align: left;">
                        <label style="font-size: 14px; font-weight: 600; color: #1d1d1f;">Утасны дугаар</label>
                        <input type="tel" id="profile-phone" value="${userPhone}" placeholder="12345678" maxlength="8" pattern="[0-9]{8}" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1px solid #e5e5e7;
                            border-radius: 8px;
                            font-size: 16px;
                            outline: none;
                            transition: border 0.3s;
                        " oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 8);" onfocus="this.style.border='1px solid #00bcd4'" onblur="this.style.border='1px solid #e5e5e7'">
                        <small style="font-size: 12px; color: #86868b; margin-top: -4px;">Яг 8 оронтой тоо оруулна уу</small>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px; text-align: left;">
                        <label style="font-size: 14px; font-weight: 600; color: #1d1d1f;">Хаяг</label>
                        <textarea id="profile-address" placeholder="Хаягаа оруулна уу" rows="3" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 1px solid #e5e5e7;
                            border-radius: 8px;
                            font-size: 16px;
                            outline: none;
                            resize: vertical;
                            font-family: inherit;
                            transition: border 0.3s;
                        " onfocus="this.style.border='1px solid #00bcd4'" onblur="this.style.border='1px solid #e5e5e7'">${userAddress}</textarea>
                    </div>
                </div>
                
                <div style="
                    width: 100%;
                    border-top: 1px solid #e5e5e7;
                    padding-top: 20px;
                    margin-top: 30px;
                    display: flex;
                    gap: 15px;
                ">
                    <button onclick="saveProfileData(); this.closest('.profile-popup').remove();" style="
                        flex: 1;
                        padding: 14px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        Хадгалах
                    </button>
                    <button onclick="logout(); this.closest('.profile-popup').remove();" style="
                        flex: 1;
                        padding: 14px;
                        background: #ff3b30;
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='#d70015'" onmouseout="this.style.background='#ff3b30'">
                        Гарах
                    </button>
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
        </style>
    `;

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });

  document.body.appendChild(popup);
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    alert("Зөвхөн зураг файл сонгоно уу!");
    return;
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Зургийн хэмжээ 5MB-аас их байж болохгүй!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageData = e.target.result;

    // Display image in profile circle
    const profileImage = document.getElementById("profile-image");
    const profileIcon = document.getElementById("profile-icon");

    if (profileImage) {
      profileImage.src = imageData;
      profileImage.style.display = "block";
    }

    if (profileIcon) {
      profileIcon.style.display = "none";
    }

    // Save to temporary variable for later saving
    if (typeof window !== "undefined") {
      window.tempProfileImage = imageData;
    }
  };

  reader.readAsDataURL(file);
}

// Update profile icon based on gender selection (removed - no longer needed)
function updateProfileIcon(gender) {
  // This function is no longer needed as we removed gender-based icons
  // Keeping it for backward compatibility but it does nothing
}

// Save profile data to localStorage
function saveProfileData() {
  const email = document.getElementById("profile-email")?.value || "";
  const phone = document.getElementById("profile-phone")?.value || "";

  // Email validation - must contain @
  if (email && !email.includes("@")) {
    alert("Имэйл хаягт @ тэмдэгт байх ёстой!");
    return;
  }

  // Phone validation - must be exactly 8 digits
  if (phone) {
    const phoneDigits = phone.replace(/[^0-9]/g, "");
    if (phoneDigits.length !== 8) {
      alert("Утасны дугаар яг 8 оронтой тоо байх ёстой!");
      return;
    }
  }

  // Get image data (either from temp variable or existing image)
  const profileImage = document.getElementById("profile-image");
  const imageData = window.tempProfileImage || profileImage?.src || "";

  const userData = {
    name: document.getElementById("profile-name")?.value || "",
    age: document.getElementById("profile-age")?.value || "",
    gender: document.getElementById("profile-gender")?.value || "",
    email: email,
    phone: phoneDigits || phone,
    address: document.getElementById("profile-address")?.value || "",
    profileImage: imageData,
  };

  localStorage.setItem("userData", JSON.stringify(userData));

  // Clear temp image
  if (window.tempProfileImage) {
    delete window.tempProfileImage;
  }

  if (typeof showNotification === "function") {
    showNotification("Профайл амжилттай хадгалагдлаа!");
  } else {
    alert("Профайл амжилттай хадгалагдлаа!");
  }
}

// Add user icon click handler
function setupUserIcon() {
  const userIcon = document.getElementById("user-icon");
  if (userIcon) {
    userIcon.addEventListener("click", () => {
      checkLoginStatus();
      if (isLoggedIn) {
        // If logged in, show profile popup
        showProfilePopup();
      } else {
        showLoginPopup();
      }
    });
  }
}

// Protect cart icon - require login
function setupCartIcon() {
  const cartIcon = document.getElementById("cart-icon");
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      checkLoginStatus();
      if (!isLoggedIn) {
        e.preventDefault();
        e.stopPropagation();
        showLoginPopup();
        showNotification("Эхлээд нэвтэрнэ үү!");
        return false;
      }
      // If logged in, allow default cart behavior
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initLoginPopup();
    setupUserIcon();
    setupCartIcon();
    updateLoginUI();
  });
} else {
  initLoginPopup();
  setupUserIcon();
  setupCartIcon();
  updateLoginUI();
}

// Helper function for notifications (if not exists)
if (typeof showNotification === "undefined") {
  function showNotification(message) {
    alert(message);
  }
}
