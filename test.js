class SecretStorage {
  constructor(){
    this.secrets = new Map();
  }

  storeSecret(key, value){
    this.secrets.set(key, value);
  }

  retrieveSecret(key){
    return this.secrets.get(key);
  }
}

class PublicStorage {
  constructor(){
    this.data = new Map();
  }

  storeData(key, value){
    this.data.set(key, value);
  }

  retrieveData(key){
    return this.data.get(key);
  }
}

class Storage {
  static UserProfileKey = 'user_profile';
  static userVaultKey = 'user_vault';
  static userSettingsKey = 'user_settings';

  static accessTokenKey = 'access_token';
  static refreshTokenKey = 'refresh_token';

  constructor(){
    this.secretData = new SecretStorage();
    this.publicData = new PublicStorage();
  }

  storeAccessToken(token){
    this.publicData.storeData(Storage.accessTokenKey, token);
  }

  storeRefreshToken(token){
    this.secretData.storeSecret(Storage.refreshTokenKey, token);
  }

  getAccessToken(){
    return this.publicData.retrieveData(Storage.accessTokenKey);
  }

  getRefreshToken(){
    return this.secretData.retrieveSecret(Storage.refreshTokenKey);
  }
}

class UserProfile {
  constructor(name, age){
    this.name = name;
    this.age = age;
  }
}

class UserDataStorage {
  constructor(){
    this.userVault = new Map();
    this.userSettings = new Map();
  }
}

const user = new UserProfile('Alice', 30);

console.log(user.name);