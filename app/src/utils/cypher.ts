
import crypto from 'crypto';
// Use simple caesar cipher to encrypt the url so it isn't user-readable. 

const alphabets =['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const alphabets13 = ['N','O','P','Q','R','S','T','U','V','W','X','Y','Z','A','B','C','D','E','F','G','H','I','J','K','L','M'];

export const encrypt = (val: string) => {
    var resultStr = [];
    for (const char of val){
        const index = alphabets.indexOf(char);
        if (index === -1) {
            resultStr.push(char);
        } else {
            resultStr.push(alphabets13[index]);
        }
    }
    return resultStr.join("");
};

export const decrypt = (val: string) => {
    var resultStr = [];
    for (const char of val){
        const index = alphabets13.indexOf(char);
        if (index === -1) {
            resultStr.push(char);
        } else {
            resultStr.push(alphabets[index]);
        }
    }
    return resultStr.join("");
  
};