import { encryptionKey, deriveKeyFromPassphrase, decryptionKey } from './cryptography.js';
import { authenticator } from 'otplib';
import { updateUser2FA } from '../services/account.services.js';

const twoFactorPassphrase = 'Supreme_Emperor_Nika';

async function createAuthenticator(user_details){

  console.log('Creating authenticator for user details:', user_details);

  if(user_details.twoFactorEnable){
    console.log('User details already exist. Exiting to prevent overwrite.');
    return {
      message: 'User details already exist. No changes made.',
      status: 409
    };
  }
  else{
    console.log('Creating new user details...');

    const secret = authenticator.generateSecret();

    try{
      user_details.twoFactorSecrets = await encryptionKey(secret, await deriveKeyFromPassphrase(twoFactorPassphrase));
    }
    catch(err){
      console.error('Encryption failed:', err.message);
      return {
        message: 'Encryption failed. User details not created.',
        status: 500
      };
    }

    console.log('User Details:', user_details);

    const otpauth = authenticator.keyuri(user_details.email,"MyAwesomeApp", secret);

    return {
      message: 'Authenticator created successfully',
      otpauth_url: otpauth,
      user_details: user_details,
      status: 201
    }
  }
}


async function verifyAuthenticator(user_details,token){

  console.log('Verifying authenticator for user details:', user_details, 'with token:', token);

  if(!user_details.twoFactorEnable && user_details.twoFactorSecrets){

    try{
        const decryptedSecret = await decryptionKey(
          user_details.twoFactorSecrets.cipherText,
          user_details.twoFactorSecrets.nonce,
          await deriveKeyFromPassphrase(twoFactorPassphrase)
        );
  
        console.log('Decrypted Text:', decryptedSecret);
  
        const isValid = authenticator.verify({
          token: token,
          secret: decryptedSecret,
          window: 2
        });


        try{

         if(isValid){
           const res = await updateUser2FA(user_details._id, true);
           return {
             verificationStatus: "success" ,
             status: 200,
             twoStepUpdate: res.data.twoFactorEnable
           };
         }else{
            return {
              verificationStatus: "failure",
              status: 200
            };
         }
        }
        catch(err){
          console.error('Failed to update 2FA status in database:', err.message);
          return {
            verificationStatus: "error_updating_status",
            status: 500
          };
        }      
    }
    catch(err){
      console.error('Decryption failed:', err.message);
      return {
        verificationStatus: "error",
        status: 500
      };
    }
  }
  else if(user_details.twoFactorEnable && user_details.twoFactorSecrets){
    return {
      verificationStatus: "already_enabled",
      status: 200
    };
  }
  else{
    console.log('No valid user found.');
    return {
      verificationStatus: "no_user",
      status: 404
    };
  }

}


export {
  createAuthenticator,
  verifyAuthenticator
};