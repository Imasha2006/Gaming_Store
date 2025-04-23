// Retrieve cart from local storage or create a new one
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price) {
    let existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }

    // Save cart to local storage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Update cart table
    updateCartTable();
}

function updateCartTable() {
    let tbody = document.querySelector("#cartTable tbody");
    tbody.innerHTML = ""; // Clear previous entries
    let totalPrice = 0;

    cart.forEach(item => {
        let row = `<tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`;
        tbody.innerHTML += row;
        totalPrice += item.price * item.quantity;
    });

    document.getElementById("totalPrice").innerText = totalPrice.toFixed(2);
}

// Navigate to the checkout page
function proceedToCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before proceeding to checkout.");
        return;
    }

    window.location.href = "checkout.html";
}

// Load cart when the page loads
document.addEventListener("DOMContentLoaded", updateCartTable);
