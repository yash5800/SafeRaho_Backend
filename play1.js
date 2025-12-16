const { v4: uuidv4} = require('uuid');
const { createAuthenticator, verifyAuthenticator } = require('./aunthenticator');
const fs = require('fs');
const { getUserDetails } = require('./lib');


(async () => {
  const user_details = getUserDetails();
  // await createAuthenticator(user_details);
  const result = await verifyAuthenticator(user_details, '653097');
  console.log('Verification Result:', result);
})();

