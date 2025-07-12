"use server";

import { signIn, signOut } from "@/auth";

export const handleLogin = async () => {
  await signIn("google");
};

export const handleLogout = async () => {
  await signOut({ redirect: true, redirectTo: "/" });
};
