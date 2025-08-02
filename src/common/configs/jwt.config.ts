import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessTokenSecret: process.env.AT_SECRET || 'access-secret',
  refreshTokenSecret: process.env.RT_SECRET || 'refresh-secret',
  accessTokenExpiration: process.env.AT_EXPIRATION || '15m',
  refreshTokenExpiration: process.env.RT_EXPIRATION || '7d',
}));

console.log(process.env.AT_SECRET);