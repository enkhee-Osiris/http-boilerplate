import CryptoJS from 'crypto-js';

function hasher(input: string): { salt: string; hash: string } {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);

  const hashed = CryptoJS.PBKDF2(input, salt, {
    keySize: 512 / 32,
    iterations: 1000,
  }).toString(CryptoJS.enc.Hex);

  return { salt: salt.toString(CryptoJS.enc.Hex), hash: hashed };
}

function verifier(input: string, saltHex: string, hash: string): boolean {
  const salt = CryptoJS.enc.Hex.parse(saltHex);

  const hashed = CryptoJS.PBKDF2(input, salt, {
    keySize: 512 / 32,
    iterations: 1000,
  }).toString(CryptoJS.enc.Hex);

  return hashed === hash;
}

export { hasher, verifier };
