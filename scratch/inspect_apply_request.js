const fs = require('fs');

const collection = JSON.parse(fs.readFileSync('cv.postman_collection.json', 'utf8'));

function scanItem(item) {
  if (item.item) {
    item.item.forEach(scanItem);
  } else if (item.request) {
    const url = item.request.url.raw || (item.request.url.path ? item.request.url.path.join('/') : '');
    const matches = url.toLowerCase().includes('apply');
    if (matches) {
      console.log('--- Request Name:', item.name);
      console.log('Method:', item.request.method);
      console.log('URL:', url);
      console.log('Headers:', JSON.stringify(item.request.header, null, 2));
      if (item.request.body) {
        console.log('Body Mode:', item.request.body.mode);
        if (item.request.body.raw) {
          console.log('Body Content:', item.request.body.raw);
        }
        if (item.request.body.formdata) {
          console.log('Formdata fields:');
          item.request.body.formdata.forEach(f => {
            console.log(`  ${f.key}: ${f.value || f.type}`);
          });
        }
      }
      console.log('Response examples count:', item.response ? item.response.length : 0);
      if (item.response && item.response.length > 0) {
        item.response.forEach((res, i) => {
          console.log(`  Response Example ${i + 1} Body:`, res.body ? res.body.slice(0, 1000) : 'none');
        });
      }
    }
  }
}

collection.item.forEach(scanItem);
