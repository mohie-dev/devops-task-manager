export type JWTPayloadType = {
    sub: string,
    email: string,
}

export type AccessTokenType = {
    accessToken: string
}

export type GoogleProfileType = {
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    isEmailVerified: boolean;
};