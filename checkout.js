document.addEventListener("DOMContentLoaded", () => {
    const checkoutTable = document.getElementById("checkoutTable")?.querySelector("tbody");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const checkoutForm = document.getElementById("checkoutForm");
    const cardContainer = document.getElementById("card-element");
    const checkoutSection = document.getElementById("checkoutSection");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Show empty cart message
    if (cart.length === 0) {
        if (checkoutSection) {
            checkoutSection.innerHTML = "<p>Your cart is empty. <a href='shop.html'>Continue Shopping</a></p>";
        }
        return;
    }

    // Update checkout table
    function updateCheckoutTable() {
        if (!checkoutTable || !checkoutTotal) return;

        let rows = "";
        let total = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            rows += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                </tr>`;
            total += subtotal;
        });

        checkoutTable.innerHTML = rows;
        checkoutTotal.textContent = total.toFixed(2);
    }

    updateCheckoutTable();

    // Stripe setup
    let stripe, card;
    if (cardContainer && typeof Stripe !== "undefined") {
        stripe = Stripe('your-publishable-key-here'); // Replace with your real key
        const elements = stripe.elements();
        card = elements.create('card');
        card.mount('#card-element');
    }

    // PayPal Button Flag
    let paypalButtonRendered = false;

    // Handle form submission
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const nameInput = document.getElementById("name");
            const paymentMethod = document.getElementById("payment").value;

            const name = nameInput?.value.trim();
            const nameRegex = /^[A-Za-z\s]+$/;

            if (!name || !nameRegex.test(name)) {
                alert("Please enter a valid name using alphabets only.");
                return;
            }

            if (paymentMethod === "card") {
                if (!stripe || !card) {
                    alert("Card payments are currently unavailable.");
                    return;
                }

                const { token, error } = await stripe.createToken(card);
                if (error) {
                    alert(error.message);
                    return;
                }

                console.log("Stripe Token:", token); // Send token to backend for processing

                handleSuccessfulPurchase();
            } else if (paymentMethod === "paypal") {
                handlePayPalPayment();
            }
        });
    }

    // PayPal payment handler
    function handlePayPalPayment() {
        if (paypalButtonRendered || typeof paypal === "undefined") return;

        paypalButtonRendered = true;

        paypal.Buttons({
            createOrder: function (data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: checkoutTotal.textContent
                        }
                    }]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (details) {
                    console.log("Transaction completed by", details.payer.name.given_name);
                    handleSuccessfulPurchase();
                });
            },
            onError: function (err) {
                console.error("PayPal Error:", err);
                alert("There was an issue with your PayPal transaction.");
            }
        }).render('#paypal-button-container');
    }

    // Successful purchase handler
    function handleSuccessfulPurchase() {
        alert("Thank you for your purchase! Your order will be delivered in 3–5 days.");
        localStorage.removeItem("cart");

        if (checkoutForm) checkoutForm.reset();
        if (checkoutTable) checkoutTable.innerHTML = "";
        if (checkoutTotal) checkoutTotal.textContent = "0";

        if (checkoutSection) {
            checkoutSection.innerHTML = "<p>Thank you for your order! <a href='shop.html'>Continue Shopping</a></p>";
        }
    }
});
