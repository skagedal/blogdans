import z from "zod"

// This is the "profile" field in the signIn from Google
//    https://developers.google.com/identity/openid-connect/openid-connect#obtaininguserprofileinformation
//    https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
export const googleProfileSchema = z.object({
    sub: z.string(),
    at_hash: z.string(),
    email: z.string().email(),
    email_verified: z.boolean(),
    family_name: z.string(),
    given_name: z.string(),
    name: z.string(),
    picture: z.string().url(),
})

export type OpenIdProfile = z.infer<typeof googleProfileSchema>
