import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection { // So we know how the connection will look like
    conn: Mongoose | null; // Connection type
    promise: Promise<Mongoose> | null;
}

// Implement caching
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}


// So, every time we try to connect to our database...
export const connectToDatabase = async () => {
    if (cached.conn) { // First, we check if we already have a cached connection
        return cached.conn; // Exit early if we do
    } // This is the main optimization we are making. It prevents too many connections to the database. The serverless nature of NEXT.js requires us to be very careful with our connections. This is a different design to say, a traditional Express server, where we can just connect to the database once and forget about it.

    if (!MONGODB_URL) throw new Error("Please define the MONGODB_URL environment variable inside .env.local");

    cached.promise = 
        cached.promise || 
        mongoose.connect(MONGODB_URL, { // If we don't already have a cached connection, we make a new one to MongoDB here
            dbName: 'PixelPerfect', 
            bufferCommands: false 
        })

    cached.conn = await cached.promise;

    return cached.conn;
}