import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const { email, password } = credentials as { email: string; password: string };
        const user = await User.findOne({ email });

        if (!user) throw new Error("No user found with this email.");
        if (!user.password) {
          throw new Error("This email is already registered using Google or GitHub. Please use social login.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Incorrect password.");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar_url,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      const existingUser = await User.findOne({ email: user.email });
      if (account?.provider !== "credentials" && existingUser?.password) {
        console.warn(`❌ OAuth blocked: user ${user.email} registered with password.`);
        throw new Error("This email is already registered with a password. Please use email/password to log in.");
      }
      return true;
    },
  },

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
            createdAt: new Date(),
          });
          await newUser.save();
          console.log("✅ New OAuth user saved:", newUser);
        } catch (error) {
          console.error("❌ OAuth user creation failed:", error);
        }
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
