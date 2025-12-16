const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const user_details = {
  uuid: uuidv4(),
  name: 'Devil Duke',
  pwd: 'sh33325fvsvsdkjsd3',
  email: 'devil.duke@example.com',
  twoFactorSecrets : {
    cipherText: '',
    nonce: ''
  },
  twoFactorEnabled : false
}

function getUserDetails() {
  if (fs.existsSync('user_details.json')) {
    const data = fs.readFileSync('user_details.json', 'utf-8');
    return JSON.parse(data);
  }else{
    fs.writeFileSync('user_details.json', JSON.stringify(user_details, null, 2));
    return user_details;
  }
}

function checkUserDetailsExists() {
  return fs.existsSync('user_details.json');
};

function saveUserDetails(details) {
  fs.writeFileSync('user_details.json', JSON.stringify(details, null, 2));
}

module.exports = {
  getUserDetails,
  checkUserDetailsExists,
  saveUserDetails
};