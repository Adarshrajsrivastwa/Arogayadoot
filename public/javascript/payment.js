
document.getElementById('rzp-button1').onclick = function(e) {
  axios.post('/create/orderId')
    .then(function (response) {
      var options = {
        "key": "<%= process.env.RAZORPAY_KEY_ID %>",
        "amount": response.data.amount,
        "currency": response.data.currency,
        "name": "TECHNOCRATS",
        "description": "Transaction",
        "image": "https://i.pinimg.com/236x/2a/b2/aa/2ab2aa6a99c6589636ff051f46c14ea3.jpg",
        "order_id": response.data.id,
        "handler": function(response) {
          axios.post('/api/payment/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          })
          .then(function (response) {
            alert('Payment verified successfully');
          })
          .catch(function (error) {
            console.error(error);
          });
        },
        "prefill": {
          "name": "Adarsh Raj",
          "email": "srivastwaadarsh@gmail.com",
          "contact": "6205840092"
        },
        "notes": {
          "address": "Razorpay Corporate Office"
        },
        "theme": {
          "color": "#000099"
        }
      };
      var rzp1 = new Razorpay(options);
      rzp1.on('payment.failed', function(response) {
        alert('Payment Failed');
      });
      rzp1.open();
      e.preventDefault();
    })
    .catch(function (error) {
      console.error(error);
    });
};