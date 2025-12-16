const sodium = require('libsodium-wrappers');

// Ensure libsodium is initialized before using any API
async function encryptionKey(text, key) {
  await sodium.ready;

  // Generate a nonce of the required length (Uint8Array)
  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );

  const cipherText = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    Buffer.from(text),
    null, // additional data
    null, // secret data
    nonce,
    key
  );

  return {
    cipherText: Buffer.from(cipherText).toString('base64'),
    nonce: Buffer.from(nonce).toString('base64')
  };
}

async function decryptionKey(cipherTextB64, nonceB64, key) {
  await sodium.ready;

  const cipherText = Buffer.from(cipherTextB64, 'base64');
  const nonce = Buffer.from(nonceB64, 'base64');

  const decryptedText = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null, // secret data
    cipherText,
    null, // additional data
    nonce,
    key
  );

  return Buffer.from(decryptedText).toString('utf-8');
}

// Derive a fixed-length key from a text passphrase using Argon2id (crypto_pwhash)
// Returns a Uint8Array of length KEYBYTES suitable for XChaCha20-Poly1305
async function deriveKeyFromPassphrase(passphrase, salt = null) {
  await sodium.ready;

  const KEYBYTES = sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES;

  // Fallback to Node's scrypt KDF (synchronous) for broad compatibility
  const crypto = require('crypto');

  // Salt: 16 bytes. If not provided, derive deterministic salt from passphrase.
  let saltBuf;
  if (salt && typeof salt === 'string') {
    saltBuf = crypto.createHash('sha256').update(passphrase + salt).digest().subarray(0, 16);
  } else if (salt instanceof Uint8Array && salt.length === 16) {
    saltBuf = Buffer.from(salt);
  } else {
    saltBuf = crypto.createHash('sha256').update(passphrase).digest().subarray(0, 16);
  }

  // Use lighter params to avoid memory issues in constrained environments
  const keyBuf = crypto.scryptSync(passphrase, saltBuf, KEYBYTES, { N: 1 << 14, r: 8, p: 1 });
  return new Uint8Array(keyBuf);
}

module.exports = {
  encryptionKey,
  decryptionKey,
  deriveKeyFromPassphrase
};