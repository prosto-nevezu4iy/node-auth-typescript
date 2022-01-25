import httpStatus from 'http-status';
import { getCustomRepository, getRepository } from 'typeorm';
import { User } from '../entity/User';
import { ApiError } from '../utils/ApiError';
import { UserRepository } from '../repository/UserRepository';

/**
 * Create a user
 * @param {User} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody: User) => {
  const userRepository = getCustomRepository(UserRepository);
  if (await userRepository.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  let user = userRepository.create(userBody);
  user = await userRepository.save(user);
  delete user.password;
  return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter: any, options: any) => {
  const users = await getCustomRepository(UserRepository).paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id: number) => {
  return await getRepository(User).findOne(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email: string) => {
  return await getRepository(User).findOne({ email });
};

/**
 * Update user by id
 * @param {number} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId: number, updateBody: any) => {
  const user = await getUserById(userId);
  const userRepository = getCustomRepository(UserRepository);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await userRepository.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await userRepository.save(user);
  return user;
};

/**
 * Delete user by id
 * @param {number} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId: number) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await getRepository(User).remove(user);
};

export default {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserById,
  queryUsers,
  deleteUserById,
};
