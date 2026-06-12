const fs = require('fs');

const collection = JSON.parse(fs.readFileSync('cv.postman_collection.json', 'utf8'));

const urls = new Set();
function scan(item) {
  if (item.item) {
    item.item.forEach(scan);
  } else if (item.request) {
    const url = item.request.url.raw || (item.request.url.path ? item.request.url.path.join('/') : '');
    urls.add(`${item.request.method} ${url}`);
  }
}

collection.item.forEach(scan);

console.log('Total URLs found:', urls.size);
Array.from(urls).filter(u => u.toLowerCase().includes('company') || u.toLowerCase().includes('profile')).forEach(u => {
  console.log(u);
});
