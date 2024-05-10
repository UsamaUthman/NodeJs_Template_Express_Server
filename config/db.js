import dotenv from "dotenv";

const connectDB = async () => {
  try {
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export { connectDB };
