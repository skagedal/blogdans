export type AuthenticatedUser = {
    $case: "authenticated";
    email: string;
    name: string;
    id: string | undefined;
    photo: string | undefined;
}

export type AnonymousUser = {
    $case: "anonymous";
}

export type User = AuthenticatedUser | AnonymousUser;