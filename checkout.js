document.addEventListener("DOMContentLoaded", () => {
    const checkoutTable = document.getElementById("checkoutTable")?.querySelector("tbody");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const checkoutForm = document.getElementById("checkoutForm");
    const paymentSelect = document.getElementById("payment");
    const cardSection = document.getElementById("card-section");
    const cardContainer = document.getElementById("card-element");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Show empty message
    if (cart.length === 0) {
        const checkoutContainer = document.querySelector(".checkout-container");
        if (checkoutContainer) {
            checkoutContainer.innerHTML = "<p>Your cart is empty. <a href='shop.html'>Continue Shopping</a></p>";
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
        stripe = Stripe('your-publishable-key-here'); // Replace with your Stripe publishable key
        const elements = stripe.elements();
        card = elements.create('card');
        card.mount('#card-element');
    }

    // Payment method toggle
    paymentSelect.addEventListener("change", () => {
        const selected = paymentSelect.value;
        if (selected === "card") {
            cardSection.style.display = "block";
        } else {
            cardSection.style.display = "none";
        }
    });

    // Form submission handler
    checkoutForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const address = document.getElementById("address").value.trim();
        const paymentMethod = paymentSelect.value;

        // Validate name
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            alert("Please enter a valid name using alphabets only.");
            return;
        }

        if (!address) {
            alert("Please enter your address.");
            return;
        }

        if (paymentMethod === "card") {
            const { token, error } = await stripe.createToken(card);
            if (error) {
                alert(error.message);
                return;
            }

            console.log("Stripe Token:", token); // You can send this token
