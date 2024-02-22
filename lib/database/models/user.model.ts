// Needs to include clerkId, email, username, photo, firstName, lastName, planId, creditBalance

import { Document, Schema, model, models } from "mongoose";

/* Apparently, we don't need to define the interface for the user model.
// We CAN do it, and it's probably better practice, but it's not necessary.
// Keep it simple for now.
export interface IUser extends Document {
    clerkId: string;
    email: string;
    username: string;
    photo: string;
    firstName: string;
    lastName: string;
    planId: string;
    creditBalance: number;
    createdAt?: Date;
    updatedAt?: Date;
}
*/

const UserSchema = new Schema({
    clerkId: {
        type: String, 
        required: true,
        unique: true, // This is a unique identifier for the user
    },
    email: {
        type: String, 
        required: true,
        unique: true, // This is a unique identifier for the user
    },
    username: {
        type: String, 
        required: true,
        unique: true, // This is a unique identifier for the user
    },
    photo: {
        type: String, 
        required: true
    },
    firstName: {
        type: String, 
        //required: true // We don't actually need to require the full name
    },
    lastName: {
        type: String, 
        //required: true
    },
    planId: {
        type: String, 
        //required: true // We don't need to require a purchased plan
        default: 1 // Default to the free plan
    },
    creditBalance: {
        type: Number, 
        //required: true // Again, not required. Visters don't need to use the credit system at all
        default: 10 // Default to 10 credits, as a freebee
    },
    /* Don't need to know when the user was created or updated, unlike images
    createdAt: {
        type: Date, 
        default: Date.now
    },
    updatedAt: {
        type: Date, 
        default: Date.now
    },
    */
});

const User = models?.User || model("User", UserSchema);

export default User;