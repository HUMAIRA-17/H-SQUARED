let cart = JSON.parse(localStorage.getItem("cart")) || [];
function getDeliveryCharge(address) {

  if (!address) return 250;

  const lowerAddress = address.toLowerCase();

  if (lowerAddress.includes("rawalpindi")) {
    return 200;
  }

  return 250;
}

/* ================= NOTIFICATION SYSTEM ================= */

function showNotification(message, type = "success") {
  let box = document.getElementById("notifyBox");

  if (!box) {
    box = document.createElement("div");
    box.id = "notifyBox";
    box.className = "notify";
    document.body.appendChild(box);
  }

  box.innerHTML = message;
  box.className = "notify show " + type;

  setTimeout(() => {
    box.classList.remove("show");
  }, 3000);
}

/* ================= CART COUNT ================= */

function updateCartCount() {
  const countElement = document.getElementById("cartCount");
  if (!countElement) return;

  let totalQty = 0;
  cart.forEach(item => totalQty += Number(item.qty));
  countElement.innerText = totalQty;
}

/* ================= ADD TO CART ================= */

function addToCart(product) {

  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      qty: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  showNotification("Added to cart 🛒");
}

/* ================= RENDER CART ================= */

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

function renderCart() {

  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";
  let subtotal = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.innerText = "";
    return;
  }

  cart.forEach((item, index) => {

    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;

    subtotal += price * qty;

    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" class="cart-img">
        
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>PKR ${price}</p>

          <div class="qty-box">
            <button onclick="updateQty(${index}, -1)">-</button>
            <span>${qty}</span>
            <button onclick="updateQty(${index}, 1)">+</button>
          </div>

          <p class="subtotal">Subtotal: PKR ${price * qty}</p>
          <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    `;
  });

  const addressInput = document.getElementById("address");
const addressValue = addressInput ? addressInput.value.trim() : "";

const deliveryCharge = getDeliveryCharge(addressValue);
const total = subtotal + deliveryCharge;


  cartTotal.innerHTML = `
  <p><span>Subtotal</span><span>PKR ${subtotal}</span></p>
  <p><span>Delivery</span><span>PKR ${deliveryCharge}</span></p>
  <h3><span>Total</span><span>PKR ${total}</span></h3>
`;
}

/* ================= UPDATE QTY ================= */

function updateQty(index, change) {
  cart[index].qty += change;
  if (cart[index].qty < 1) cart[index].qty = 1;

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

/* ================= REMOVE ITEM ================= */

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
  showNotification("Item removed ❌", "error");
}

/* ================= PLACE ORDER (SUPABASE SAVE) ================= */

/* ================= PLACE ORDER (SUPABASE SAVE) ================= */

async function placeOrder() {

  if (!document.getElementById("name")) return;

  let name = document.getElementById("name").value.trim();
  let address = document.getElementById("address").value.trim();
  let phone = document.getElementById("phone").value.trim();

  if (name === "" || address === "" || phone === "") {
    showNotification("Please fill in all details.", "error");
    return;
  }

  if (!/^[0-9]{10,15}$/.test(phone)) {
    showNotification("Enter valid phone number.", "error");
    return;
  }

  if (cart.length === 0) {
    showNotification("Cart is empty.", "error");
    return;
  }

  // Calculate total amount
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += Number(item.price) * Number(item.qty);
  });

  const deliveryCharge = getDeliveryCharge(address);
const total = subtotal + deliveryCharge;


  const supabaseUrl = "https://lffgwwnymaldoiohukum.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZmd3d255bWFsZG9pb2h1a3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2Mjk5NDcsImV4cCI6MjA4NjIwNTk0N30._YaYuA1dHc-dMtAFwV0FaZ4tWpNht8B9s3Y_2LI3EOM";

  if (!window.sbClient) {
    window.sbClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  }

  const supabase = window.sbClient;

  const { error } = await supabase
    .from("orders")
    .insert([
      {
        customer_name: name,
        phone: phone,
        address: address,
        items: cart,
        total_amount: total,
        status: "Pending"
      }
    ]);

  if (error) {
    console.error(error);
    showNotification("Order failed. Try again.", "error");
    return;
  }

  showNotification("Order placed successfully 🎉");

  localStorage.removeItem("cart");
  cart = [];

  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
}


/* ================= INIT ================= */

updateCartCount();
renderCart();
const addressField = document.getElementById("address");

if (addressField) {
  addressField.addEventListener("input", function() {
    renderCart();
  });
}
