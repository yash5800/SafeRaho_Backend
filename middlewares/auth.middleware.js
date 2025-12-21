import jwt from 'jsonwebtoken';
import 'dotenv/config'

// Middleware to verify access token from Authorization header
export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('Authorization Header:', authHeader);

  // Check for Bearer token example: 'Bearer <token>'
  if(!authHeader || !authHeader.startsWith('Bearer ')){
    return res.status(401).send({
      message: 'Access token missing or malformed',
      status: 401
    });
  }

  const token = authHeader.split(' ')[1]; // Extract token part

  // Verify token and extract payload
  try{
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 

    if(payload.type !== 'access'){
      return res.status(401).send({
        message:  'Invalid token type',
        status: 401
      });
    }

    req.user = {
      accountUUID: payload.sub,
      accountName: payload.username
    };

    // Proceed to next middleware or route handler
    next();
  }
  catch(error){
    if(error.name === 'TokenExpiredError'){
      return res.status(401).send({
        message: 'Access token expired',
        status: 401,
        error: 'TOKEN_EXPIRED'
      });
    }
    else{
      return res.status(401).send({
        message: 'Invalid access token',
        status: 401,
        error: 'INVALID_TOKEN'
      })
    }
  }
}