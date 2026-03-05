const supabaseUrl = "https://lffgwwnymaldoiohukum.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZmd3d255bWFsZG9pb2h1a3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2Mjk5NDcsImV4cCI6MjA4NjIwNTk0N30._YaYuA1dHc-dMtAFwV0FaZ4tWpNht8B9s3Y_2LI3EOM";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const checkAdmin = async () => {
  const { data } = await supabaseClient.auth.getUser();

  if (!data.user) {
    window.location.href = "/admin-login.html";
    return;
  }

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    window.location.href = "/";
  }
};

checkAdmin();
const form = document.getElementById("productForm");
const tableBody = document.querySelector("#productTable tbody");
const preview = document.getElementById("preview");
const searchInput = document.getElementById("productSearch");

let products = [];

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) return console.error(error);

  products = data;
  renderProducts(products);
}

function renderProducts(productArray) {
  tableBody.innerHTML = "";

  productArray.forEach(product => {
    tableBody.innerHTML += `
      <tr>
        <td>
          <img src="${product.image_url}" width="80" height="80"
          style="object-fit:cover;border-radius:10px;">
        </td>
        <td>${product.name}</td>
        <td>${product.description}</td>
        <td>${product.price}</td>
        <td>${product.discount_price || "-"}</td>
        <td>
${product.colors ? product.colors : "-"}
${product.colors && product.soldout_colors ? `<br><small style="color:red">Sold: ${product.soldout_colors}</small>` : ""}
</td>

<td>
${product.sizes ? product.sizes : "-"}
${product.sizes && product.soldout_sizes ? `<br><small style="color:red">Sold: ${product.soldout_sizes}</small>` : ""}
</td>
  <button class="action-btn edit-btn" onclick="editProduct(${product.id})">Edit</button>
  <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
  <button class="action-btn sold-btn" onclick="toggleSoldOut(${product.id}, ${product.is_soldout})">
    ${product.is_soldout ? "Remove Sold Out" : "Mark Sold Out"}
  </button>
</td>

      </tr>
    `;
  });
}

/* SAFE SEARCH */
searchInput.addEventListener("input", function () {
  const value = this.value.trim().toLowerCase();

  if (value === "") {
    renderProducts(products);
    return;
  }

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(value) ||
    product.description.toLowerCase().includes(value) ||
    (product.category && product.category.toLowerCase().includes(value))
  );

  renderProducts(filtered);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("productId").value;
  const name = document.getElementById("name").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const discountPrice = document.getElementById("discountPrice").value;
  const category = document.getElementById("category").value;
  const colors = document.getElementById("colors").value;
  const sizes = document.getElementById("sizes").value;
  const soldoutColors = Array.from(
  document.querySelectorAll("#soldoutColorsBox input:checked")
).map(cb => cb.value);

const soldoutSizes = Array.from(
  document.querySelectorAll("#soldoutSizesBox input:checked")
).map(cb => cb.value);

  const imageFile = document.getElementById("image").files[0];
  const imageFile2 = document.getElementById("image2")?.files[0];
  const imageFile3 = document.getElementById("image3")?.files[0];

  let imageUrl = null;
  let imageUrl2 = null;
  let imageUrl3 = null;

  // Upload main image
  if (imageFile) {
    const fileName = Date.now() + "_1_" + imageFile.name;

    await supabaseClient.storage
      .from("products")
      .upload(fileName, imageFile, { upsert: true });

    const { data } = supabaseClient.storage
      .from("products")
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  // Upload second image
  if (imageFile2) {
    const fileName2 = Date.now() + "_2_" + imageFile2.name;

    await supabaseClient.storage
      .from("products")
      .upload(fileName2, imageFile2, { upsert: true });

    const { data } = supabaseClient.storage
      .from("products")
      .getPublicUrl(fileName2);

    imageUrl2 = data.publicUrl;
  }

  // Upload third image
  if (imageFile3) {
    const fileName3 = Date.now() + "_3_" + imageFile3.name;

    await supabaseClient.storage
      .from("products")
      .upload(fileName3, imageFile3, { upsert: true });

    const { data } = supabaseClient.storage
      .from("products")
      .getPublicUrl(fileName3);

    imageUrl3 = data.publicUrl;
  }

  if (id) {
    await supabaseClient
  .from("products")
  .update({
    name,
    description,
    price,
    colors: colors || null,
    sizes: sizes || null,
    soldout_colors: soldoutColors,
    soldout_sizes: soldoutSizes,
    discount_price: discountPrice || null,
    category,
    ...(imageUrl && { image_url: imageUrl }),
    ...(imageUrl2 && { image_2: imageUrl2 }),
    ...(imageUrl3 && { image_3: imageUrl3 })
  })
  .eq("id", id);
  } else {
    await supabaseClient
  .from("products")
  .insert([{
    name,
    description,
    price,
    colors: colors || null,
    sizes: sizes || null,
    soldout_colors: soldoutColors,
    soldout_sizes: soldoutSizes,
    discount_price: discountPrice || null,
    image_url: imageUrl,
    image_2: imageUrl2,
    image_3: imageUrl3,
    category
  }]);
  }

  form.reset();
  preview.style.display = "none";
  document.getElementById("productId").value = "";

  loadProducts();
});
function generateSoldOutOptions(){

  const colors = document.getElementById("colors").value.split(",");
  const sizes = document.getElementById("sizes").value.split(",");

  const colorBox = document.getElementById("soldoutColorsBox");
  const sizeBox = document.getElementById("soldoutSizesBox");

  colorBox.innerHTML = "";
  sizeBox.innerHTML = "";

  colors.forEach(c=>{
    const color = c.trim();
    if(!color) return;

    colorBox.innerHTML += `
    <label class="checkbox-item">
      <input type="checkbox" value="${color}">
      ${color}
    </label>`;
  });

  sizes.forEach(s=>{
    const size = s.trim();
    if(!size) return;

    sizeBox.innerHTML += `
    <label class="checkbox-item">
      <input type="checkbox" value="${size}">
      ${size}
    </label>`;
  });

}

document.getElementById("colors").addEventListener("input",generateSoldOutOptions);
document.getElementById("sizes").addEventListener("input",generateSoldOutOptions);

window.editProduct = function(id) {
  const product = products.find(p => p.id === id);

  document.getElementById("productId").value = product.id;
  document.getElementById("name").value = product.name;
  document.getElementById("description").value = product.description;
  document.getElementById("price").value = product.price;
  document.getElementById("discountPrice").value = product.discount_price || "";
  document.getElementById("category").value = product.category || "collection";
  document.getElementById("colors").value = product.colors || "";
document.getElementById("sizes").value = product.sizes || "";


  preview.src = product.image_url;
  preview.style.display = "block";
};

window.deleteProduct = async function(id) {
  await supabaseClient.from("products").delete().eq("id", id);
  loadProducts();
};

window.toggleSoldOut = async function(id, currentStatus) {
  await supabaseClient
    .from("products")
    .update({ is_soldout: !currentStatus })
    .eq("id", id);

  loadProducts();
};

loadProducts();