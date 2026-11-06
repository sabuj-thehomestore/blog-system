import { BaseRepository } from './base.repository.js';
import { User } from '../models/User.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, includePassword = false) {
    let query = this.model.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query = query.select('+password +refreshToken');
    }
    return query;
  }

  async findByProviderId(provider, providerId) {
    return this.model.findOne({ provider, providerId });
  }

  async updateRefreshToken(userId, refreshToken) {
    return this.model.findByIdAndUpdate(userId, { refreshToken }, { new: true });
  }

  async clearRefreshToken(userId) {
    return this.model.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
  }

  async updateUserRole(userId, role) {
    return this.model.findByIdAndUpdate(userId, { role }, { new: true });
  }

  async updateUserStatus(userId, isActive) {
    return this.model.findByIdAndUpdate(userId, { isActive }, { new: true });
  }
}

export const userRepository = new UserRepository();
