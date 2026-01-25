import client  from "../sanityClient.js";
import { verifyPassword } from "../utils/passwordHash.js";
import { AccountSchema } from "../validators/account.schema.js";
import { v4 as uuidv4 } from 'uuid';

// Adding new user account
async function addUser(details){

  try{
    // const parsed = AccountSchema.safeParse(details);

    // if(!parsed.success){

    //   const zodErrors = Array.isArray(parsed.error.issues) ? parsed.error.issues : [];

    //   console.error('Validation errors:', zodErrors);

    //   return {
    //     message : 'Invalid input data',
    //     status : 400,
    //     error: "VALIDATION_ERROR",
    //     details: zodErrors.map(e=>({
    //       field: e.path.join('.') || 'unknown',
    //       message: e.message || 'Invalid value'
    //     }))
    //   };
    // }

    // const data = parsed.data;

    // Restrict admin account creation
    if(details.accountType === 'admin'){
       return {
        message : 'Admin creation is restricted!',
        status : 403,
        error : 'FORBIDDEN_OPERATION'
       }
    }
      // accountType: 'general',
      // accountName: data.userName,
      // email: data.email,
      // pk_salt: pk_salt,
      // encryptedMasterKey: encryptedMasterKey,
      // rk_salt: rk_salt,
      // encryptedRecoveryMasterKey: recoveryKeyData.encryptedRecoveryMasterKey

    console.log('Creating user with details:', details);

    //Create user in Sanity
    const res = await client.create({
        _type:'accounts',
        accountUUID: uuidv4(),
        accountType: details.accountType,
        accountName: details.accountName,
        email: details.email,
        lastLogin: details.lastLogin,
        pk_salt: details.pk_salt,
        encryptedMasterKey: details.encryptedMasterKey,
        rk_salt: details.rk_salt,
        encryptedRecoveryMasterKey: details.encryptedRecoveryMasterKey,
        auth_salt: details.auth_salt,
        authHash: details.authHash,
        recoveryKeyHashSalt: details.recoveryKeyHashSalt,
        recoveryKeyHash: details.recoveryKeyHash
      })

    console.log('User added to Sanity with ID:', res);
    
    return {
        message : 'User added successfully',
        data : {
          accountUUID: res.accountUUID,
          accountName: res.accountName,
          email: res.email,
          _id: res._id,
          _createdAt: res._createdAt,
          secret : {
            pk_salt: res.pk_salt,
            encryptedMasterKey: res.encryptedMasterKey
          }
        },
        status : 201
      }
    
  }catch(error){
    console.error("Sanity error:", error);

    return {
      message : error.message || "Something went wrong",
      status : 500,
      error: "INTERNAL_SERVER_ERROR"
  }
 }
}

async function getUserBy(data){

  const types = {
    'user': {
      name: 'accountName',
      fields: '_id ,accountUUID, accountName, email, _createdAt'
    },
    'email':{
      name: 'email',
      fields: '_id ,accountUUID, accountName, email, _createdAt'
    },
    'id':{
      name: '_id',
      fields: '_id ,accountUUID, accountName, email, _createdAt'
    },
    'authSalt':{
      name: 'accountName',
      fields: '_id ,accountUUID, accountName, auth_salt'
    },
    'authHash':{
      name: 'accountName',
      fields: '_id ,accountUUID, accountName, authHash'
    },
    'signin':{
      name: 'accountName',
      fields: '_id ,accountUUID, accountName, email, encryptedMasterKey, pk_salt, _createdAt'
    },
    'recoveryData':{
      name: 'accountName',
      fields: '_id ,accountUUID, accountName, email, encryptedRecoveryMasterKey'
    },
    'recoveryKeyHashSalt':{
      name: 'accountName',
      fields: '_id ,accountUUID, accountName, recoveryKeyHashSalt, rk_salt'
    },
    'recoveryKeyHash':{
      name: 'accountName',
      fields: '_id ,accountUUID, accountName, recoveryKeyHash'
    }
  }

  console.log('Getting user by:', data);

  if(!data.payload || !data.type || types[data.type] === undefined){
    return {
      message : `${types[data.type] || 'Value'} is required`,
      status : 400,
      error: "VALIDATION_ERROR"
    }
  }

  try{
    const query = `
      *[_type == "accounts" && ${types[data.type].name} == $value][0]{
        ${types[data.type].fields}
      }
    `;

    const res = await client.fetch(query, {
      value: data.payload,
    });

    console.log('User fetch result:', res);

    return {
      message : 'User fetched successfully',
      data : res,
      status : 200
    }
  }
  catch(error){
    return {
      message : 'Error fetching user',
      status : 500,
      error: "INTERNAL_SERVER_ERROR"
    }
  }
}
  
