const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../cv.postman_collection.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

function findRequests(items) {
  for (const item of items) {
    if (item.item) {
      findRequests(item.item);
    } else if (item.request) {
      const url = item.request.url?.raw || '';
      if (url.includes('profile')) {
        console.log('--- Request:', item.name, '---');
        console.log('Method:', item.request.method);
        console.log('URL:', url);
        if (item.request.body && item.request.body.formdata) {
          console.log('Form Fields:', item.request.body.formdata.map(f => `${f.key}: ${f.value}`));
        }
      }
    }
  }
}

findRequests(content.item || []);
