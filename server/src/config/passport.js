import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { authService } from '../services/auth.service.js';
import { AUTH_PROVIDERS } from '../constants/index.js';

export const configurePassport = () => {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Google User';
            const avatar = profile.photos?.[0]?.value || '';

            const result = await authService.handleOAuthUser({
              provider: AUTH_PROVIDERS.GOOGLE,
              providerId: profile.id,
              email,
              name,
              avatar
            });

            return done(null, result);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/v1/auth/facebook/callback',
          profileFields: ['id', 'displayName', 'photos', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || `fb_${profile.id}@facebook.user`;
            const name = profile.displayName || 'Facebook User';
            const avatar = profile.photos?.[0]?.value || '';

            const result = await authService.handleOAuthUser({
              provider: AUTH_PROVIDERS.FACEBOOK,
              providerId: profile.id,
              email,
              name,
              avatar
            });

            return done(null, result);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }
};
