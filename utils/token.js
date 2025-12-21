import jwt from 'jsonwebtoken';
import 'dotenv/config'

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

export const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.accountUUID,
      username: user.accountName, 
      type: 'access'
    },
    process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: ACCESS_TOKEN_TTL } 
  )
}

export const signRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user.accountUUID,
      type: 'refresh'
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  )
}