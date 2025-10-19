let cart = [];

document.querySelectorAll(".add-to-cart").forEach(btn => {
  btn.addEventListener("click", (e) => {
    let card = e.target.closest(".product-card");

    // Take only the first text node (current price)
    let priceText = card.querySelector(".price").childNodes[0].textContent;
    let price = parseInt(priceText.replace(/[^0-9]/g, ""));

    let productName = card.querySelector("h3").textContent;

    // Check if product already exists in cart
    let existing = cart.find(item => item.name === productName);

    if (existing) {
      existing.quantity++;  // Increase quantity
    } else {
      let product = {
        name: productName,
        price: price,
        img: card.querySelector("img").src,
        quantity: 1
      };
      cart.push(product);
    }

    updateCart();
    showToast();
  });
});

// Update cart display
function updateCart() {
  document.getElementById("cart-count").textContent = cart.length;

  let cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover;">
      <div style="flex:1; margin-left:10px;">
        <h4>${item.name}</h4>
        <p>₹${(item.price * item.quantity).toLocaleString()}</p>
        <div>
          <button class="qty-btn" onclick="decreaseQty(${index})">➖</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="increaseQty(${index})">➕</button>
          <button class="qty-btn" onclick="removeItem(${index})">🗑️</button>
        </div>
      </div>
    `;
    cartItems.appendChild(div);
  });

  document.getElementById("cart-total").textContent = total.toLocaleString();
}

// Increase quantity
function increaseQty(index) {
  cart[index].quantity++;
  updateCart();
}

// Decrease quantity
function decreaseQty(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1); // remove if 0
  }
  updateCart();
}

// Remove item
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

// Open / Close Cart
document.querySelector(".cart-btn").addEventListener("click", () => {
  document.getElementById("cart-modal").style.display = "flex";
});
document.getElementById("close-cart").addEventListener("click", () => {
  document.getElementById("cart-modal").style.display = "none";
});

// Buy Button
document.getElementById("buy-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
  } else {
    alert("Thank you for your purchase!");
    cart = [];
    updateCart();
    document.getElementById("cart-modal").style.display = "none";
  }
});

// Show toast message
function showToast() {
  let toast = document.getElementById("toast");
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}







// Search functionality

document.addEventListener('DOMContentLoaded', () => {
  // --- find search input & button (works even if button has no id) ---
  const searchInput = document.getElementById('searchInput')
                    || document.querySelector('.search-bar input[type="text"]')
                    || document.querySelector('.search-bar input');
  const searchBtn = document.getElementById('searchBtn')
                  || document.querySelector('.search-bar button')
                  || (searchInput && searchInput.nextElementSibling && searchInput.nextElementSibling.tagName === 'BUTTON' ? searchInput.nextElementSibling : null);

  if (!searchInput) {
    console.warn('Search input (#searchInput) not found on page.');
    return;
  }

  // --- helper: find ancestor with a bootstrap-like col class e.g. "col-md-2" or "col" ---
  function findColumnAncestor(el) {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      if ([...cur.classList].some(c => c === 'col' || c.startsWith('col-') || c === 'product-col' )) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  // --- collect product entries: card element, its outer column, and its searchable name ---
  const productCards = Array.from(document.querySelectorAll('.product-card'));
  const products = productCards.map(card => {
    const col = findColumnAncestor(card) || card; // fallback to card itself
    const h3 = card.querySelector('h3') || card.querySelector('h4') || null;
    const nameFromH3 = h3 ? h3.textContent.trim() : '';
    const nameFromData = (card.dataset && (card.dataset.name || card.dataset.category)) ? (card.dataset.name || card.dataset.category) : '';
    const nameFromImg = (card.querySelector('img') && card.querySelector('img').alt) ? card.querySelector('img').alt.trim() : '';
    const name = (nameFromH3 || nameFromData || nameFromImg).toLowerCase();
    return { card, col, name };
  });

  // --- search function ---
  function searchProducts() {
    const q = searchInput.value.toLowerCase().trim();

    // if query empty -> show all
    if (!q) {
      products.forEach(p => { p.col.style.display = ''; });
      return;
    }

    products.forEach(p => {
      const match = p.name.includes(q);
      p.col.style.display = match ? '' : 'none';
    });
  }

  // --- debounce helper for live typing ---
  function debounce(fn, wait = 180) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // --- wire events: click, enter, and live typing ---
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      searchProducts();
    });
  }

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchProducts();
    }
  });

  // live search while typing (debounced)
  searchInput.addEventListener('input', debounce(searchProducts, 160));
});


// Category filtering

document.addEventListener("DOMContentLoaded", () => {
  // Select all category bar buttons
  const categoryButtons = document.querySelectorAll("#categoryBar button");

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target"); // e.g., "electronics"
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        // Smooth scroll to the section
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        console.warn("Section not found for:", targetId);
      }
    });
  });
});

// Backend server (Node.js + Express + MySQL) - server.js
document.getElementById("buy-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Send cart to backend
  fetch("http://localhost:5000/api/buy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: 1,   // demo user
      cartItems: cart
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Order Response:", data);
    alert("✅ Order placed successfully!");
    cart = []; // clear frontend cart
    updateCart(); // refresh UI cart
  })
  .catch(err => console.error("Error:", err));
});
//

