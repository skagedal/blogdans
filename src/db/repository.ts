

import z from "zod"

// This is the "profile" field in the signIn from Google
const profileSchema = z.object({
    at_hash: z.string(),
    email: z.string().email(),
    email_verified: z.boolean(),
    family_name: z.string(),
    given_name: z.string(),
    name: z.string(),
    picture: z.string().url(),
})

// This is the "user" field
const userSchema = z.object({
    id: z.string()
})

interface DB {
    createUser(): Promise<void>;
}

