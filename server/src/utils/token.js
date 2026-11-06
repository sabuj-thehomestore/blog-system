import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET || 'access_secret_default_key_123',
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id
    },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_default_key_456',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret_default_key_123');
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret_default_key_456');
};
