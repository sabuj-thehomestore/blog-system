export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, projection = null, options = {}) {
    return this.model.findById(id, projection, options);
  }

  async findOne(filter, projection = null, options = {}) {
    return this.model.findOne(filter, projection, options);
  }

  async find(filter = {}, projection = null, options = {}) {
    return this.model.find(filter, projection, options);
  }

  async findPaginated({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, populate = [], select = null }) {
    const numericPage = Math.max(1, parseInt(page, 10) || 1);
    const numericLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (numericPage - 1) * numericLimit;

    let query = this.model.find(filter).sort(sort).skip(skip).limit(numericLimit);

    if (select) {
      query = query.select(select);
    }

    if (populate.length > 0) {
      populate.forEach((p) => {
        query = query.populate(p);
      });
    }

    const [items, totalItems] = await Promise.all([
      query.lean(),
      this.model.countDocuments(filter)
    ]);

    return {
      items,
      totalItems,
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(totalItems / numericLimit) || 1
    };
  }

  async updateById(id, updateData, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, updateData, options);
  }

  async updateOne(filter, updateData, options = { new: true }) {
    return this.model.findOneAndUpdate(filter, updateData, options);
  }

  async softDelete(id) {
    return this.model.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
  }

  async restore(id) {
    return this.model.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}
