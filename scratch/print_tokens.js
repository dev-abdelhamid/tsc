const fs = require('fs');
try {
  const content = fs.readFileSync('scratch/test_tokens.json', 'utf16le');
  console.log('UTF-16 LE:', content);
} catch (e) {
  try {
    const content2 = fs.readFileSync('scratch/test_tokens.json', 'utf8');
    console.log('UTF-8:', content2);
  } catch (e2) {
    console.error(e2);
  }
}
