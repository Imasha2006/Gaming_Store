document.addEventListener("DOMContentLoaded", () => {
    const checkoutTable = document.getElementById("checkoutTable")?.querySelector("tbody");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const checkoutForm = document.getElementById("checkoutForm");
    const cardContainer = document.getElementById("card-element");
    const paymentSelect = document.getElementById("payment");
    const cardSection = document.getElementById("card-section");
    const payButton = document.querySelector("button[type='submit']");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Show empty message if cart is empty
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
        stripe = Stripe('your-publishable-key-here'); // Replace with your real Stripe publishable key
        const elements = stripe.elements();
        card = elements.create('card', {
            hidePostalCode: true, // Hide postal code field
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });
        card.mount('#card-element');
    }

    // Show/hide card section based on selection
    paymentSelect.addEventListener("change", function () {
        const method = paymentSelect.value.toLowerCase();
        if (method === "card") {
            cardSection.style.display = "block";
            payButton.style.display = "inline-block";
        } else if (method === "cod") {
            cardSection.style.display = "none";
            payButton.style.display = "inline-block";
        } else {
            cardSection.style.display = "none";
            payButton.style.display = "none";
        }
    });

    paymentSelect.dispatchEvent(new Event('change')); // Init

    // Form submission
    checkoutForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const paymentMethod = paymentSelect.value;

        if (!/^[A-Za-z\s]+$/.test(name)) {
            alert("Please enter a valid name using letters only.");
            return;
        }

        if (paymentMethod === "card") {
            // Create Stripe token
            const { token, error } = await stripe.createToken(card);
            if (error) {
                alert(error.message); // Show error message if something goes wrong
                console.error(error); // Log the error for debugging
                return;
            }

            console.log("Stripe Token:", token); // You would send this token to your server here

            // Simulate successful payment and show the "Thank You" message
            handleSuccessfulPurchase();
        } else if (paymentMethod === "cod") {
            // Handle successful purchase without card payment
            handleSuccessfulPurchase();
        }
    });

    // Function to handle the purchase completion
    function handleSuccessfulPurchase() {
        console.log("Handling successful purchase...");
        
        // Show a success message
        alert("Thank you for your purchase! Your order will be delivered in 3–5 days.");
        
        // Clear cart and reset checkout form
        localStorage.removeItem("cart");
        checkoutForm.reset();
        
        // Reset the checkout table and total
        if (checkoutTable) checkoutTable.innerHTML = "";
        if (checkoutTotal) checkoutTotal.textContent = "0";

        // Optionally, redirect to a confirmation or order summary page
        // window.location.href = '/order-confirmation';
    }
});
