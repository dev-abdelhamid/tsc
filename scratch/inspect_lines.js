const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\El mostafa\\.gemini\\antigravity-ide\\brain\\11af3844-c314-4b5e-887e-1eadf48305b1\\.system_generated\\logs\\transcript.jsonl';

async function scan() {
  const fileStream = fs.createReadStream(logFilePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;
    if (lineNumber === 802 || lineNumber === 803 || lineNumber === 804 || lineNumber === 805 || lineNumber === 694 || lineNumber === 695) {
      console.log(`--- Line ${lineNumber} ---`);
      try {
        const parsed = JSON.parse(line);
        console.log(`Source: ${parsed.source}, Type: ${parsed.type}, Status: ${parsed.status}`);
        if (parsed.content) {
          console.log(`Content prefix: ${parsed.content.substring(0, 200)}...`);
        }
        if (parsed.tool_calls) {
          console.log(`Tool Calls: ${JSON.stringify(parsed.tool_calls).substring(0, 200)}...`);
        }
      } catch (err) {
        console.log("Error parsing JSON:", err.message);
      }
    }
  }
}

scan();
