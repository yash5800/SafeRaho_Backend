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

import { de } from 'zod/locales';
import client  from './sanityClient.js'

const userId = "zHGMcSO7JRv77weGXhvvfs";

(async () => {
  // accounts
  // const result =  await client.fetch('*[_type == "accounts"]').then((users) => {
  //   console.log('Fetched Users:', users);
  // }).catch((error) => {
  //   console.error('Error fetching users:', error);
  // });

  // // vaultFile
  // const result2 =  await client.fetch('*[_type == "vaultFile"]').then((files) => {
  //   console.log('Fetched Files:', files);
  // }).catch((error) => {
  //   console.error('Error fetching files:', error);
  // });
  
  // // vaultFilePreview
  // const result3 =  await client.fetch('*[_type == "vaultFilePreview"]').then((previews) => {
  //   console.log('Fetched Previews:', previews);
  // }).catch((error) => {
  //   console.error('Error fetching previews:', error);
  // });

  // // vaultItems
  const result4 =  await client.fetch('*[_type == "vaultItems"]{...}').then((items) => {
    const cleanedItems = items.map(({ _rev, _type, ...rest }) => rest);
    console.log('Cleaned Items:', cleanedItems);
  }).catch((error) => {
    console.error('Error fetching items:', error);
  });

  // client.delete({query: '*[_type == "accounts"]'})
  //   .then(result => console.log('Deleted:', result))
  //   .catch(err => console.error('Error:', err))   

  // client.delete({query: '*[_type == "vaultFilePreview"]'})
  //   .then(result => console.log('Deleted:', result))
  //   .catch(err => console.error('Error:', err))   
  
  // client.delete({query: '*[_type == "vaultFile"]'})
  //   .then(result => console.log('Deleted:', result))
  //   .catch(err => console.error('Error:', err))   

  // client.delete({query: '*[_type == "vaultItems"]'})
  //   .then(result => console.log('Deleted:', result))
  //   .catch(err => console.error('Error:', err)) 

  // const plainData = await client.fetch(`*[_type == "storagePlans"]{
  //   _id,
  //   plan_name,
  //   storage_limit_gb
  // }`);

  // console.log('Free plan data fetched:', plainData);

  // const query1 = `*[_type == "subscriptions" && account_id == $userId][0]{
  //   _id,
  //   account_id,
  //   storage_plan_id,
  //   status,
  //   _createdAt,
  //   _updatedAt,
  //   _endedAt
  // }`;
  // const params1 = { userId };

  // const subscriptionData = await client.fetch(query1, params1);
  // console.log('User Data:', subscriptionData);

  // const query2 = `*[_type == "storagePlans" && _id == $planId][0]{
  //   _id,
  //   plan_name,
  //   storage_limit_gb
  // }`;
  // const params2 = { planId: subscriptionData.storage_plan_id };

  // const planData = await client.fetch(query2, params2);
  // console.log('Plan Data:', planData);

})();