async function updateUserPwd(accountUUID, newPasswordHashed){
  if(!accountUUID || !newPasswordHashed){
    return { 
      message : 'Account UUID and new password hash are required',
      status : 400,
      error: "VALIDATION_ERROR"
    };
  }

  try {
    const res = await client.patch(accountUUID)
      .set({ passwordHashed: newPasswordHashed })
      .commit();

    return {
      message : 'Password updated successfully',
      data : res,
      status : 201
    };
  } catch (error) {
    return {
      message : 'Error updating password',
      status : 500,
      error: "INTERNAL_SERVER_ERROR"
    };
  }
}

async function updateUser2FA(id, twoFactorEnable){

  console.log('Updating 2FA for accountUUID:', id, 'to:', twoFactorEnable);

  if(!id || twoFactorEnable === null){
    return { 
      message : 'Account UUID and twoFactorEnable are required',
      status : 400,
      error: "VALIDATION_ERROR"
    };
  }

  console.log('Proceeding to update 2FA settings in database...');
  try {
    const res = await client.patch(id)
      .set({ twoFactorEnable: twoFactorEnable })
      .commit();

    console.log('2FA update result:', res);

    return {
      message : '2FA settings updated successfully',
      data : res,
      status : 201
    };
  }
  catch (error) {
    return {
      message : 'Error updating 2FA settings',
      status : 500,
      error: "INTERNAL_SERVER_ERROR"
    };
  }
}

async function updateUserDetails(data){

  const types = {
    'login':'lastLogin',
    'resetPassword':'masterKeyDetails'
  }

  if(!data.payload || !data.type || types[data.type] === undefined){
    return { 
      message : 'Property to update is required',
      status : 400,
      error: "VALIDATION_ERROR"
    };
  }

  try {
    console.log('Updating user details for type:', data.type);

    if(types[data.type] === 'lastLogin'){
      const res = await client.patch(data.payload._id)
        .set({ lastLogin: new Date().toISOString() })
        .commit();
    }
    else if(types[data.type] === 'masterKeyDetails'){
      console.log('Updating master key details for userId:', data.payload.userId);
      const res = await client.patch(data.payload.userId)
        .set({ 
          encryptedMasterKey: data.payload.newEncryptedMasterKey,
          pk_salt: data.payload.newPkSalt,
          auth_salt: data.payload.authSalt,
          authHash: data.payload.authHash
        })
        .commit();

      console.log('Master key details update result:', res);
    }

    return {
      message : 'User details updated successfully',
      status : 201
    };
  } catch (error) {
    return {
      message : 'Error updating password',
      status : 500,
      error: "INTERNAL_SERVER_ERROR"
    };
  }
}

async function uploadUserFiles(data){

  if(!data.userId || !data.fileId || !data.filename || data.index === undefined || !data.totalChunks || !data.encrypted || !data.fileSize || !data.fileType){
    return {
      message : 'All file upload parameters are required',
      status : 400,
      error: "VALIDATION_ERROR"
    }
  }

  const { index, fileId } = data;

  try{

    const encryptedPayload = JSON.stringify(data.encrypted)

    // Upload chunk to Sanity assets
    const asset = await client.assets.upload(
      'file',
      encryptedPayload,
      {
        fileName: `${fileId}_chunk_${index}.bin`,
        contentType: 'application/octet-stream'
      }
    );

    // Create file document only for the first chunk
    if (index === 0) {
      const {
        userId,
        filename,
        fileSize,
        fileType,
        duration,
        totalChunks,
      } = data;

      const res = await client.createIfNotExists({
        _type: "vaultFile",
        _id: fileId,
        accountId: userId,
        filename,
        fileSize,
        fileType,
        totalChunks,
        ...(duration != null && { duration }),
        chunks: [
          {
            _key: `${fileId}_0`,
            index: 0,
            assetId: {
              _type: "reference",
              _ref: asset._id,
            },
          },
        ],
      });

      console.log('File document created for first chunk:', res);
    }
    else{
      // Update file document in Sanity
      await client
        .patch(fileId)
        .setIfMissing({
          chunks: [],
        })
        .append("chunks",[
          { 
            _key: `${fileId}_${index}`, 
            index: index, 
            assetId: {
              _type: "reference",
              _ref: asset._id
            }
          },
        ])
        .commit()
    }

      return { status: 201, success: true, index: data.index }
  }
  catch(error){
    console.error('Error uploading file chunk:', error);
    return {
      message : 'Error uploading file chunk',
      status : 500,
      error: "INTERNAL_SERVER_ERROR"
    }
  }
}

