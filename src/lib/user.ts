export type AuthenticatedUser = {
    $case: "authenticated";
    email: string;
    name: string;
}

export type AnonymousUser = {
    $case: "anonymous";
}

export type User = AuthenticatedUser | AnonymousUser;