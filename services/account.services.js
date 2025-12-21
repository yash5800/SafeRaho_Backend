import client  from "../sanityClient.js";
import { verifyPassword } from "../utils/passwordHash.js";
import { AccountSchema } from "../validators/account.schema.js";

// Adding new user account
async function addUser(details){

  try{
    const parsed = AccountSchema.safeParse(details);

    if(!parsed.success){

      const zodErrors = Array.isArray(parsed.error.issues) ? parsed.error.issues : [];

      console.error('Validation errors:', zodErrors);

      return {
        message : 'Invalid input data',
        status : 400,
        error: "VALIDATION_ERROR",
        details: zodErrors.map(e=>({
          field: e.path.join('.') || 'unknown',
          message: e.message || 'Invalid value'
        }))
      };
    }

    const data = parsed.data;

    // Restrict admin account creation
    if(data.accountType === 'admin'){
       return {
        message : 'Admin creation is restricted!',
        status : 403,
        error : 'FORBIDDEN_OPERATION'
       }
    }

     //Create user in Sanity
    const res = await client.create({
        _type:'accounts',
        accountName: details.accountName,
        email: details.email,
        accountUUID: details.accountUUID,
        accountType: details.accountType,
        passwordHashed: details.passwordHashed,
        lastLogin: details.lastLogin,
        twoFactorSecrets: details.twoFactorSecrets,
        twoFactorEnable: details.twoFactorEnable
      })
    
    return {
        message : 'User added successfully',
        data : res,
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
    'user':'accountName',
    'email':'email',
    'id':'_id'
  }

  if(!data.payload || !data.type || types[data.type] === undefined){
    return {
      message : `${types[data.type] || 'Value'} is required`,
      status : 400,
      error: "VALIDATION_ERROR"
    }
  }

  try{
    const res = await client.fetch(`*[_type == "accounts" && ${types[data.type]} == $value][0]{ _id ,accountUUID, accountType, accountName, email, _createdAt, twoFactorSecrets, twoFactorEnable}`, {value: data.payload});

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

async function getUserById(id){

  if(!id){
    return {
      message : 'ID is required',
      status : 400,
      error: "VALIDATION_ERROR"
    }
  }

  try{
    const res = await client.fetch('*[_type == "accounts" && _id == $id][0]{ _id ,accountUUID, accountType, accountName, email, _createdAt, twoFactorSecrets, twoFactorEnable}', {id});

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

async function getUserByUser(userName){

  if(!userName){
    return {
      message : 'User name is required',
      status : 400,
      error: "VALIDATION_ERROR"
    }
  }

  try{
    const res = await client.fetch('*[_type == "accounts" && accountName == $userName][0]{ _id ,accountUUID, accountType, accountName, email, _createdAt, twoFactorSecrets, twoFactorEnable}', {userName});

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

async function getUsers(){
  const res = await client.fetch('*[_type == "accounts"]{accountUUID, accountType, accountName, email, _createdAt}');

  if(res){
    return {
      message : 'Users fetched successfully',
      data : res,
      status : 200
    }
  }
  else{
    return {
      message : 'Error fetching users',
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
    'login':'lastLogin'
  }

  if(!data.payload || !data.type || types[data.type] === undefined){
    return { 
      message : 'Property to update is required',
      status : 400,
      error: "VALIDATION_ERROR"
    };
  }

  try {

    if(data[data.type] === 'lastLogin'){
      const res = await client.patch(data.payload._id)
        .set({ lastLogin: new Date().toISOString() })
        .commit();
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

async function CheckUserBy(userName,password){
  
  if(!userName || !password){
    return {
      message : 'Username and password are required',
      status : 400,
      error: "VALIDATION_ERROR"
    }
  }

  try{
    const validUserData = await client.fetch('*[_type == "accounts" && accountName == $userName][0]{ _id ,accountName,passwordHashed}', {userName});

    if(!validUserData){
      return {
        message : 'User not found',
        status : 404,
        error: "USER_NOT_FOUND"
      }
    }

    console.log('Valid User Data:', validUserData);

    const res = await verifyPassword(validUserData.passwordHashed, password);

    if(!res){
      return {
        message : 'Invalid password',
        status : 401,
        error: "INVALID_CREDENTIALS",
        field: "password"
      }
    }

    console.log('Password verification successful for user:', validUserData.accountName);

    const userData = await getUserBy({ type: 'id', payload: validUserData._id  });

    if(!userData.data){
      return {
        message : 'User not found after verification',
        status : 404,
        error: "USER_NOT_FOUND"
      }
    }

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

export { addUser, getUserBy, getUsers, updateUserPwd  , updateUser2FA , getUserById , getUserByUser, CheckUserBy, updateUserDetails };