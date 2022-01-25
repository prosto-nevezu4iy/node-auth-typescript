import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import tokenTypes from './tokens';
import { User } from '../entity/User';
import config from './config';
import { getRepository } from 'typeorm';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret,
};

const jwtVerify = async (payload: any, done: any) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await getRepository(User).findOne(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(opts, jwtVerify);

export default jwtStrategy;
