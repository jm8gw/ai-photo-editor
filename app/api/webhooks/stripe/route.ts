// Template provided by the example project, which is a modified version of stripe's example.

/* eslint-disable camelcase */
import { createTransaction } from "@/lib/actions/transaction.action";
import { NextResponse } from "next/server";
import stripe from "stripe";

export async function POST(request: Request) { // Here, we have a post request that will be sent to the server. We are allowing this endpoint to be pinged by a webhook from Stripe.
  const body = await request.text(); // Once it's pinged, we access the body of the request.

  const sig = request.headers.get("stripe-signature") as string; // Process signature to ensure it's legit
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event; // Specify the event and construct it in a try catch block

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ message: "Webhook error", error: err });
  }

  // Get the event type
  const eventType = event.type;

  // CREATE
  if (eventType === "checkout.session.completed") { // If it is the *correct* event type, we can proceed with the transaction
    const { id, amount_total, metadata } = event.data.object; // Destructure the data from the transaction

    const transaction = { // Re-form it in a way that suites our createTransaction function
      stripeId: id,
      amount: amount_total ? amount_total / 100 : 0,
      plan: metadata?.plan || "",
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata?.buyerId || "",
      createdAt: new Date(),
    };

    const newTransaction = await createTransaction(transaction); // Call the createTransaction function from our transaction server action file
    
    return NextResponse.json({ message: "OK", transaction: newTransaction }); // Simply return it
  }

  return new Response("", { status: 200 });
}
// Now all we need is a page where we can purchase...