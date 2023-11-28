/* eslint-disable */
document.addEventListener('DOMContentLoaded', function () {
  var stripe = Stripe(''); // Replace with your actual publishable key
  var elements = stripe.elements();

  // Create an instance of the card Element.
  var card = elements.create('card');

  // Add an instance of the card Element into the `card-element` div.
  card.mount('#card-element');

  // Handle real-time validation errors from the card Element.
  card.addEventListener('change', function (event) {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });

  // Handle form submission.
  var form = document.getElementById('payment-form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Create a PaymentIntent on the server and confirm the payment
    fetch('/api/bookings/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_method_types: ['card'],
        booking_id: 1, //hardcoded on front end but data can be fetched and passed here
        amount: 1000, //hardcoded on front end but data can be fetched and passed here
        currency: 'inr',
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return stripe.confirmCardPayment(data.data.client_secret, {
          payment_method: {
            card: card,
          },
        });
      })
      .then(function (result) {
        if (result.error) {
          // Show error to your customer
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          // Payment succeeded, redirect or perform other actions
          console.log(result.paymentIntent);
          var successElem = document.getElementById('card-success');
          successElem.textContent = 'Booking completed';
        }
      });
  });
});
