import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./lib/zod";
import { prisma } from "./lib/prisma";

// Function to salt and hash the password
const saltAndHashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          // Validate credentials using the signInSchema
          const { email, password, name } = await signInSchema.parseAsync(
            credentials
          );

          // Check if user exists
          let user = await prisma.user.findUnique({
            where: { email },
          });

          // If user exists, verify password
          if (user) {
            const isPasswordValid = await bcrypt.compare(
              password,
              user.password
            );
            if (!isPasswordValid) {
              throw new Error("Invalid credentials");
            }
          }
          // If user doesn't exist and name is provided, create a new user
          else if (name) {
            const hashedPassword = saltAndHashPassword(password);

            user = await prisma.user.create({
              data: {
                name,
                email,
                password: hashedPassword,
              },
            });
          } else {
            throw new Error("Invalid credentials");
          }

          // Return user without the password field
          const { password: userPassword, ...userWithoutPassword } = user;
          return userWithoutPassword;
        } catch (error) {
          throw new Error("Error during authentication: " + error.message);
        }
      },
    }),
  ],
});
