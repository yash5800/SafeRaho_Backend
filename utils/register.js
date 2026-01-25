import sodium from 'libsodium-wrappers';
import srp from 'secure-remote-password/server.js';

export async function registerUser(email, password) {
  await sodium.ready;

  const salt = sodium.randombytes_buf(16);
  const privateKey = srp.derivePrivateKey(
    sodium.to_hex(salt),
    email,
    password
  );

  const verifier = srp.deriveVerifier(privateKey);

  return {
    salt: sodium.to_base64(salt),
    verifier: sodium.to_base64(Buffer.from(verifier))
  }
}