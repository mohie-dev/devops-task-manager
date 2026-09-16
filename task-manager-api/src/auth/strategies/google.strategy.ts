import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { OAuth2Client } from 'google-auth-library';

import { GoogleProfileType } from 'utils/type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
    Strategy,
    'google',
) {
    private readonly googleClient: OAuth2Client;

    constructor(
        configService: ConfigService
    ) {
        const clientId = configService.getOrThrow<string>(
            'GOOGLE_CLIENT_ID',
        );

        const clientSecret = configService.getOrThrow<string>(
            'GOOGLE_CLIENT_SECRET',
        );

        const callbackURL = configService.getOrThrow<string>(
            'GOOGLE_CALLBACK_URL',
        );

        super({
            clientID: clientId,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile'],
        });

        this.googleClient = new OAuth2Client(
            clientId,
            clientSecret,
        );
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    ): Promise<GoogleProfileType> {
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName;
        const lastName = profile.name?.familyName;

        if (!email || !firstName || !lastName) {
            throw new UnauthorizedException(
                'Google account information is incomplete',
            );
        }

        return {
            providerId: profile.id,
            email,
            firstName,
            lastName,
            avatar: profile.photos?.[0]?.value ?? null,
            isEmailVerified: true,
        };
    }
}