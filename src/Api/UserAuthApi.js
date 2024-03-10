import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { UserAuth } from '../context/AuthContext';
dotenv.config();

const host = process.env.DB_HOST;
const dbuser = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const { user } = UserAuth(); 

async function connectToDatabase() { // Function name change for clarity
  try {
    const connection = await mysql.createConnection({
      host,
      dbuser, 
      password, 
      database
    });
    return connection;
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error; // Rethrow to allow handling at a higher level
  }
}

async function storeDataToDB(connection, user) {
  try {
    const query = "INSERT INTO users (uid, authprovider, name, email, image) VALUES (?, ?, ?, ?, ?)"; 
    const values = [user.uid, user.providerId, user.displayName, user.email, user.photoURL];
    await connection.query(query, values);

    // Assuming you have a function to handle responses
    return handleSuccessResponse('User stored successfully'); 
  } catch (error) {
    console.error("Error storing user in SQL:", error);
    return handleErrorResponse('Failed to store user'); 
  }
}

// Usage Example:
(async () => {
  try {
    const connection = await connectToDatabase();
    const storeResult = await storeDataToDB(connection, user);

    // Handle storeResult which would contain success or error response
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle the overall error 
  } finally {
    // Consider closing the connection if that fits your usage pattern
  }
})(); 