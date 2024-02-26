// These are server actions that will call Cloudinary's APIs, and will be used to upload, update, get, and delete images from Cloudinary. 

"use server"; // As this will be a file many different server actions involved with adding, updating, deleting and getting images.

import { revalidatePath } from "next/cache";
import { handleError } from "../utils";
import Image from "../database/models/image.models";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { redirect } from "next/navigation";

// This is a function that will be used to populate the author of an image. It will be used in the getImageById function.
const populateUser = (query: any) => query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName",
}); 


// ADD IMAGE
// Used to add the image to our database
export async function addImage({ image, userId, path }: AddImageParams) {
    try {
        await connectToDatabase(); // Connect to the database

        // Have to connect a specific image to the outhor that created it
        const author = await User.findById(userId); // Find the user by their _id (using the user model we defined earlier)

        if (!author) throw new Error("User not found"); // If the author doesn't exist, throw an error

        // Create a new image from the models we defined earlier
        const newImage = await Image.create({ 
            ...image,
            author: author._id,
        })

        revalidatePath(path); // Comes from next/cache.ts. This allows us to actually show the new image on the site after it's been created, instead of just keeping what was cached before.

        return JSON.parse(JSON.stringify(newImage)); // Return the newly created image that we just added to the database
    } catch (error) {
        handleError(error);
    }
}

// DELETE IMAGE
// Used to delete the image from our database
export async function deleteImage(imageId: string) { // This one only needs the imageId to delete it
    try {
        await connectToDatabase(); // Connect to the database

        await Image.findByIdAndDelete(imageId); // Find the image by its _id and delete it

        // No need to do anything else, execpt for redirecting when done
    } catch (error) {
        handleError(error);
    } finally {
        redirect("/"); // Redirect to the home page after the image has been deleted
    }
}

// UPDATE IMAGE
// Used to update the image in our database
export async function updateImage({ image, userId, path }: UpdateImageParams) {
    try {
        await connectToDatabase(); // Connect to the database

        // Find the image we want to update
        const imageToUpdate = await Image.findById(image._id);

        // Check if it exists, and if the user has permission to update it
        if (!imageToUpdate) { 
            throw new Error("Image not found"); // If the image doesn't exist, throw an error
        } else if (imageToUpdate.author.toHexString() !== userId) {
            throw new Error("User not authorized to update image"); // If the user doesn't have permission to update the image (i.e. isn't the image author), throw an error
        }

        const updatedImage = await Image.findByIdAndUpdate(
            imageToUpdate._id, // Find the image by its _id
            image, // Update the image with the new image object we passed in
            { new: true } // So we get a new instance of that document
        )

        revalidatePath(path); // Comes from next/cache.ts. This allows us to actually show the new image on the site after it's been created, instead of just keeping what was cached before.

        return JSON.parse(JSON.stringify(updateImage)); // Return the updated image
    } catch (error) {
        handleError(error);
    }
}

// GET IMAGE
// Used to get the image from our database
export async function getImageById(imageId: string) { // This one only needs the imageId to retrieve the image
    try {
        await connectToDatabase(); // Connect to the database

        // We want to get both the data about the image, and the data about the author of that image. We can do that with our own created popularUser function.
        const image = await populateUser(Image.findById(imageId)); // Find the image by its _id, get what user created it, and populate the image so that it now also contains the data about the user that created it.

        if (!image) throw new Error("Image not found"); // If the image doesn't exist, throw an error

        // No need to revalidate obv

        return JSON.parse(JSON.stringify(image));
    } catch (error) {
        handleError(error);
    }
}