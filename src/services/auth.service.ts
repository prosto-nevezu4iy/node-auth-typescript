import httpStatus from 'http-status';
import { getCustomRepository, getRepository } from 'typeorm';
import { userService, tokenService } from './index';
import { ApiError } from '../utils/ApiError';
import { Token, TokenType } from '../entity/Token';
import tokenTypes from '../config/tokens';
import { UserRepository } from '../repository/UserRepository';
/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email: string, password: string) => {
  const userRepository = getCustomRepository(UserRepository);
  const user = await userRepository.findOne({
    where: { email: email },
    select: ['id', 'name', 'email', 'password', 'role', 'isEmailVerified', 'createdDate', 'updatedDate'],
  });

  if (!user || !(await userRepository.isPasswordMatch(user, password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  delete user.password;

  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken: string) => {
  const tokenRepository = getRepository(Token);
  const refreshTokenDoc = await tokenRepository.findOne({
    where: {
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blackListed: false,
    },
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await tokenRepository.remove(refreshTokenDoc);
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user.id);
    if (!user) {
      throw new Error();
    }

    await getRepository(Token).remove(refreshTokenDoc);
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken: string, newPassword: string) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user.id);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    const tokenRepository = getRepository(Token);
    await tokenRepository.delete({ user, type: TokenType.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken: string) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user.id);
    if (!user) {
      throw new Error();
    }
    await getRepository(Token).delete({ user: user, type: TokenType.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
