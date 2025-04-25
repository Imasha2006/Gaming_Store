document.addEventListener("DOMContentLoaded", () => {
    const checkoutTable = document.getElementById("checkoutTable")?.querySelector("tbody");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const checkoutForm = document.getElementById("checkoutForm");
    const cardContainer = document.getElementById("card-element");
    const expiryInput = document.getElementById("expiry");
    const paymentSelect = document.getElementById("payment");
    const cardSection = document.getElementById("card-section");
    const payButton = document.querySelector("button[type='submit']");

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
        stripe = Stripe('your-publishable-key-here'); // Replace with real key
        const elements = stripe.elements();
        card = elements.create('card');
        card.mount('#card-element');
    }

    // Show/hide credit card section
    paymentSelect.addEventListener("change", function () {
        if (paymentSelect.value === "card") {
            cardSection.style.display = "block";
            payButton.style.display = "inline-block";
        } else {
            cardSection.style.display = "none";
            payButton.style.display = "inline-block";
        }
    });

    // Trigger initial state
    paymentSelect.dispatchEvent(new Event('change'));

    // Form submit
    checkoutForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const name = document.getElementById("name").value.trim();
        const paymentMethod = paymentSelect.value;

        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            alert("Please enter a valid name using letters only.");
            return;
        }

        if (paymentMethod === "card") {
            // Validate expiry date
            const expiry = expiryInput.value;
            if (!expiry) {
                alert("Please enter your card expiry date.");
                return;
            }

            const today = new Date();
            const [expYear, expMonth] = expiry.split("-").map(Number);
            const expiryDate = new Date(expYear, expMonth - 1);
            if (expiryDate < new Date(today.getFullYear(), today.getMonth())) {
                alert("Card expiry date is invalid or expired.");
                return;
            }

            const { token, error } = await stripe.createToken(card);
            if (error) {
                alert(error.message);
                return;
            }

            console.log("Stripe Token:", token); // Send to backend

            handleSuccessfulPurchase();
        } else if (paymentMethod === "COD") {
            handleSuccessfulPurchase();
        }
    });

    // Success
    function handleSuccessfulPurchase() {
        alert("Thank you for your purchase! Your order will be delivered in 3–5 days.");
        localStorage.removeItem("cart");
        checkoutForm.reset();
        if (checkoutTable) checkoutTable.innerHTML = "";
        if (checkoutTotal) checkoutTotal.textContent = "0";
        cardSection.style.display = "none";
    }
});
