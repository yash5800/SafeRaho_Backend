import srp from 'secure-remote-password/client.js';
import sodium from 'libsodium-wrappers';

const client = async () => {
  await sodium.ready;

  // 1️⃣ Client ephemeral
  const clientEphemeral = srp.generateEphemeral();

  // 2️⃣ Server ephemeral (HEX STRINGS ✔)
  const ServerEphemeral = {
    secret: 'aa55a5847129881b21c68f27616593a20c0b6bb7a24cacd0e1158e8c12b7375a',
    public: '506e3355ad58adc31e486c8ed51ca9fb3a0a7d8c6517d692ea9bd134ac5c99f8cec9c0af8b08c27d582423ae6b574de8281b85cece594c24e639ce3c766cc1e36de8f25cde96548d0a553014502020e405e12f0fee4b41f9c6ee372dfc5a15aa8d4782208116f3075a1b3b679d1f87fc69a7dc627b04ce55aae1a38f24195e617fa6be7d4b2800edf441283838c085705bb387ba0f2043d8c2493b0be7f2f70f46d16db78d234d68fc062efa926a74e48328848072ffc49af1a9f80e53c1a74e8006a0bf717e9efa7bb8ee296b22b3fadcb0abf208950fcb3fcba260e5f34ba04c4129a0b69f488f6f73b51c63ae25289e7b40c5d17a93202fa456003146752a'
  };

  // 3️⃣ SALT MUST BE HEX STRING
  const salt = sodium.to_hex(
    sodium.randombytes_buf(16)
  );

  // 4️⃣ Derive private key (x)
  const privateKey = srp.derivePrivateKey(
    salt,
    "Jokerking",
    "joker12"
  );

  // 5️⃣ Derive session
  const clientSession = srp.deriveSession(
    clientEphemeral.secret,
    ServerEphemeral.public,
    salt,
    "Jokerking",
    privateKey
  );

  console.log('Client Session Key:', clientSession.key);
  console.log('Client Session Proof:', clientSession.proof);

  const ServerSession = {
     key: "bf0cd24d88688d7f897d77a3e36c1511f7fa207a6c9d9e657871fb133032b010",
     proof: "764b26476a578eb88424952676f1493262773f9587ff4a061f202151a5e2f88c"
  }

  // 6️⃣ Verify server proof
  if (!srp.verifySession(
    ServerEphemeral.public,
    ServerSession,
    clientSession.proof
  )) {
    throw new Error("Invalid password");
  }

};

client();
