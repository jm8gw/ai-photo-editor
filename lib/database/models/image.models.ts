// This is a model for one of the image tranformations that we do

import { Document, Schema, model, models } from "mongoose";

// Because we are using TypeScript, we need to define the shape of the image object
export interface IImage extends Document {
    title: string;
    transformationType: string;
    publicId: string;
    secureUrl: string; // This is a URL, but we are storing it as a string
    width?: number;
    height?: number;
    config?: object;
    transformationUrl?: string; // This is a URL, but we are storing it as a string
    aspectRatio?: string;
    color?: string;
    prompt?: string;
    author?: {
        _id: string;
        firstName: string;
        lastName: string;
    }
    createdAt?: Date;
    updatedAt?: Date;
}

const ImageSchema = new Schema({
    title: {type: String, required: true},
    transformationType: {type: String, required: true},
    pubicId: {type: String, required: true},
    secureUrl: {type: URL, required: true},
    // Other Properties of the Image
    width: {type: Number},
    height: {type: Number},
    config: {type: Object},
    transformationUrl: {type: URL}, 
    aspectRatio: {type: String},
    color: {type: String},
    prompt: {type: String},
    author: {type: Schema.Types.ObjectId, ref: "User"},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

const Image = models?.Image || model("Image", ImageSchema); // If the model already exists, use it. Otherwise, create a new one based off the image schema.

export default Image; // Export the model
// This is basically a constructor for future documents belonging to this schema.