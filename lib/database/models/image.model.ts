// This is a model for one of the image tranformations that we do

import { Document, Schema, model, models } from "mongoose";

// Because we are using TypeScript, we need to define the shape of the image object
export interface IImage extends Document {
    title: string;
    transformationType: string;
    publicId: string;
    secureURL: string; // This is a URL, but we are storing it as a string
    width?: number;
    height?: number;
    config?: object;
    transformationURL?: string; // This is a URL, but we are storing it as a string
    aspectRatio?: string;
    color?: string;
    prompt?: string;
    from?: string;
    replacement?: string;
    author?: {
        _id: string;
        firstName: string;
        lastName: string;
        username: string;
    }
    createdAt?: Date;
    updatedAt?: Date;
}

const ImageSchema = new Schema({
    title: {type: String, required: true},
    transformationType: {type: String, required: true},
    publicId: {type: String, required: true},
    secureURL: {type: String, required: true}, // This is a URL, but we are storing it as a string because "URL" is not a valid type in mongoose
    // Other Properties of the Image
    width: {type: Number},
    height: {type: Number},
    config: {type: Object},
    transformationURL: {type: String}, // This is a URL, but we are storing it as a string because "URL" is not a valid type in mongoose
    aspectRatio: {type: String},
    color: {type: String},
    prompt: {type: String},
    from: {type: String},
    replacement: {type: String},
    author: {type: Schema.Types.ObjectId, ref: "User"},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

const Image = models?.Image || model("Image", ImageSchema); // If the model already exists, use it. Otherwise, create a new one based off the image schema.

export default Image; // Export the model
// This is basically a constructor for future documents belonging to this schema.