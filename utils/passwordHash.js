import argon2 from 'argon2';

// Function to hash a password
async function hashPassword(plainPassword) {
  try {
    const hash = await argon2.hash(plainPassword,
      {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
      }
    );

    return hash;
  } catch (err) {
    throw new Error('Error hashing password');
  }
}

// Function to verify a password against a hash
async function verifyPassword(hash, plainPassword) {
  try {
    if (await argon2.verify(hash, plainPassword)) {
      return true; // Password match
    } else {
      return false; // Password does not match
    }
  } catch (err) {
    throw new Error('Error verifying password');
  }
}

export { hashPassword, verifyPassword };