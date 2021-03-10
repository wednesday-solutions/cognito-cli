import readline from 'readline';
import path, { dirname } from 'path';
import shell from 'shelljs';
import fs from 'fs';
import AWS from 'aws-sdk';
import AmplifySDK from 'aws-amplify';
import nodeFetch from 'node-fetch';
import { fileURLToPath } from 'url';
import _ from 'lodash';

const __dirname = dirname(fileURLToPath(import.meta.url));
global.fetch = nodeFetch.default;

const Amplify = AmplifySDK.default;

let config = {};
const configPath = path.resolve(__dirname, '../config.json');

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'us-east-1',
  apiVersion: '2016-04-18',
});

function getAuth() {
  Amplify.configure({
    Auth: {
      region: config.region,
      userPoolId: config.userPoolId,
      userPoolWebClientId: config.userPoolWebClientId,
      authenticationFlowType: config.authenticationFlowType,
    },
  });
  return Amplify.Auth;
}

const handleOnGetConfig = (callback, printConfig, data) => {
  if (printConfig) {
    console.log(config);
  }
  if (data) {
    config = JSON.parse(data);
  }

  if (callback) {
    callback(config);
  }

  if (typeof config === 'string') {
    return JSON.parse(config);
  }
};

export async function getConfig(callback, printConfig) {
  let readFile = fs.readFileSync;
  if (callback) {
    readFile = fs.readFile;
  }
  config = await readFile(
    configPath,
    {
      encoding: 'utf-8',
    },
    (err, data) => {
      handleOnGetConfig(callback, printConfig, data);
    },
  );
  return handleOnGetConfig(null, printConfig);
}

export function createConfig(args, dontWrite) {
  const newConfig = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const [k, value] = arg.toString().split('=');
    const key = k.replace('--', '');
    if (!k.includes('--') || !config.hasOwnProperty('region')) {
      return shell.echo(`Invalid arg ${key}`);
    }
    newConfig[key] = value;
  }
  config = { ...config, ...newConfig };
  if (!dontWrite) {
    fs.writeFileSync(configPath, JSON.stringify(config));
  }
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    }),
  );
}

export function signUp(args) {
  getAuth()
    .signUp({
      username: config.email,
      password: config.password,
      attributes: {
        email: config.email,
      },
    })
    .then(async user => {
      console.log(user);
      const OTP = await askQuestion('Please enter the email OTP\n');
      await user.user.confirmRegistration(OTP, false, (err, data) => {
        console.log({ err, data });
      });
    })
    .catch(e => {
      console.log({ e });
    });
}

export function signIn(args) {
  return getAuth()
    .signIn(config.email, config.password)
    .then(user => {
      user.getSession((error, data) => {
        if (!error) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(error);
        }
      });
      return user;
    })
    .catch(err => {
      console.log({ err });
    });
}

export async function verifyPhone(args) {
  const user = await signIn();
  await new Promise((resolve, reject) => {
    user.updateAttributes(
      [{ Name: 'phone_number', Value: config.phoneNumber }],
      (err, data) => {
        console.log({ err, data });
        user.getAttributeVerificationCode('phone_number', {
          onSuccess: async params => {
            console.log('params', params);
          },
          onFailure: err => {
            console.log({ err });
            reject(err);
          },
          inputVerificationCode: data => {
            console.log({ data });
            resolve();
          },
        });
      },
    );
  });

  const OTP = await askQuestion('Please enter the Phone OTP\n');
  await user.verifyAttribute('phone_number', OTP, {
    onSuccess: data => {
      console.log({ data });
    },
    onFailure: err => {
      console.log({ err });
    },
  });
}

export async function verifyEmail() {
  const user = await signIn();
  await new Promise((resolve, reject) => {
    user.getAttributeVerificationCode('email', {
      onSuccess: async params => {
        console.log('params', params);
      },
      onFailure: err => {
        console.log({ err });
        reject(err);
      },
      inputVerificationCode: data => {
        console.log({ data });
        resolve();
      },
    });
  });
  const OTP = await askQuestion('Please enter the email OTP\n');
  await user.verifyAttribute('email', OTP, {
    onSuccess: data => {
      console.log({ data });
    },
    onFailure: err => {
      console.log({ err });
    },
  });
}

export function smsMFA(args) {
  cognito
    .adminSetUserMFAPreference({
      Username: config.email,
      UserPoolId: config.userPoolId,
      SMSMfaSettings: { Enabled: config.mfaEnabled },
    })
    .promise()
    .then((data, err) => {
      console.log({ data, err });
    });
}

export function forceVerify(args) {
  cognito
    .adminUpdateUserAttributes({
      Username: config.email,
      UserPoolId: config.userPoolId,
      UserAttributes: [
        { Name: 'email_verified', Value: config.emailVerified.toString() },
        {
          Name: 'phone_number_verified',
          Value: config.phoneVerified.toString(),
        },
        { Name: 'email', Value: config.email },
        { Name: 'phone_number', Value: config.phoneNumber },
      ],
    })
    .promise()
    .then((data, err) => {
      if (!err) {
        console.log(`Force verified user ${config.email} successfully`);
      }
    });
}
