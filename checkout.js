document.addEventListener("DOMContentLoaded", function () { 
    const checkoutTable = document.getElementById("checkoutTable").querySelector("tbody");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const checkoutForm = document.getElementById("checkoutForm");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];


    if (cart.length === 0) {
        const checkoutSection = document.getElementById("checkoutSection");
        if (checkoutSection) {
            checkoutSection.innerHTML = "<p>Your cart is empty. <a href='./Consoles_and_Gaming_Peripherals_New.html'>Continue Shopping</a></p>";
        }
        return;
    }

   
    function updateCheckoutTable() {
        checkoutTable.innerHTML = "";
        let total = 0;
        cart.forEach(item => {
            let row = `<tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>`;
            checkoutTable.innerHTML += row;
            total += item.price * item.quantity;
        });
        checkoutTotal.textContent = total.toFixed(2);
    }

    updateCheckoutTable();

    checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = document.getElementById("name").value.trim();
        const nameRegex = /^[A-Za-z\s]+$/;
    
        if (!nameRegex.test(name)) {
            alert("Please enter a valid name using alphabets only (no numbers or special characters).");
            return;
        }
        

        alert("Thank you for your purchase! Your order will be delivered in 3-5 days.");

        localStorage.removeItem("cart");
        checkoutForm.reset();
        checkoutTable.innerHTML = "";
        checkoutTotal.textContent = "0";
    });
});


// Stripe setup
const stripe = Stripe('your-publishable-key-here');
const elements = stripe.elements();
const card = elements.create('card');
card.mount('#card-element');

const form = document.getElementById('checkoutForm');
form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const paymentMethod = document.getElementById('payment').value;

    if (paymentMethod === 'card') {
        const { token, error } = await stripe.createToken(card);

        if (error) {
            alert(error.message);
        } else {
            alert("Thank you for your purchase! Your order will be delivered in 3-5 days.");
            localStorage.removeItem("cart");
            form.reset();
            document.getElementById("checkoutTable").querySelector("tbody").innerHTML = "";
            document.getElementById("checkoutTotal").textContent = "0";
            console.log("Stripe Token:", token);  // send this to your backend in real implementation
        }
    }
});


// PayPal setup
paypal.Buttons({
    createOrder: function (data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: document.getElementById('checkoutTotal').innerText
                }
            }]
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
            alert('Transaction completed by ' + details.payer.name.given_name);
            // Optional: send order details to your backend
        });
    }
}).render('#paypal-button-container');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const paymentMethod = document.getElementById('payment').value;

    if (paymentMethod === 'card') {
        stripe.createToken(card).then(handleStripePayment);
    } else if (paymentMethod === 'paypal') {
        // PayPal is handled separately via button
    }
});

function handleStripePayment({ token, error }) {
    if (error) {
        console.error(error);
        alert(error.message);
    } else {
        console.log('Stripe Token:', token);
        // Process token on backend
    }
}

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

function proceedToCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before proceeding to checkout.");
        return;
    }

    window.location.href = "./checkout.html";
}

// Load cart when the page loads
document.addEventListener("DOMContentLoaded", updateCartTable);
