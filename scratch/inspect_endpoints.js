const fs = require('fs');

const collection = JSON.parse(fs.readFileSync('cv.postman_collection.json', 'utf8'));

function scanItem(item) {
  if (item.item) {
    item.item.forEach(scanItem);
  } else if (item.request) {
    const method = item.request.method;
    const url = item.request.url.raw || (item.request.url.path ? item.request.url.path.join('/') : '');
    console.log(`${method} - ${item.name}: ${url}`);
  }
}

collection.item.forEach(scanItem);
