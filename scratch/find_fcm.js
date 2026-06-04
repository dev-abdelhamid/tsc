const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../cv.postman_collection.json'), 'utf8'));

function scanItems(items) {
  for (const item of items) {
    if (item.item) {
      scanItems(item.item);
    } else if (item.request) {
      const url = item.request.url?.raw || '';
      const name = item.name || '';
      if (
        url.toLowerCase().includes('fcm') || 
        url.toLowerCase().includes('push') || 
        url.toLowerCase().includes('device') || 
        url.toLowerCase().includes('token') ||
        name.toLowerCase().includes('fcm') ||
        name.toLowerCase().includes('push') ||
        name.toLowerCase().includes('device')
      ) {
        console.log(`Match: ${name} -> ${url}`);
        if (item.request.body) {
          console.log(`  Body mode: ${item.request.body.mode}`);
          if (item.request.body.formdata) {
            console.log(`  Formdata:`, item.request.body.formdata.map(f => f.key));
          }
        }
      }
    }
  }
}

scanItems(data.item);
