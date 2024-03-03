// These are server actions that will call Cloudinary's APIs, and will be used to upload, update, get, and delete images from Cloudinary. 

"use server"; // As this will be a file many different server actions involved with adding, updating, deleting and getting images.

import { revalidatePath } from "next/cache";
import { handleError } from "../utils";
import Image from "../database/models/image.model";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary"; // This is the official Cloudinary package for Node.js

// This is a function that will be used to populate the author of an image. It will be used in the getImageById function.
const populateUser = (query: any) => query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId username",
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

// GET ALL IMAGES
// Used to get all the images so we can display them in our collections component on the home page
// Note: this collects all the images from all the users, and not just the images from the user that's currently logged in. See getUserImages for that.
// This particular function is a bit more complex, as it will also include a search query, and pagination. 
export async function getAllImages({ limit = 9, page = 1, searchQuery = ''}: {
    limit?: number;
    page: number;
    searchQuery?: string;
}) { 
    try {
        await connectToDatabase(); // Connect to the database

        // We will have to config the Cloudinary instance to be able to pull the images from somewhere. This of course can be done with the cloudinary package.
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true, // Make sure we have a secure connection
        });

        // Side note: An impressive feature of Cloudinary is that it allows us to search for images based off of generated tags (and other metadata). So even if we search for a term that doesn't exist in a photo's title, the term might still be found in the tags associated with the photo, and the photo will still be found.
        // For example, a photo of a woman titled "Fitness Girl" will be returned if we search for "human" because the photo has the tag "human" associated with it by Cloudinary.

        // Set up the initial expression
        let expression = 'folder:pixel-perfect'; // This is the folder in our Cloudinary account where we store all of our images

        if(searchQuery) {
            expression += ` AND ${searchQuery}`; // If we have a search query, we want to include that in our expression, so we search only for specific images
        }

        const { resources } = await cloudinary.search
            .expression(expression)
            .execute();
            // Get all needed resources from Cloudinary
        
        // Need to get the resource ids, so we can also use get them from our database
        const resourceIds = resources.map((resource: any) => resource.public_id);

        // Form a new query to get all the images from our own database
        let query = {};
        
        if(searchQuery) { // Coming from the front end
            query = { // Modify the query to include only the ones we got back from Cloudinary 
                publicId: { $in: resourceIds }, // Go over the publicIds, and include all the resourceIds
            }
        }

        // Define pagination
        const skipAmount = (Number(page) - 1) * limit; // Calculate the amount of images we want to skip based off of the page number and the limit of cards per page

        // Fetch back the images
        const images = await populateUser(Image.find(query)) // Find the images by the query defined earlier, and populate them so that they also contain the data about the user that created them
            .sort({ updatedAt: -1 }) // So that the most recent ones are shown first
            .skip(skipAmount) // For the pagination
            .limit(limit); 

        // Define the number of total images
        const totalImages = await Image.find(query).countDocuments();
        // Get the total number of all images in general
        const savedImages = await Image.find().countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)), // Return the images
            totalPages: Math.ceil(totalImages / limit), // Return the total number of pages
            savedImages,
        }

    } catch (error) {
        handleError(error);
    }
}

// GET ALL IMAGES FOR (CURRENT) USER
// Used to get all the images from the user (based on userId param)
// This is similar to getAllImages, but we can pull directly from the database without the use of Cloudinary.
export async function getUserImages({ limit = 9, page = 1, userId }: {
    limit?: number;
    page: number;
    userId: string;
}) {
    try {
        await connectToDatabase(); // Connect to the database
    
        // Define pagination
        const skipAmount = (Number(page) - 1) * limit; // Calculate the amount of images we want to skip based off of the page number and the limit of cards per page

        // Fetch back the images
        const images = await populateUser(Image.find({ author: userId })) // Find the images by author/userId, and populate them so that they also contain the data about the user that created them
            .sort({ updatedAt: -1 }) // So that the most recent ones are shown first
            .skip(skipAmount) // For the pagination
            .limit(limit);
                
        // Define the number of total images
        const totalImages = await Image.find({ author: userId }).countDocuments();
    
        return {
            data: JSON.parse(JSON.stringify(images)), // Return the images
            totalPages: Math.ceil(totalImages / limit), // Return the total number of pages
            totalImages, // For the profile page counter
        };
    } catch (error) {
        handleError(error);
    }
  }