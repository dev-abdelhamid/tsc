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
    try {
      const parsed = JSON.parse(line);
      const toolCalls = parsed.tool_calls || [];
      for (const call of toolCalls) {
        const targetFile = call.args.TargetFile || call.args.AbsolutePath;
        if (targetFile && targetFile.toLowerCase().includes('favourites/client.tsx')) {
          console.log(`Line ${lineNumber}: tool=${call.name}, truncated=${line.includes('truncated')}`);
        }
      }
      if (line.toLowerCase().includes('favourites/client.tsx') && toolCalls.length === 0) {
        console.log(`Line ${lineNumber} mentions without tool call, type=${parsed.type}, source=${parsed.source}, truncated=${line.includes('truncated')}`);
      }
    } catch (err) {
      // ignore
    }
  }
}

scan();
