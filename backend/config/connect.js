const mongoose = require("mongoose");
const User = require("../models/users");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "hostelMess"
    });
    try {
      const indexes = await User.collection.indexes();
      const emailIndexExists = indexes.some(index => index.name === 'email_1');

      if (emailIndexExists) {
        await User.collection.dropIndex('email_1');
      }

      await User.syncIndexes();
    } catch (indexError) {
      console.log(indexError.message);
    }

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;