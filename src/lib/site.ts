export function getSite() {
    return {
        name: "skagedal.tech",
        url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://skagedal.tech",
        description: "Thoughts on software development, technology and the future.",
    }
}