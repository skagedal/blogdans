"use server";

import { signIn } from "@/auth";

export const handleLogin = async () => {
  await signIn("google");
};
