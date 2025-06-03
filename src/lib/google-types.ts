import z from "zod"

// This is the "profile" field in the signIn from Google
export const googleProfileSchema = z.object({
    id: z.string(),
    at_hash: z.string(),
    email: z.string().email(),
    email_verified: z.boolean(),
    family_name: z.string(),
    given_name: z.string(),
    name: z.string(),
    picture: z.string().url(),
})

// This is the "user" field
export const googleUserSchema = z.object({
    id: z.string()
})

export type GoogleProfile = z.infer<typeof googleProfileSchema>
export type GoogleUser = z.infer<typeof googleUserSchema>
