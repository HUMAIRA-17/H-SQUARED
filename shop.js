let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = document.getElementById("cartCount");

function changeQty(btn, val){
let span = btn.parentElement.querySelector("span");
let qty = parseInt(span.innerText) + val;
if(qty < 1) qty = 1;
span.innerText = qty;
}

function addToCart(btn, name, price){
let qty = parseInt(btn.parentElement.querySelector(".qty span").innerText);

let item = cart.find(p => p.name === name);

if(item){
item.qty += qty;
} else {
cart.push({name, price, qty});
}

localStorage.setItem("cart", JSON.stringify(cart));
updateCount();
btn.parentElement.querySelector(".qty span").innerText = 1;
}

function updateCount(){
let count = 0;
cart.forEach(i => count += i.qty);
cartCount.innerText = count;
}

updateCount();
