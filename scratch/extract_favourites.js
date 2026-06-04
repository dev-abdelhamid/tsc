const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFilePath = 'C:\\Users\\El mostafa\\.gemini\\antigravity-ide\\brain\\11af3844-c314-4b5e-887e-1eadf48305b1\\.system_generated\\logs\\transcript.jsonl';
const targetPath = path.join(__dirname, '..', 'app', '[locale]', 'dashboard', 'user', 'favourites', 'client.tsx');

async function extract() {
  const fileStream = fs.createReadStream(logFilePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;
    if (lineNumber === 778) { // 1-indexed line 778
      try {
        const parsed = JSON.parse(line);
        // Find write_to_file or check structure
        const toolCall = parsed.tool_calls?.[0];
        if (toolCall && toolCall.name === 'write_to_file') {
          const codeContent = toolCall.args.CodeContent;
          fs.writeFileSync(targetPath, codeContent, 'utf8');
          console.log(`Successfully extracted favourites client code to ${targetPath}`);
        } else {
          console.error("Line 778 did not contain write_to_file tool call", JSON.stringify(toolCall));
        }
      } catch (err) {
        console.error("Error parsing line 778 as JSON:", err);
      }
      break;
    }
  }
}

extract();
