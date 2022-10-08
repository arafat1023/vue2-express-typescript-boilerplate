// To EXECUTE: run below command from this directory
// `node addUsers.mjs csvFiles/add-users-sample.csv`

/* eslint-disable import/extensions */
/* eslint-disable no-console */

import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csvtojson';
import { createRequire } from 'module';
import db from '../../db.js';

const require = createRequire(import.meta.url);
const json2csv = require('json2csv');
const fs = require('fs');
const UserService = require('../../modules/user/UserService').default;

let keys = [];
const errorList = [];

const DIR_NAME = path.dirname(fileURLToPath(import.meta.url));

async function addFriends() {
  await db();
  const fileName = process.argv[2];
  const filePath = path.join(DIR_NAME, fileName);
  const userData = await csv().fromFile(filePath);
  keys = Object.keys(userData[0]);

  let count = 0;

  for (const userDatum of userData) {
    try {
      const username = userDatum[keys[0].trim()];
      const firstName = userDatum[keys[1].trim()];
      const lastName = userDatum[keys[2].trim()];
      const password = userDatum[keys[3].trim()];

      const user = await UserService.createUser({
        username,
        firstName,
        lastName,
        password,
        isFirstLogin: true,
        isVerified: true, // set for testing purpose
      });

      console.log(`added user: ${user.username}`);
      count++;
    } catch (err) {
      console.error(err);
      errorList.push(userDatum);
    }
  }

  console.log('Users add count: ', count);
}

addFriends()
  .then(() => {
    json2csv.parseAsync(errorList)
      .then((csvData) => {
        fs.writeFileSync(path.join(DIR_NAME, 'errorList.csv'), csvData);
        process.exit();
      });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
