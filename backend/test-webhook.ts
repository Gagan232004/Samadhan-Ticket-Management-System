async function run() {
  const payload = {
    subject: 'Refund request for my subscription',
    body: 'I forgot to cancel and I want my money back.',
    customerName: 'Alice Smith',
    customerEmail: 'alice@example.com',
    category: 'Refund Request'
  };

  const response = await fetch('http://localhost:5000/api/webhooks/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': 'my-super-secret-token'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', data);
}

run().catch(console.error);
