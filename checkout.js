document.addEventListener("DOMContentLoaded", () => {
    const checkoutTable = document.getElementById("checkoutTable")?.querySelector("tbody");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const checkoutForm = document.getElementById("checkoutForm");
    const cardContainer = document.getElementById("card-element");
    const paymentSelect = document.getElementById("payment");
    const cardSection = document.getElementById("card-section");
    const payButton = document.getElementById("payButton");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Show empty message
    if (cart.length === 0) {
        const checkoutSection = document.getElementById("checkoutSection");
        if (checkoutSection) {
            checkoutSection.innerHTML = "<p>Your cart is empty. <a href='shop.html'>Continue Shopping</a></p>";
        }
        return;
    }

    // Update checkout table
    function updateCheckoutTable() {
        checkoutTable.innerHTML = "";
        let total = 0;
        cart.forEach(item => {
            checkoutTable.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>`;
            total += item.price * item.quantity;
        });
        checkoutTotal.textContent = total.toFixed(2);
    }

    updateCheckoutTable();

    // Stripe setup
    let stripe, card;
    if (cardContainer) {
        stripe = Stripe('your-publishable-key-here');
        const elements = stripe.elements();
        card = elements.create('card');
        card.mount('#card-element');
    }

checkoutForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const paymentMethod = paymentSelect.value;

    // Validate name
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
        alert("Please enter a valid name using alphabets only.");
        return;
    }

    if (paymentMethod === "card") {
        const { token, error } = await stripe.createToken(card);
        if (error) {
            alert(error.message);
            return;
        }

        console.log("Stripe Token:", token);
        handleSuccessfulPurchase();
    } else if (paymentMethod === "cod") {
        alert("Order placed with Cash on Delivery. Please keep the payment ready.");
        handleSuccessfulPurchase();
    }
});


    // PayPal button integration
    function handlePayPalPayment() {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: checkoutTotal.textContent // Use the total here
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    console.log("Transaction completed by", details.payer.name.given_name);
                    handleSuccessfulPurchase();
                });
            }
        }).render('#paypal-button-container');
    }

    // Success Handler
    function handleSuccessfulPurchase() {
        alert("Thank you for your purchase! Your order will be delivered in 3–5 days.");
        localStorage.removeItem("cart");
        checkoutForm.reset();
        if (checkoutTable) checkoutTable.innerHTML = "";
        if (checkoutTotal) checkoutTotal.textContent = "0";
    }
});
paymentSelect.addEventListener("change", function () {
    const selectedMethod = paymentSelect.value;

    if (selectedMethod === "card") {
        cardSection.style.display = "block";
        payButton.style.display = "inline-block";
    } else if (selectedMethod === "cod") {
        cardSection.style.display = "none";
        payButton.style.display = "inline-block";
    } else {
        cardSection.style.display = "none";
        payButton.style.display = "none";
    }
});
