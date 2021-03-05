#! /usr/bin/env node
import _ from 'lodash';
import shell from 'shelljs';
import process from 'process';
import {
  getConfig,
  createConfig,
  forceVerify,
  signIn,
  signUp,
  smsMFA,
  verifyEmail,
  verifyPhone,
} from '../utils/index.mjs';

const args = process.argv.slice(2);
const commandLineArgs = args.toString().split(',');

if (!commandLineArgs[0]) {
  shell.exec(
    `echo Sorry! cognito-cli requires an argument to be passed. Run cognito-cli --help for more details`,
  );
} else {
  getConfig(() => handleCli(commandLineArgs));
}
const handleCli = cliArgs => {
  const strippedArgs = _.drop(cliArgs);
  createConfig(strippedArgs, true);
  switch (cliArgs[0]) {
    case 'signin':
      signIn(strippedArgs);
      break;
    case 'signup':
      signUp(strippedArgs);
      break;
    case 'verifyEmail':
      verifyEmail(strippedArgs);
      break;
    case 'verifyPhone':
      verifyPhone(strippedArgs);
      break;
    case 'forceVerify':
      forceVerify(strippedArgs);
      break;
    case 'enableMFA':
      smsMFA(strippedArgs);
      break;
    case 'createConfig':
      createConfig(strippedArgs);
      break;
    case 'getConfig':
      getConfig(null, true);
      break;
    case '--help':
      shell.echo(
        `\ncreateConfig` +
        `Create the config that will be used to perform various cognito functions\n\n` +
        `getConfig` +
        `Get the current configuration that will be used to perform various cognito functions\n\n` +
        `signin` +
        `Use the current config to sign in and get tokens\n\n` +
        `signup` +
        `Use the current config to create a new user\n\n` +
        `verifyEmail` +
        `Verify the email in the config.\n\n` +
        `verifyPhone` +
        `Verify the phone in the config. \n\n` +
        `forceVerify` +
        `Force verify email, phone number attributes in cognito \n\n` +
        `enableMFA` +
        `Enable MFA for the user.`,
      );
      break;
    default:
      shell.exec(`echo Sorry ${commandLineArgs[0]} is not a valid command`);
      break;
  }
};
