import { addUser , CheckUserBy, getUserBy } from "./services/account.services.js";
import express from "express";
import { v4 as uuidv4 } from 'uuid';
import { createAuthenticator, verifyAuthenticator } from "./utils/aunthenticator.js";
import cors from "cors";
import { hashPassword } from "./utils/passwordHash.js";
import { signAccessToken, signRefreshToken } from "./utils/token.js";
import { verifyAccessToken } from "./middlewares/auth.middleware.js";
import jwt from 'jsonwebtoken';
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 3002;

app.use(cors({
  origin: '*'
}));
app.use(express.json());

const receive_demo = {
  "accountType": "user",
  "accountName": "John Doe",
  "email": "",
  "passwordHashed": "hashed_password_example_1234567890abcdef",
}
// {
//   _type:'accounts',
//   accountName: details.accountName,
//   email: details.email,
//   accountUUID: details.accountUUID,
//   accountType: details.accountType,
//   passwordHashed: details.passwordHashed,
//   lastLogin: details.lastLogin,
//   twoFactorSecrets: details.twoFactorSecrets
// }

app.post("/api/signup", async (req,res) => {
  const raw_details = req.body;

  console.log('Received signup request with details:', raw_details);

  const user_name_exists = await getUserBy({type: 'user', payload: raw_details.accountName});
  const user_email_exists = await getUserBy({type: 'email', payload: raw_details.email});

  if(user_name_exists.status === 200 && user_name_exists.data){
    console.log('User already exists with username:', raw_details.accountName);
    return res.status(409).send({
      message: 'User already exists with this username.',
      status: 409
    });
  }
  else if(user_email_exists.status === 200 && user_email_exists.data){
    console.log('User already exists with email:', raw_details.email);
    return res.status(409).send({
      message: 'User already exists with this email.',
      status: 409
    });
  }

  try{
    const passwordHashed = await hashPassword(raw_details.password);

    const user_details = {
      accountType: raw_details.accountType,
      accountName: raw_details.accountName,
      email: raw_details.email,
      passwordHashed,
      accountUUID: uuidv4(),
      lastLogin: new Date().toISOString(),
      twoFactorSecrets: '',
      twoFactorEnable: false,
    };

    const data = await createAuthenticator(user_details);

    console.log('Data from createAuthenticator:', data);

    if(data.status !== 201){
      return res.status(data.status).send(data);
    }

    const result = await addUser(data.user_details);

    console.log('Result from addUser:', result);

    if(result.status !== 201){
      return res.status(result.status).send(result);
    }

    res.status(result.status).send({data: result.data, otpauthURL: data.otpauth_url});

    }
  catch(err){

    if(err.message === 'Error hashing password'){
      console.error('Password hashing failed:', err.message);
      return res.status(500).send({
        message: 'Password hashing failed. User not created.',
        status: 500
      });
    }

    console.error('Signup failed:', err.message);
    return res.status(500).send({
      message: 'Signup failed. User not created.',
      status: 500
    });
  }
})

app.post("/api/signup/check", async (req, res) => {
  const { accountName, email } = req.body;

  try{
      const user_name_exists = await getUserBy({ type: 'user', payload: accountName });
      const user_email_exists = await getUserBy({ type: 'email', payload: email });
    
      if (user_name_exists?.data) {
        return res.status(409).send({
          message: 'User already exists with this username',
          status: 409
        });
      }
    
      if (user_email_exists?.data) {
        return res.status(409).send({
          message: 'User already exists with this email',
          status: 409
        });
      }
    
      // ✅ Confirmation response
      return res.status(200).send({
        message: 'User can be created',
        status: 200,
        confirmationRequired: true
      });
  }
  catch(err){
    console.error('Error during signup check:', err.message);
    return res.status(500).send({
      message: 'Error during signup check',
      status: 500
    });
  }

});

