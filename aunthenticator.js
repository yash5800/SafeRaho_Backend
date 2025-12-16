const { encryptionKey, deriveKeyFromPassphrase, decryptionKey } = require('./cryptography');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const fs = require('fs');
const { checkUserDetailsExists, saveUserDetails } = require('./lib');

const twoFactorPassphrase = 'Supreme_Emperor_Nika';

async function createAuthenticator(user_details){
  if(user_details.twoFactorEnabled){
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
      user_details.twoFactorSecret = await encryptionKey(secret, await deriveKeyFromPassphrase(twoFactorPassphrase));
    }
    catch(err){
      console.error('Encryption failed:', err.message);
      return {
        message: 'Encryption failed. User details not created.',
        status: 500
      };
    }

    console.log('User Details:', user_details);

    fs.writeFileSync('user_details.json', JSON.stringify(user_details, null, 2));

    const otpauth = authenticator.keyuri(user_details.email,"MyAwesomeApp", secret);
    
    // Render the QR code in the terminal for quick scanning
    qrcode.toString(otpauth, { type: 'terminal', small: true }, (err, qr) => {
      if (err) {
        console.error('Failed to generate QR code:', err);
        return {
          message: 'QR code generation failed.',
          status: 500
        };
      }
      console.log('\nScan this QR for OTP setup:\n');
      console.log(qr);
    });

  }
}


async function verifyAuthenticator(user_details,token){
  if(!user_details.twoFactorEnabled && user_details.twoFactorSecret){
    try{
        const decryptedSecret = await decryptionKey(
          user_details.twoFactorSecret.cipherText,
          user_details.twoFactorSecret.nonce,
          await deriveKeyFromPassphrase(twoFactorPassphrase)
        );
  
        console.log('Decrypted Text:', decryptedSecret);
  
        const isValid = authenticator.verify({
          token: token,
          secret: decryptedSecret,
          window: 2
        });

        saveUserDetails({
          ...user_details,
          twoFactorEnabled: isValid ? true : false
        });
      
        return {
          verificationStatus: isValid ? "success" : "failure",
          status: 200
        };
    }
    catch(err){
      console.error('Decryption failed:', err.message);
      return {
        verificationStatus: "error",
        status: 500
      };
    }
  }
  else if(user_details.twoFactorEnabled && user_details.twoFactorSecret){
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


module.exports = {
  createAuthenticator,
  verifyAuthenticator
};