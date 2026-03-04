const supabaseUrl = "https://lffgwwnymaldoiohukum.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZmd3d255bWFsZG9pb2h1a3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2Mjk5NDcsImV4cCI6MjA4NjIwNTk0N30._YaYuA1dHc-dMtAFwV0FaZ4tWpNht8B9s3Y_2LI3EOM";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const productGrid = document.getElementById("productGrid");
const homeSearch = document.getElementById("homeSearch");

let allProducts = [];
let currentTab = "collection";

function showNotification(message, type) {
  const notifyBox = document.getElementById("notifyBox");

  notifyBox.innerText = message;
  notifyBox.className = "notify show " + type;

  setTimeout(() => {
    notifyBox.classList.remove("show");
  }, 3000);
}

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    productGrid.innerHTML = "<p>Failed to load products</p>";
    return;
  }

  allProducts = data;
  showCollection();
}

function renderProducts(filteredProducts) {
  productGrid.innerHTML = "";

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = "<p style='text-align:center;'>No products found</p>";
    return;
  }

  filteredProducts.forEach(product => {

    productGrid.innerHTML += `
      <div class="product-card" onclick="openProduct(${product.id})" style="cursor:pointer;">
        
        <div style="position:relative;">
          ${product.is_soldout ? '<div class="sold-tag">SOLD OUT</div>' : ''}
          <img src="${product.image_url}">
        </div>

        <h3>${product.name}</h3>

        ${
          product.discount_price
            ? `<p>
                <span style="text-decoration:line-through;color:#999;">
                  PKR ${product.price}
                </span>
                <strong style="color:#e91e63;margin-left:8px;">
                  PKR ${product.discount_price}
                </strong>
              </p>`
            : `<p><strong>PKR ${product.price}</strong></p>`
        }

      </div>
    `;
  });

}

function showCollection() {
  currentTab = "collection";
  const collectionItems = allProducts.filter(
    p => p.category === "collection" || !p.category
  );
  renderProducts(collectionItems);
}

function showDeals() {
  currentTab = "deal";
  const dealItems = allProducts.filter(
    p => p.category === "deal"
  );
  renderProducts(dealItems);
}

document.addEventListener("click", function(e){
  if(e.target.id === "collectionTab"){
    document.getElementById("collectionTab").classList.add("active-tab");
    document.getElementById("dealsTab").classList.remove("active-tab");
    showCollection();
  }

  if(e.target.id === "dealsTab"){
    document.getElementById("dealsTab").classList.add("active-tab");
    document.getElementById("collectionTab").classList.remove("active-tab");
    showDeals();
  }
});

if (homeSearch) {
  homeSearch.addEventListener("input", function () {
    const value = this.value.trim().toLowerCase();

    if (value === "") {
      if (currentTab === "collection") {
        showCollection();
      } else {
        showDeals();
      }
      return;
    }

    let baseProducts =
      currentTab === "collection"
        ? allProducts.filter(p => p.category === "collection" || !p.category)
        : allProducts.filter(p => p.category === "deal");

    const filtered = baseProducts.filter(product =>
      product.name.toLowerCase().includes(value) ||
      (product.description || "").toLowerCase().includes(value)
    );

    renderProducts(filtered);
  });
}

function changeQty(button, change) {
  const span = button.parentElement.querySelector("span");
  let qty = Number(span.innerText);
  qty += change;
  if (qty < 1) qty = 1;
  span.innerText = qty;
}

loadProducts();
function openProduct(id) {
  window.location.href = "product-details.html?id=" + id;
}