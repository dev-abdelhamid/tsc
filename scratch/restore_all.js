const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFilePath = 'C:\\Users\\El mostafa\\.gemini\\antigravity-ide\\brain\\11af3844-c314-4b5e-887e-1eadf48305b1\\.system_generated\\logs\\transcript.jsonl';

function cleanViewFileOutput(content) {
  const lines = content.split('\n');
  const codeLines = [];
  let inCode = false;

  for (const line of lines) {
    if (line.startsWith('1: ')) {
      inCode = true;
    }
    if (inCode) {
      if (line.startsWith('The above content')) {
        break;
      }
      const match = line.match(/^(\d+):(?: (.*))?$/);
      if (match) {
        codeLines.push(match[2] || '');
      } else {
        // Just in case it's a wrapped line or similar
        codeLines.push(line);
      }
    }
  }
  return codeLines.join('\n');
}

async function restore() {
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

      // 1. app/[locale]/jobs/[id]/apply/page.tsx
      if (lineNumber === 694) {
        const codeContent = parsed.tool_calls[0].args.CodeContent;
        const targetPath = path.join(__dirname, '..', 'app', '[locale]', 'jobs', '[id]', 'apply', 'page.tsx');
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        // The codeContent is a JSON string, let's parse it if it was doubly-encoded
        let finalCode = codeContent;
        if (codeContent.startsWith('"') && codeContent.endsWith('"')) {
          try {
            finalCode = JSON.parse(codeContent);
          } catch (e) {}
        }
        fs.writeFileSync(targetPath, finalCode, 'utf8');
        console.log(`Restored apply/page.tsx from line ${lineNumber}`);
      }

      // 2. app/[locale]/dashboard/company/jobs/[id]/applications/[applicationId]/page.tsx
      if (lineNumber === 803) {
        const content = parsed.content;
        const cleaned = cleanViewFileOutput(content);
        const targetPath = path.join(__dirname, '..', 'app', '[locale]', 'dashboard', 'company', 'jobs', '[id]', 'applications', '[applicationId]', 'page.tsx');
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, cleaned, 'utf8');
        console.log(`Restored company/jobs/.../page.tsx from line ${lineNumber}`);
      }

      // 3. features/company-jobs/components/company-application-actions.tsx
      if (lineNumber === 805) {
        const content = parsed.content;
        const cleaned = cleanViewFileOutput(content);
        const targetPath = path.join(__dirname, '..', 'features', 'company-jobs', 'components', 'company-application-actions.tsx');
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, cleaned, 'utf8');
        console.log(`Restored company-application-actions.tsx from line ${lineNumber}`);
      }
    } catch (err) {
      console.error(`Error at line ${lineNumber}:`, err);
    }
  }
}

restore();
