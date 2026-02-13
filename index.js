import { addUser , deleteUserFiles, getUserBy, getUserData, updateUserDetails, uploadUserFiles, uploadUserFilePreview, getUserSubscription, uploadUserVault } from "./services/account.services.js";
import express from "express";
import { v4 as uuidv4 } from 'uuid';
import { createAuthenticator, verifyAuthenticator } from "./utils/aunthenticator.js";
import cors from "cors";
import { hashPassword } from "./utils/passwordHash.js";
import { issueResetToken, signAccessToken, signRefreshToken } from "./utils/token.js";
import { verifyAccessToken, verifyResetToken } from "./middlewares/auth.middleware.js";
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import Redis from "ioredis";
import crypto from "crypto";
import { generateKey } from "./utils/cryptography.js";

const app = express();
const port = process.env.PORT || 3002;

app.use(cors({
  origin: '*'
}));
app.use(express.json({limit: '10mb'}));

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});


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

app.get("/", async (req,res) => {
  return res.status(200).send({message:"working on server"})
})

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

      console.log('User lookup results - by username:', user_name_exists, 'by email:', user_email_exists);
    
      if (user_name_exists?.data) {
        return res.status(409).send({
          message: 'User already exists with this account name',
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

app.post("/api/signup/register", async (req, res) => {
  try {
    const user_details = req.body;

    const result = await addUser(user_details);

    if (result.status !== 201) {
      return res.status(result.status).send(result);
    }

    const accessToken = signAccessToken(user_details);
    const refreshToken = signRefreshToken(user_details);

    return res.status(201).send({
      data: result.data,
      tokens: {
        accessToken,
        refreshToken
      },
      message: 'User registered successfully',
      status: 201
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: 'Signup failed',
      status: 500
    });
  }
});

// app.get("/api/signup/recoverykeys", (req, res) => {
//   const email = req.query.email;
//   const generatedHtml = recoveryGenerator(email);
//   res.setHeader('Content-Type', 'text/html').status(200).send({
//     message: 'Recovery keys generated successfully.',
//     data: generatedHtml
//   });
// });

app.post("/api/forgotpassword/validaterecovery/check1", async (req, res) => {
  const { userInput } = req.body;

  console.log('Received recovery check for user input:', userInput);

  try{
      const user_name_exists = await getUserBy({ type: 'user', payload: userInput });
      const user_email_exists = await getUserBy({ type: 'email', payload: userInput });

      console.log('User lookup results - by username:', user_name_exists, 'by email:', user_email_exists);

    
      if (!user_name_exists?.data && !user_email_exists?.data) {
        return res.status(409).send({
          message: 'No user found with this username or email',
          field: 'userInput',
          status: 409
        });
      }

      const userName = user_name_exists?.data ? user_name_exists.data.accountName : user_email_exists.data.accountName;

      console.log('User found with username:', userName);

      const recoveryKeyData = await getUserBy({ type: 'recoveryKeyHashSalt', payload: userName });

      console.log('Recovery key data fetched:', recoveryKeyData);

      if(recoveryKeyData.status !== 200 || !recoveryKeyData.data.recoveryKeyHashSalt || !recoveryKeyData.data.rk_salt){
        return res.status(409).send({
          message: 'No recovery keys set up for this user',
          status: 409
        });
      }

      const nonce = crypto.randomBytes(32).toString("hex");

      await redis.setex(`recovery_nonce_${userName}`, 300, nonce);

      return res.status(200).send({
        message: 'User recovery salt to validate recovery keys',
        status: 200,
        data: {
          recoveryKeyData: recoveryKeyData.data,
          nonce
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
})

app.post("/api/forgotpassword/validaterecovery/check2", async (req, res) => {
  const { userName, proof } = req.body;

  if(!userName || !proof ){
    return res.status(400).send({
      message: 'Username, proof, and nonce are required.',
      status: 400
    });
  }

  const redisNonce = await redis.get(`recovery_nonce_${userName}`);

  if (!redisNonce) {
    return res.status(401).send({
      message: "Recovery session expired or invalid"
    });
  }

  console.log('Received recovery validation for user:', userName);
  console.log('proof provided:', proof);
  console.log('Nonce from Redis:', redisNonce);

  try{
      const recoveryKeyData = await getUserBy({ type: 'recoveryKeyHash', payload: userName });

      if(recoveryKeyData.status !== 200){
        return res.status(recoveryKeyData.status).send(recoveryKeyData);
      }

      const expectedProof = await generateKey(
        recoveryKeyData.data.recoveryKeyHash,
        redisNonce,
        1
      );
            
      console.log('Provided proof:', proof);
      console.log('Expected proof:', expectedProof);

      if (!crypto.timingSafeEqual(
        Buffer.from(expectedProof, 'hex'),
        Buffer.from(proof, 'hex')
      )) {
        return res.status(401).send({ message: "Invalid recovery proof" });
      }

      const recoveryData = await getUserBy({ type: 'recoveryData', payload: userName });
      console.log('Recovery data fetched for user:', recoveryData);
      const resetToken = issueResetToken(recoveryData.data);

      console.log('Issued reset token:', resetToken);

      return res.status(200).send({
        message: 'User recovery salt to validate recovery keys',
        status: 200,
        data: {
          recoveryData: recoveryData.data,
          resetToken: resetToken
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
})

app.post("/api/forgotpassword/resetpassword", verifyResetToken , async (req, res) => {
  const { userId, newPkSalt, newEncryptedMasterKey, authSalt , authHash } = req.body;

  console.log('Received password reset request', userId, newPkSalt, newEncryptedMasterKey, authSalt, authHash);

  if(!userId || !newPkSalt || !newEncryptedMasterKey || !authSalt || !authHash){
    return res.status(400).send({
      message: 'New password, new PK salt, new encrypted master key, auth salt, and auth hash are required.',
      status: 400
    });
  }

  try{
      const resetResult = await updateUserDetails({
        type: 'resetPassword',
        payload: {
          userId,
          newPkSalt,
          newEncryptedMasterKey,
          authSalt,
          authHash
        }
      })

      if(resetResult.status !== 201){
        return res.status(resetResult.status).send(resetResult);
      }

      return res.status(201).send({
        message: 'Password has been reset successfully.',
        status: 201
      });
  }
  catch(err){
    console.error('Error during password reset:', err.message);
    return res.status(500).send({
      message: 'Error during password reset',
      status: 500
    });
  }
});

app.post("/api/signin/check1", async (req, res) => {
  const { userInput } = req.body;

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

      const authData = await getUserBy({ type: 'authSalt', payload: userName });

      if(authData.status !== 200){
        return res.status(authData.status).send(authData);
      }

      return res.status(200).send({
        message: 'User auth salt to signin',
        status: 200,
        data: authData.data
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

app.post("/api/signin/check2", async (req, res) => {
  const { accountName , authHash } = req.body;

  if(!accountName || !authHash){
    return res.status(400).send({
      message: 'Account name and auth hashed are required.',
      status: 400
    });
  }

  try{
      const authData = await getUserBy({ type: 'authHash', payload: accountName });
      if(authData.status !== 200){
        return res.status(authData.status).send(authData);
      }

      if(authData.data.authHash !== authHash){
        return res.status(401).send({
          message: 'Invalid credentials provided.',
          status: 401
        });
      }

      const userData = await getUserBy({ type: 'signin', payload: accountName });

      if(userData.status !== 200){
        return res.status(userData.status).send(userData);
      }

      console.log('User data retrieved for user:', userData.data);

      // update last login time
      await updateUserDetails({
        type: 'lastLogin',
        payload: {
          _id: userData.data._id
        }
      });

      const subscriptionData = await getUserSubscription(userData.data._id);
      console.log('Subscription data retrieved for user:', subscriptionData.data);

      const accessToken = signAccessToken(userData.data);
      const refreshToken = signRefreshToken(userData.data);

      return res.status(200).send({
        message: 'User can be signed in',
        status: 200,
        data: {
          accountUUID: userData.data.accountUUID,
          accountName: userData.data.accountName,
          email: userData.data.email,
          _id: userData.data._id,
          _createdAt: userData.data._createdAt,
          secret : {
            pk_salt: userData.data.pk_salt,
            encryptedMasterKey: userData.data.encryptedMasterKey
          },
          ...subscriptionData.data
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });

      // const validate = await CheckUserBy(userName, password);
      
      // if(validate.status !== 200){
      //   return res.status(validate.status).send(validate);
      // }


      // console.log(accessToken, refreshToken);
    
      // // ✅ Confirmation response
      // return res.status(200).send({
      //   message: 'User can be signed in',
      //   status: 200,
      //   confirmationRequired: true,
      //   data: validate.data,
      //   tokens: {
      //     accessToken,
      //     refreshToken
      //   }
      // });
  }
  catch(err){
    console.error('Error during signin check:', err.message);
    return res.status(500).send({
      message: 'Error during signin check 2',
      status: 500
    });
  }
});


//Uploading Files to Sanity
app.post("/api/upload-chunk",verifyAccessToken, async (req, res) => {
  try{
    const { data } = req.body;

    console.log('Received chunk upload request with data:', data);

    if(!data.userId || !data.fileId || !data.filename || data.index === undefined || !data.totalChunks || !data.encrypted || !data.fileSize || !data.fileType){
      return res.status(400).send({
        message: 'userId, fileId, fileName, index, totalChunks, encrypted are required.',
        status: 400
      });
    }


    const result = await uploadUserFiles(
      data
    );

    console.log(`Chunk ${data.index + 1} upload result:`, result);

    if(result.status !== 201){
      return res.status(result.status).send(result);
    }

    res.status(result.status).send(result);
  }
  catch(err){
    console.error('Error during chunk upload:', err.message);
    return res.status(500).send({
      message: 'Error during chunk upload',
      status: 500
    });
  }
});

app.post("/api/files/filesMetadata",verifyAccessToken, async (req,res) => {
  const { userId } = req.body;

  console.log('userId received for files metadata:', userId);

  if(!userId){
    return res.status(400).send({
      message: 'userId is required.',
      status: 400
    });
  }

  console.log('Received files metadata request for userId:', userId);
  
  try{
    const result = await getUserData({
      type: 'files',
      payload: userId
    })

    if(result.status !== 200){
      return res.status(result.status).send(result);
    }

    // console.log('Files metadata retrieved:', result);

    res.status(result.status).send(result);
  }
  catch(err){
    console.error('Error fetching files metadata:', err.message);
    return res.status(500).send({
      message: 'Error fetching files metadata',
      status: 500
    });
  }
});

app.post("/api/uploadFilePreview", verifyAccessToken, async (req,res) => {
  const { userId, fileId, encryptedPreview, encryptedPreviewKey, version, } = req.body;

  console.log('Received file preview request for userId:', userId, 'fileId:', fileId, 'version:', version);

  if(!userId || !fileId || !encryptedPreview || !encryptedPreviewKey || !version){
    return res.status(400).send({
      message: 'userId, fileId, encryptedPreview, encryptedPreviewKey, and version are required.',
      status: 400
    });
  }
  
  try{
    const result = await uploadUserFilePreview(
      userId,
      fileId,
      encryptedPreview,
      encryptedPreviewKey,
      version
    )

    if(result.status !== 201){
      return res.status(result.status).send(result);
    }

    console.log('File preview uploaded:', result);

    res.status(result.status).send(result);
  }
  catch(err){
    console.error('Error uploading file preview:', err.message);
    return res.status(500).send({
      message: 'Error uploading file preview',
      status: 500
    });
  }
});

app.post("/api/files/filePreviewMetadata", verifyAccessToken, async (req,res) => {
  const { userId } = req.body;
  if(!userId){
    return res.status(400).send({
      message: 'userId is required.',
      status: 400
    });
  }

  console.log('Received file preview metadata request for userId:', userId);
  
  try{
    const result = await getUserData({
      type: 'filePreviews',
      payload: userId
    })

    if(result.status !== 200){
      return res.status(result.status).send(result);
    }

    // console.log('File preview metadata retrieved:', result);

    res.status(result.status).send(result);
  }
  catch(err){
    console.error('Error fetching file preview metadata:', err.message);
    return res.status(500).send({
      message: 'Error fetching file preview metadata',
      status: 500
    });
  } 
});

// Deletion Area
app.delete("/api/files/deleteFile/:userId/:fileId", verifyAccessToken, async (req,res) => {
  const { userId, fileId } = req.params;

  console.log('Received file deletion request for userId:', userId, 'fileId:', fileId);

  if(!userId || !fileId){
    return res.status(400).send({
      message: 'userId and fileId are required.',
      status: 400
    });
  }
  
  try{
    const result = await deleteUserFiles(userId,fileId)

    if(result.status !== 200){
      return res.status(result.status).send(result);
    }

    console.log('File deleted successfully:', result);

    res.status(result.status).send(result);
  }
  catch(err){
    console.error('Error deleting file:', err.message);
    return res.status(500).send({
      message: 'Error deleting file',
      status: 500
    });
  }
});

app.post("/api/vault/upload", verifyAccessToken, async (req,res) => {
  const { userId, vaultData } = req.body;

  console.log('Received vault upload request for userId:', userId, 'vaultData:', vaultData);

  if(!userId || !vaultData){
    return res.status(400).send({
      message: 'userId and vaultData are required.',
      status: 400
    });
  }
  
  try{
    const result = await uploadUserVault(
      {
        userId,
        vaultData
      }
    )

    if(result.status !== 201){
      return res.status(result.status).send(result);
    }

    console.log('Vault data uploaded:', result);

    res.status(result.status).send(result);
  }
  catch(err){
    console.error('Error uploading vault data:', err.message);
    return res.status(500).send({
      message: 'Error uploading vault data',
      status: 500
    });
  }
});

app.get("/api/vault/items", verifyAccessToken, async (req,res) => {
  const { userId } = req.query;

  console.log('Received vault data request for userId:', userId);

  if(!userId){
    return res.status(400).send({
      message: 'userId is required.',
      status: 400
    });
  }
  
  try{
    const result = await getUserData({
      type: 'vaultItems',
      payload: userId
    })

    if(result.status !== 200){
      return res.status(result.status).send(result);
    }

    console.log('Vault data retrieved:', result);

    const data = {
      ...result,
      data: result.data.map(({ _rev, _type, ...rest }) => rest)
    }

    res.status(result.status).send(data);
  }
  catch(err){
    console.error('Error fetching vault data:', err.message);
    return res.status(500).send({
      message: 'Error fetching vault data',
      status: 500
    });
  } 
});

// app.post("/api/verify2FA", verifyAccessToken, async (req,res) => {
//   const {id , otp:token} = req.body;

//   console.log('Received 2FA verification request for ID:', id, 'with token:', token);

//   const user_details = await getUserBy({type: 'id', payload: id});

//   if(user_details.status !== 200){
//     return res.status(user_details.status).send(user_details);
//   }

//   console.log('User details fetched for verification:', user_details);

//   try{
//     const result = await verifyAuthenticator(user_details.data,token);

//     console.log('Verification result:', result);

//     res.status(result.status).send(result);
//   }
//   catch(err){
//     console.error('Verification failed:', err.message);
//     return res.status(500).send({
//       message: 'Verification failed.',
//       status: 500
//     });
//   }
// })

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
