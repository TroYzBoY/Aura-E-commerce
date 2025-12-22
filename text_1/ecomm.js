const API_URL = "https://api.escuelajs.co/api/v1/products";
const productGrid = document.getElementById("productGrid");

// state
let products = [];

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    products = data;
    renderProducts();
  })
  .catch(err => console.log(err));

function renderProducts() {
  productGrid.innerHTML = "";

  products.slice(0, 5).forEach(p => {
    productGrid.innerHTML += `
      <div class="product-card">
        <img src="${p.images[0]}" class="product-image">
        <div class="product-name">${p.title}</div>
        <div class="product-price">₮${p.price}</div>
      </div>
    `;
  });

  productGrid.innerHTML += `
    <div class="see">
      <div class="more"><p>see more...</p></div>
    </div>
  `;
}
