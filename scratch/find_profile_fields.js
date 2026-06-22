const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../cv.postman_collection.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

function findCompanyApps(items) {
  for (const item of items) {
    if (item.item) {
      findCompanyApps(item.item);
    } else if (item.request) {
      const url = item.request.url?.raw || '';
      if (url.includes('company/applications') && !url.includes('status')) {
        console.log('--- Request:', item.name, '---');
        console.log('Method:', item.request.method);
        console.log('URL:', url);
        if (item.response && item.response.length > 0) {
          console.log(`Found ${item.response.length} sample responses!`);
          item.response.forEach((res, index) => {
            console.log(`Sample ${index} status: ${res.status} (${res.code})`);
            console.log(`Sample ${index} Body:`, res.body ? res.body.substring(0, 1000) : 'no body');
          });
        } else {
          console.log('No sample responses found in Postman collection.');
        }
      }
    }
  }
}

findCompanyApps(content.item || []);
