const fs = require('fs');

const collection = JSON.parse(fs.readFileSync('cv.postman_collection.json', 'utf8'));

function scanItem(item) {
  if (item.item) {
    item.item.forEach(scanItem);
  } else if (item.request) {
    const url = item.request.url.raw || (item.request.url.path ? item.request.url.path.join('/') : '');
    const matches = url.toLowerCase().includes('user') || url.toLowerCase().includes('admin');
    if (matches) {
      console.log('--- Request Name:', item.name);
      console.log('Method:', item.request.method);
      console.log('URL:', url);
      if (item.request.body) {
        console.log('Body Mode:', item.request.body.mode);
      }
    }
  }
}

collection.item.forEach(scanItem);