app.post("/api/signup/finalize", async (req, res) => {
  try {
    const raw_details = req.body;

    const passwordHashed = await hashPassword(raw_details.password);

    const user_details = {
      accountType: raw_details.accountType,
      accountName: raw_details.accountName,
      email: raw_details.email,
      passwordHashed,
      accountUUID: uuidv4(),
      lastLogin: new Date().toISOString(),
      twoFactorSecrets: '',
      twoFactorEnable: false,
    };

    const data = await createAuthenticator(user_details);

    if (data.status !== 201) {
      return res.status(data.status).send(data);
    }

    const result = await addUser(data.user_details);

    if (result.status !== 201) {
      return res.status(result.status).send(result);
    }

    return res.status(201).send({
      data: result.data,
      otpauthURL: data.otpauth_url
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: 'Signup failed',
      status: 500
    });
  }
});

app.post("/api/signin/check", async (req, res) => {
  const { userInput , password } = req.body;

  try{
      const user_name_exists = await getUserBy({ type: 'user', payload: userInput });
      const user_email_exists = await getUserBy({ type: 'email', payload: userInput });

      console.log('User lookup results - by username:', user_name_exists, 'by email:', user_email_exists);

    
      if (!user_name_exists?.data && !user_email_exists?.data) {
        return res.status(409).send({
          message: 'No user found with this username or email',
          field: 'userInput',
          status: 401
        });
      }

      const userName = user_name_exists?.data ? user_name_exists.data.accountName : user_email_exists.data.accountName;

      console.log('User found with username:', userName);

      const validate = await CheckUserBy(userName, password);
      
      if(validate.status !== 200){
        return res.status(validate.status).send(validate);
      }

      const accessToken = signAccessToken(validate.data);
      const refreshToken = signRefreshToken(validate.data);

      console.log(accessToken, refreshToken);
    
      // ✅ Confirmation response
      return res.status(200).send({
        message: 'User can be signed in',
        status: 200,
        confirmationRequired: true,
        data: validate.data,
        tokens: {
          accessToken,
          refreshToken
        }
      });
  }
  catch(err){
    console.error('Error during signin check:', err.message);
    return res.status(500).send({
      message: 'Error during signin check',
      status: 500
    });
  }

});

app.post("/api/verify2FA", async (req,res) => {
  const {id , otp:token} = req.body;

  console.log('Received 2FA verification request for ID:', id, 'with token:', token);

  const user_details = await getUserBy({type: 'id', payload: id});

  if(user_details.status !== 200){
    return res.status(user_details.status).send(user_details);
  }

  console.log('User details fetched for verification:', user_details);

  try{
    const result = await verifyAuthenticator(user_details.data,token);

    console.log('Verification result:', result);

    res.status(result.status).send(result);
  }
  catch(err){
    console.error('Verification failed:', err.message);
    return res.status(500).send({
      message: 'Verification failed.',
      status: 500
    });
  }
})

app.get("/api/auth/amireal", verifyAccessToken, (req,res) => {
     res.status(200).send({
      message: 'Authenticated request successful.',
      user: req.user
     });
})

app.post("/api/auth/refresh-token" , (req,res) => {
  const { refreshToken } = req.body;

  console.log('Received refresh token request with token:', refreshToken);

  if(!refreshToken){
    return res.status(401).send({
      message: 'Refresh token missing.',
    })
  }

  try{
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  

    if(payload.type !== 'refresh'){
      return res.status(401).send({
        message: 'Invalid refresh token type.',
      })
    }
    const newAccessToken = jwt.sign(
      {
        sub: payload.sub,
        type: 'access'
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).send({
      accessToken: newAccessToken
    })
  } catch(err){
    console.error('Error verifying refresh token:', err.message);
    return res.status(401).send({
      message: 'Invalid refresh token.',
    })
  }
})

// app.get("/getUserByEmail", async (req,res) => {
//   const email = req.query.email;
//   const result = await getUserByEmail(email);
//   res.status(result.status).send(result);
// })

// app.get("/getUsers", async (req,res) => {
//   const result = await getUsers();
//   res.status(result.status).send(result);
// })

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});