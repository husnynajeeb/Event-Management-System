import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>("GOOGLE_CLIENT_ID")!,
      clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET")!,
      // ✅ FIX: Must point to the backend callback route, not the frontend.
      // Was: "http://localhost:3000/auth/google/callback" (frontend — broken)
      callbackURL: configService.get<string>(
  "GOOGLE_CALLBACK_URL",
  "http://localhost:3001/auth/google/callback",  // goes through gateway
),
      scope: ["email", "profile"],
      passReqToCallback: false,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };

    done(null, user);
  }
}