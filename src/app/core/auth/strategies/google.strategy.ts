import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '../../config/config.service';
import { GoogleUserData } from '../../interfaces/user/user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.googleClientId,
      clientSecret: configService.googleClientSecret,
      callbackURL: configService.googleCallbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user: GoogleUserData = {
      email: emails[0].value,
      full_name: `${name.givenName} ${name.familyName}`,
      profile_picture: photos[0]?.value || null,
      google_id: id,
    };
    done(null, user);
  }
}
