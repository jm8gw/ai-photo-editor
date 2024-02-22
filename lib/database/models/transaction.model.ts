// Used as an additional reference between the user and the image creation, because we need to keep track of the credits.
// Each transation is essentialy a stripe conversion to turn credits into images.
// Important fields: stripeId, createdAt, amount, plan, credits, buyer

import { Document, Schema, model, models } from 'mongoose';

const TransactionSchema = new Schema({
    stripeId: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    plan: {
        type: String,
        // required: true, // Payment plans are not required
    },
    credits: {
        type: Number,
        // required: true, // Credits are not required
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

const Transaction = models?.Transaction || model('Transaction', TransactionSchema);

export default Transaction;