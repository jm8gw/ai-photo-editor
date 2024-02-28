// Server action for implementing transations with Stripe API
"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";
import { updateCredits } from "./user.actions";
import { handleError } from "../utils";

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
    // First, set up a Stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Get the amount that we are trying to charge
    const amount = Number(transaction.amount) * 100; // Convert the amount to cents

    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: "usd", // The currency we are using
                    product_data: {
                        name: transaction.plan, // The name of the plan
                    },
                    unit_amount: amount, // The amount we are trying to charge
                },
                quantity: 1, // We are only charging for one item
            }
        ],
        metadata: {
            plan: transaction.plan, // The plan we are trying to charge for
            credits: transaction.credits, // The amount of credits we are adding for that particular plan
            buyerId: transaction.buyerId, // So we know who to attribute the credits to
        },
        mode: "payment", // We are in payment mode
        success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`, // If the payment is successful, redirect to the profile page (where the user can see their credits)
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`, // If the payment is cancelled, redirect to home
    })

    redirect(session.url!); // Redirect
}

// We also want to create a new transaction in our database
// This will be more similar to our typical server actions
export async function createTransaction(transaction: CreateTransactionParams) {
    try {
        await connectToDatabase(); // Connect to the database

        // Create a new transaction with a buyerId
        const newTransaction = await Transaction.create({ // Taken from our transaction model
            ...transaction, buyer: transaction.buyerId
        });

        await updateCredits(transaction.buyerId, transaction.credits) // Coming from user.actions.ts

        return JSON.parse(JSON.stringify(newTransaction)); // Return the new transaction
    } catch (error) {
        handleError(error);
    }
}
// Next, we have to utilize Stripe webhooks so we know to call this function when a payment is successful