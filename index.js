import client  from "./sanityClient.js";


async function addUser(name, email){
  const res = await client.create({
    _type:'user',
    name,
    email
  })

  if(res){
    return {
      message : 'User added successfully',
      data : res,
      status : 200
    }
  }
  else{
    return {
      message : 'Error adding user',
      status : 500
    }
  }
}

async function getUsers(){
  const res = await client.fetch('*[_type == "user"]{name, email}');

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
      status : 500
    }
  }
}


async function getUserByEmail(email){
  const res = await client.fetch('*[_type == "user" && email == $email]{name, email}', {email});

  if(res){
    return {
      message : 'User fetched successfully',
      data : res,
      status : 200
    }
  }
  else{
    return {
      message : 'Error fetching user',
      status : 500
    }
  }
}


(async ()=>{
  const res = await client.create({
    _type:'accounts',
    accountUUID : '123e4567-e89b-12d3-a456-426614174000',
    accountType : 'admin',
    accountName : 'Admin Account',
    email : 'admin@example.com',
    passwordHashed : 'hashed_password_example',
    lastLogin : new Date().toISOString(),
    twoFactorScrets : {
      cipherText : 'example_cipher_text',
      nonce : 'example_nonce'
    }
  });

  console.log(res);

})()