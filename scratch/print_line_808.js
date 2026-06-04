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
    if (lineNumber === 808) {
      try {
        const parsed = JSON.parse(line);
        console.log("Tool name:", parsed.tool_calls[0].name);
        console.log("Args:", JSON.stringify(parsed.tool_calls[0].args, null, 2));
      } catch (err) {
        console.error("Error parsing JSON:", err);
      }
      break;
    }
  }
}

scan();
