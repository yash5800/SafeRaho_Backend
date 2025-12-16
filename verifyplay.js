const { authenticator } = require('otplib');
const fs = require('fs');


const user_details = JSON.parse(fs.readFileSync('user_details.json','utf-8'));

console.log(user_details);

const isValid = authenticator.verify({
  token: '530365',
  secret: user_details.twoFactorSecret,
  window: 2
})

if(isValid){
  user_details.twoFactorEnabled = true;
  console.log('OTP is valid!');
  fs.writeFileSync('user_details.txt', JSON.stringify(user_details, null, 2));
}
else{
  console.log('OTP is invalid!');
}
