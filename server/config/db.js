const mongoose = require('mongoose');

/**
 * Connect to MongoDB using MONGODB_URI from environment.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Allow booting without a DB during initial scaffolding.
    console.warn('[db] MONGODB_URI not set; skipping MongoDB connection.');
    return;
  }

  mongoose.set('strictQuery', false);

  // `useNewUrlParser` / `useUnifiedTopology` are no longer needed in modern mongoose.
  await mongoose.connect(uri);
  console.log('[db] MongoDB connected');
}

module.exports = { connectDB };

