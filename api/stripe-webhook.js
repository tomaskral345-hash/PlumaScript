const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Inicializace Firebase Admin (aby mohl měnit kredity i bez svolení uživatele)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}
const db = admin.firestore();

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    // 1. Ověření, že zpráva skutečně přišla od Stripe a nikdo si na něj jen nehraje
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // 2. Reagujeme pouze na úspěšnou platbu
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    
    // Získáme ID uživatele, které jsme si tam schovali při vytváření platby
    const userId = session.client_reference_id;
    
    // Zjistíme, co si koupil (podle Price ID ze Stripe)
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0].price.id;

    let creditsToAdd = 0;
    let newPlan = "free";

    // Tady nastavíme, kolik co dává kreditů
    // (Tyto price_... ID doplníme zítra, až je vytvoříte s tátou)
    if (priceId === 'price_ZAKLADNI_ID') {
      creditsToAdd = 50;
      newPlan = "basic";
    } else if (priceId === 'price_PRO_ID') {
      creditsToAdd = 500;
      newPlan = "pro";
    }

    // 3. ZÁPIS DO DATABÁZE (Tady se děje ta magie!)
    const userRef = db.collection('users').doc(userId);
    
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(creditsToAdd),
      plan: newPlan
    });

    console.log(`Uživateli ${userId} bylo úspěšně připsáno ${creditsToAdd} kreditů.`);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};