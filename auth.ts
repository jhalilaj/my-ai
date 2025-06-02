import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google"; 
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  events: {
    async signIn({ user }) {
      await connectDB();

      const existingUser = await User.findOne({ email: user.email }); 

      if (!existingUser) {
        try {
          const newUser = new User({
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.image,
          });

          await newUser.save();
          console.log("New user saved:", newUser);
        } catch (error) {
          console.error("Error saving user:", error);
        }
      } else {
        console.log("User already exists:", existingUser);
      }
    },
  },
});
