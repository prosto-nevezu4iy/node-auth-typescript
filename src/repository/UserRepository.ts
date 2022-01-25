import { EntityRepository, Not, Repository } from 'typeorm';
import { User } from '../entity/User';
import * as argon2 from 'argon2';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async isEmailTaken(email: string, excludeUserId?: number) {
    if (excludeUserId != undefined) {
      const user = await this.findOne({
        where: {
          email,
          id: Not(excludeUserId),
        },
      });
      return !!user;
    } else {
      const user = await this.findOne({ email });
      return !!user;
    }
  }
  async isPasswordMatch(user: User, password: string) {
    return argon2.verify(user.password, password);
  }

  async paginate(filter: any, options: any) {
    /**
     * @typedef {Object} QueryResult
     * @property {Document[]} results - Results found
     * @property {number} page - Current page
     * @property {number} limit - Maximum number of results per page
     * @property {number} totalPages - Total number of pages
     * @property {number} totalResults - Total number of documents
     */
    /**
     * Query for documents with pagination
     * @param {Object} [filter] - Mongo filter
     * @param {Object} [options] - Query options
     * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
     * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
     * @param {number} [options.limit] - Maximum number of results per page (default = 10)
     * @param {number} [options.page] - Current page (default = 1)
     * @returns {Promise<QueryResult>}
     */
    const sort = {};
    if (options.sortBy) {
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sort[`user.${key}`] = order.toUpperCase();
      });
    } else {
      sort['user.createdDate'] = 'ASC';
    }

    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = await this.count(filter);

    const docsPromise = this.createQueryBuilder('user').where(filter).orderBy(sort).skip(skip).take(limit);

    if (options.populate) {
      const populate = options.populate.split(',');

      docsPromise.leftJoinAndSelect('user.tokens', 'token').select(['user', ...populate]);
    }

    const resultPromise = await docsPromise.getMany();

    return Promise.all([countPromise, resultPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  }
}