async function uploadUserFilesPreview(
  userId,
  fileId,
  encryptedPreview,
  encryptedPreviewKey,
  version
){
  if(!userId || !fileId || !encryptedPreview || !encryptedPreviewKey || !version){
    return {
      message : 'All preview upload parameters are required',
      status : 400,
      error: "VALIDATION_ERROR"
    }
  }
  
  try{

    // Stringify 
    const previewPayload = JSON.stringify(encryptedPreview)

    // Upload preview to Sanity assets
    const asset = await client.assets.upload(
      'file',
      previewPayload,
      {
        filename: `${fileId}_preview_v${version}.bin`,
        contentType: 'application/octet-stream'
      }
    );

    // Upload file document in Sanity
    const x = await client.createIfNotExists({
      _type: "vaultFilePreview",
      _id: `${fileId}_${version}`,
      filename: `${fileId}_${version}.bin`,
      accountId: userId,
      fileId,
      encryptedPreviewKey,
      version,
      assetId: {
        _type: "reference",
        _ref: asset._id
      }
    })

    return { status: 201, success: true }
  }
  catch(error){
    console.error('Error uploading file preview:', error);
    return {
      message : 'Error uploading file preview',
      status : 500,
      error: "INTERNAL_SERVER_ERROR"
    }
  }
}

async function CheckUserBy(){
  
  if(!userName || !password){
    return {
      message : 'Username and password are required',
      status : 400,
      error: "VALIDATION_ERROR"
    }
  }

  try{
    console.log('User data retrieved:', userData);

    const updatedLogin = await updateUserDetails({ type: 'login', payload: userData.data });

    if(updatedLogin.status !== 201){
      console.error('Failed to update last login time for user:', userData.data.accountName);
    }

    return {
      message : 'User verified successfully',
      data : userData.data,
      status : 200
    }
  }
  catch(error){
    return {
      message : 'Error fetching user',
      status : 500,
      error: "INTERNAL_SERVER_ERROR"
    }
  }
}

async function getUserData(data){
  const types = {
    'files':{
      name: 'accountId',
      collection: "vaultFile",
      fields: `
        _id, 
        accountId, 
        filename, 
        fileSize, 
        fileType,
        duration,
        totalChunks,
        "chunks": chunks | order(index asc)[]{
            index,
            assetId,
            "url": assetId->url
          },
        _createdAt
      `
    },
    'filePreviews':{
      name: 'accountId',
      collection: "vaultFilePreview",
      fields: `
        _id, 
        fileId,
        accountId, 
        filename,
        version,
        encryptedPreviewKey,
        assetId,
        "url": assetId->url,
        _createdAt
      `
    }
  }

  console.log('Getting user by:', data);

  if(!data.payload || !data.type || types[data.type] === undefined){
    return {
      message : `${types[data.type] || 'Value'} is required`,
      status : 400,
      error: "VALIDATION_ERROR"
    }
  }

  try{
    const query = `
      *[_type == "${types[data.type].collection}" && ${types[data.type].name} == $value]{
        ${types[data.type].fields}
      }
    `;

    // console.log('Executing query:', query, 'with value:', data.payload);

    const res = await client.fetch(query, {
      value: data.payload,
    });

    // console.log('User files fetched result:', res);

    return {
      message : 'User files fetched successfully',
      data : res,
      status : 200
    }
  }
  catch(error){
    return {
      message : 'Error fetching user',
      status : 500,
      error: "INTERNAL_SERVER_ERROR"
    }
  }

}

export { addUser, getUserBy, updateUserPwd  , updateUser2FA , CheckUserBy, updateUserDetails, uploadUserFiles, getUserData, uploadUserFilesPreview}; 