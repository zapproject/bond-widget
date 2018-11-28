const A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const addressRe = /^Qm[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{44}$/
// Base58 Encoder/Decoder https://gist.github.com/diafygi/90a3e80ca1c2793220e5/
const to_b58 = function(B,A){var d=[],s="",i,j,c,n;for(i in B){j=0,c=B[i];s+=c||s.length^i?"":1;while(j in d||c){n=d[j];n=n?n*256+c:c;c=n/58|0;d[j]=n%58;j++}}while(j--)s+=A[d[j]];return s};
const from_b58 = function(S,A){var d=[],b=[],i,j,c,n;for(i in S){j=0,c=A.indexOf(S[i]);if(c<0)return undefined;c||b.length^i?i:b.push(0);while(j in d||c){n=d[j];n=n?n*58+c:c;c=n>>8;d[j]=n%256;j++}}while(j--)b.push(d[j]);return new Uint8Array(b)};

const hexToBytes = hex => {
  const bytes = []
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
  return bytes;
};

const bytesToHex = bytes => {
  const hex = [];
  for (let i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0x0F).toString(16));
  }
  return hex.join('');
};

export const bytesToAddress = (B) => {
  return to_b58([18, 32].concat(Array.from(B)), A);
};

export const addressToBytes = (S) => {
  return from_b58(S, A).slice(2);
};

export const hexToAddress = (H) => {
  return bytesToAddress(hexToBytes(H));
};

export const addressToHex = (S) => {
  return bytesToHex(addressToBytes(S));
}

export const isIpfsAddress = (value: string) => {
  return addressRe.test(value);
}