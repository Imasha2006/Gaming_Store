// Initialize cart from localStorage or empty array
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Add item to cart
function addToCart(name, price, imageUrl) {
    console.log("Image URL: ", imageUrl);
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price: parseFloat(price), quantity: 1, image: imageUrl });
    }

    saveCart();
    updateCartTable();
}

// Update cart table (cart.html)
function updateCartTable() {
    const tbody = document.querySelector("#cartTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        let row = `<tr>
            <td>${item.name}</td>
            <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)"></td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td><button onclick="removeFromCart(${index})">Remove</button></td>
        </tr>`;
        tbody.innerHTML += row;
        total += item.price * item.quantity;
    });

    const totalPriceEl = document.getElementById("totalPrice");
    if (totalPriceEl) totalPriceEl.textContent = total.toFixed(2);

    const badge = document.querySelector(".badge");
    if (badge) badge.setAttribute("data-count", cart.length);
}

// Update quantity of an item
function updateQuantity(index, newQty) {
    const qty = parseInt(newQty);
    if (!isNaN(qty) && qty > 0) {
        cart[index].quantity = qty;
        saveCart();
        updateCartTable();
    }
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartTable();
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    window.location.href = "./Checkout_Page.html";
}

// Display checkout page
function updateCheckoutPage() {
    const table = document.getElementById("checkoutTable");
    const totalDisplay = document.getElementById("checkoutTotal");
    if (!table || !totalDisplay) return;

    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        let row = `<tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`;
        tbody.innerHTML += row;
        total += item.price * item.quantity;
    });

    totalDisplay.textContent = total.toFixed(2);
}

// Handle checkout form
function handleCheckoutForm() {
    const form = document.getElementById("checkoutForm");
    const thankYouMessage = document.getElementById("thankYouMessage");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        cart = [];
        saveCart();
        localStorage.removeItem("cart");

        form.reset();
        document.querySelector("#checkoutTable tbody").innerHTML = "";
        document.getElementById("checkoutTotal").textContent = "0";

        if (thankYouMessage) {
            thankYouMessage.classList.remove("hidden");
        } else {
            const msg = document.createElement("p");
            msg.textContent = "Thank you for your purchase! Your order will be delivered in 3–5 days.";
            form.parentNode.appendChild(msg);
        }
    });
}

// Setup favourites
function setupFavourites() {
    const saveBtn = document.getElementById("saveFavourite");
    const applyBtn = document.getElementById("applyFavourite");

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (cart.length === 0) return alert("Cart is empty.");
            localStorage.setItem("favourites", JSON.stringify(cart));
            alert("Favourites saved!");
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            const favourite = localStorage.getItem("favourites");
            if (!favourite) return alert("No favourites found.");
            const items = JSON.parse(favourite);
            const container = document.querySelector("section");
            if (!container) return;

            container.innerHTML = "<h1>Your Favourites</h1>";

            const backButton = document.createElement("button");
            backButton.textContent = "Go Back";
            backButton.addEventListener("click", () => {
                window.location.href = "Consoles_and_Gaming_Peripherals_New.html";
            });
            container.appendChild(backButton);

            items.forEach(item => {
                const box = document.createElement("div");
                box.classList.add("box");
                box.innerHTML = `
                    <div class="text-box">
                        <img src="${item.image}" alt="${item.name}" style="width:150px; border-radius:10px;">
                        <h2>${item.name}</h2>
                        <div class="price">Price: $${item.price.toFixed(2)}</div>
                    </div>`;
                container.appendChild(box);
            });
        });
    }
}

// Display favourites (favourites.html)
function applyFavourites() {
    const favourites = JSON.parse(localStorage.getItem("favourites")) || [];
    const tableBody = document.getElementById("favouritesBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    favourites.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}" style="width: 100px;"></td>
            <td>${item.name}</td>
            <td><button onclick="removeFavourite(${index})">Remove</button></td>
        `;

        tableBody.appendChild(row);
    });
}

// Remove favourite
function removeFavourite(index) {
    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

    favourites.splice(index, 1);
    localStorage.setItem("favourites", JSON.stringify(favourites));

    applyFavourites();
}

// Buy Now buttons
function setupBuyNowButtons() {
    document.querySelectorAll(".buyNowButton").forEach(button => {
        button.addEventListener("click", function () {
            const itemName = this.getAttribute("data-item-name");
            const itemPrice = parseFloat(this.getAttribute("data-item-price"));
            const image = this.getAttribute("data-item-image") || "";

            const existing = cart.find(item => item.name === itemName);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ name: itemName, price: itemPrice, quantity: 1, image });
            }

            saveCart();
            window.location.href = "./Checkout_Page.html";
        });
    });
}

// Toggle visibility of a section
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.style.display = section.style.display === 'block' ? 'none' : 'block';
}

// Setup after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    updateCartTable();
    updateCheckoutPage();
    handleCheckoutForm();
    setupFavourites();
    setupBuyNowButtons();
    applyFavourites(); // For favourites.html
});
