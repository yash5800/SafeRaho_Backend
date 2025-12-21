// const { v4: uuidv4} = require('uuid');
// const { createAuthenticator, verifyAuthenticator } = require('./aunthenticator');
// const fs = require('fs');
// const { getUserDetails } = require('./lib');


// (async () => {
//   const user_details = getUserDetails();
//   // await createAuthenticator(user_details);
//   const result = await verifyAuthenticator(user_details, '653097');
//   console.log('Verification Result:', result);
// })();

import client  from './sanityClient.js'



(async () => {
  const result =  await client.fetch('*[_type == "accounts"]').then((users) => {
    console.log('Fetched Users:', users);
  }).catch((error) => {
    console.error('Error fetching users:', error);
  });

  console.log('Result:', result);
  // client.delete({query: '*[_type == "accounts"]'})
  //   .then(result => console.log('Deleted:', result))
  //   .catch(err => console.error('Error:', err))   
})();
