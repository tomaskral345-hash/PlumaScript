const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Metoda není povolena' };
  }

  try {
    const { planId } = JSON.parse(event.body);

    // Zde určíš Price ID podle toho, na jaký plán uživatel klikl
    // Zde musíš nahradit "price_..." svými skutečnými ID ze Stripe pro 99Kč a 199Kč!
    let stripePriceId = '';
    if (planId === 'basic') {
      stripePriceId = 'price_1TQXLkJgsDD0uoUZ2ivFsXPq'; 
    } else if (planId === 'pro') {
      stripePriceId = 'price_1TQXNaJgsDD0uoUZUJzYseGv';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // nebo 'subscription', pokud prodáváš měsíční předplatné a ne jednorázový nákup
      // process.env.URL je adresa tvého Netlify webu
      success_url: `${process.env.URL}/index.html?success=true`,
      cancel_url: `${process.env.URL}/index.html?canceled=true`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error("Chyba na serveru:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};