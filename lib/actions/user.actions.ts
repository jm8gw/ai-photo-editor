"use server"; // This will mark all the export functions from this file as server actions

// Server Actions are asynchronous functions that are executed on the server. 
// They can be used in Server and Client Components to handle form submissions and data mutations in Next.js applications.
// Can be used for get requests too.
// Simpler alternative to api routes.

// Taken from the example project:
import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase(); // Since we are using a serverless architecture, we have to call the function we created in mongoose.ts -- the one that caches the connection to the database
    // And, we have to call it on every single call, since the connection to the database does not persist in a serverless environment. We have to make another request every time we want to get or do something with the database (in this case, that would be making a user).

    const newUser = await User.create(user); // Await a call to the user model, and create a new user with the user object data we passed in (stuff like the clerkId, email, username, photo, etc.)

    return JSON.parse(JSON.stringify(newUser)); // Return the new user as a JSON object so it's easier to work with
  } catch (error) {
    handleError(error);
  }
}
// Wait, why do we need to create a database user if clerk is already doing that for us?
// We have to have acess to the user and the user's data in our database as well, so we can use it in our application. We need to know if that user created any images, and make references from the user to those images, and so on. This all means we need to sync the user's data from Clerk to our database. 
// We will do that by utilizing the concept known as webhooks. When something happens (an event), webhooks allows an event triggered by one application to be sent to another application. 
//// In our case, Clerk will trigger an event once a user signs up with a new Clerk account. 
//// Then, it will make a request with a payload containing all of that clerk user data (like the username, first name, last name, hashed password, etc.).
//// Finally, it will send that data over to event processing, directly to our database. We can then create a new user in our database with that data, syncing users up.

// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId }); // Find a user by their clerkId. 
    // BTW These functions (create, findOne, etc.) are all provided by Mongoose, which is a library that makes it easier to work with MongoDB (a NoSQL database). 

    if (!user) throw new Error("User not found"); // If the user doesn't exist, throw an error

    return JSON.parse(JSON.stringify(user)); // Otherwise, return the data
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    }); // Find the user by their clerkId, and update their data with the new user object we passed in.

    if (!updatedUser) throw new Error("User update failed");
    
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId }); // Find the user by their clerkId

    if (!userToDelete) {
      throw new Error("User not found");
    } // If the user doesn't exist, throw an error

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id); // Otherswise, delete the user by their _id
    revalidatePath("/"); // Send it back to the home page

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

