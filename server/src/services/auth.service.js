import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, ROLES, AUTH_PROVIDERS } from '../constants/index.js';

export class AuthService {
  async register({ name, email, password, role = ROLES.USER }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'An account with this email already exists');
    }

    const user = await userRepository.create({
      name,
      email,
      password,
      role: role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER,
      provider: AUTH_PROVIDERS.LOCAL
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token in database
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await userRepository.updateRefreshToken(user._id, hashedRefreshToken);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      provider: user.provider
    };

    return { user: safeUser, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account has been deactivated. Please contact an admin.');
    }

    if (user.provider !== AUTH_PROVIDERS.LOCAL && !user.password) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Please log in using your ${user.provider} account`
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await userRepository.updateRefreshToken(user._id, hashedRefreshToken);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      provider: user.provider
    };

    return { user: safeUser, accessToken, refreshToken };
  }

  async refreshToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token is required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (err) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
    }

    const user = await userRepository.findByEmail(
      (await userRepository.findById(decoded.id))?.email || '',
      true
    );

    if (!user || !user.refreshToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Session has expired or was revoked. Please log in again.');
    }

    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account has been deactivated');
    }

    const isTokenValid = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token token verification failed');
    }

    // Rotate refresh token
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, salt);
    await userRepository.updateRefreshToken(user._id, hashedRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async logout(userId) {
    if (userId) {
      await userRepository.clearRefreshToken(userId);
    }
    return true;
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId, '-password -refreshToken');
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return user;
  }

  async handleOAuthUser({ provider, providerId, email, name, avatar }) {
    let user = await userRepository.findOne({
      $or: [{ provider, providerId }, { email: email?.toLowerCase() }]
    });

    if (!user) {
      user = await userRepository.create({
        name,
        email: email?.toLowerCase() || `${provider}_${providerId}@oauth.user`,
        provider,
        providerId,
        avatar: avatar || '',
        role: ROLES.USER
      });
    } else {
      if (!user.providerId) {
        user.provider = provider;
        user.providerId = providerId;
        if (avatar && !user.avatar) user.avatar = avatar;
        await user.save();
      }
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await userRepository.updateRefreshToken(user._id, hashedRefreshToken);

    return { user, accessToken, refreshToken };
  }
}

export const authService = new AuthService();
