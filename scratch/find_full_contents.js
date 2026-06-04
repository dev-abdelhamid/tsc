const fs = require('fs');
const readline = require('readline');

const logFilePath = 'C:\\Users\\El mostafa\\.gemini\\antigravity-ide\\brain\\11af3844-c314-4b5e-887e-1eadf48305b1\\.system_generated\\logs\\transcript.jsonl';

const emptyFiles = [
  'app/[locale]/dashboard/company/jobs/[id]/applications/[applicationId]/page.tsx',
  'app/[locale]/jobs/[id]/apply/page.tsx',
  'features/company-jobs/components/company-application-actions.tsx'
];

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
        if (call.name === 'write_to_file') {
          const targetFile = call.args.TargetFile;
          if (targetFile) {
            const normalizedTarget = targetFile.replace(/\\+/g, '/').toLowerCase();
            const matched = emptyFiles.find(ef => normalizedTarget.includes(ef.toLowerCase()));
            if (matched) {
              const isTruncated = line.includes('truncated');
              console.log(`Line ${lineNumber} writes to ${matched}. Truncated in log? ${isTruncated}. Content length: ${call.args.CodeContent?.length}`);
            }
          }
        }
      }
    } catch (err) {
      // ignore parse errors
    }
  }
}

scan();
