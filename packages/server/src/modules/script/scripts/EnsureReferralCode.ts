/* eslint-disable no-console */
import chalk from 'chalk';
import UserModel from '../../user/UserModel';
import UniqueCodeService from '../../uniqueCode/UniqueCodeService';

module.exports = async function run() {
  const users = await UserModel.BaseModel.find({ referralCode: undefined });

  let i = 0;
  for (const user of users) {
    user.set('referralCode', await UniqueCodeService.getForUser());
    await user.save();
    i++;
  }

  console.log(chalk.blue(`Set referral codes for ${i} users`));
};
