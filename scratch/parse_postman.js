const fs = require('fs');

const collection = JSON.parse(fs.readFileSync('cv.postman_collection.json', 'utf8'));

function findRequest(items, name) {
  for (const item of items) {
    if (item.name === name) {
      return item;
    }
    if (item.item) {
      const found = findRequest(item.item, name);
      if (found) return found;
    }
  }
  return null;
}

const getProfile = findRequest(collection.item, 'Profile');
if (getProfile) {
  console.log('GET Profile request/responses:');
  console.log(JSON.stringify(getProfile, null, 2));
}

const updateProfile = findRequest(collection.item, 'update Profile');
if (updateProfile) {
  console.log('POST update Profile request/responses:');
  console.log(JSON.stringify(updateProfile, null, 2));
}
