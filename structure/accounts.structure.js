//old
const accounts_document_record_input = {
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
}
const accounts_document_record_output = {
    _createdAt: '2026-01-28T14:40:44Z',
    _id: 'zHGMcSO7JRv77weGXhxcOw',
    _rev: 'zHGMcSO7JRv77weGXhxcMP',
    _type: 'accounts',
    _updatedAt: '2026-01-28T14:40:44Z',
    accountName: 'Joker555',
    accountType: 'general',
    accountUUID: 'b2422687-70c5-41f3-b529-714161958a7e',
    authHash: '7afc52e4b487b80085a57249193db66d08f327dbaef66ece8baf476dc6188401',
    auth_salt: 'f9667c678857540897c8a21a5c962aaa',
    email: 'Joker555@gmail.com',
    encryptedMasterKey: {
      cipher: 'r0wEURH+vLlTtcGFzhAwXd9q2KKa/aQs5uF9yvblgTERSRZ0XFp3bu5BHeQVFvbgU0/Zy2h1tb1A5+rOAR8XBtuM/wTKdLJUokd5EfEzmgw=',
      mac: 'cad1de8668a3216373c56f63a5aefb6da7c63b5150fb80c3af49411d160f7a20',
      nonce: 'bbb0c0469bc1aa9a5e6eacff30af89fd'
    },
    encryptedRecoveryMasterKey: {
      cipher: 'TLH3O2h9axBgsiEws3v6RIEJ+LSVs1sqUP5kBFLC2fr+yXZ+eKbZ+lIqH69HWjyfDe7L0g2FQ4uAxDOmwx77Iq881gunS3oDE1qWZfAIw4U=',
      mac: 'a0b4ea10941676aced65299f8d546b61f992a5413bc9057d4e6324836d15caf4',
      nonce: '32cf2618ba68301412bd3173abad7e1b'
    },
    pk_salt: '68d90e3c84a2f6e7909ca89d7bc7721c',
    recoveryKeyHash: '34d3960f0496207a07eccb5f1832cb19d22bd3ae5183093c7f52fc13288db7d6',
    recoveryKeyHashSalt: 'a2af1c44e68ca8006a2a50b29c8dc654',
    rk_salt: '780ab9263ca107c69a6c3a2c9dad1b9f'
  }

  