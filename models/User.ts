import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // GitHub user ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  createdAt: { type: Date, default: Date.now },
}, { collection: "users" });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
