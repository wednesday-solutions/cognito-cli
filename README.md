# Cognito Cli
A cli to interact with your cognito user pool, create accounts, login, verify phone number, verify email, etc.

## Installation

Install using yarn

```
yarn global add aws-cognito-cli
```

Install using npm

```
npm install -g aws-cognito-cli
```
## Documentation

### Help

To get a list of commands and usage hints use

```
cognito-cli --help
```

### Commands

#### createConfig

    Create the config that will be used to perform various cognito functions

    Example
    cognito-cli createConfig --region=us-east-1 --givenName=mac \
        --lastName=mac --userPoolId=123 --userPoolWebClientId=123 \
        --mfaEnabled=true --email=mac@wednesday.is --password=123 \
        --phoneNumber=+10101001 --emailVerified=true --phoneVerified=false

#### getConfig

    Get the current configuration that will be used to perform various cognito functions
    
    Example
    cognito-cli getConfig


> For one off changes you can pass config args to any command. For example: cognito-cli signin --email=mac@wednesday.is --userPoolId=123


#### signin

    Use the current config to sign in and get tokens
    
    Example
    cognito-cli signin

#### signup

    Use the current config to create a new user
    
    Example
    cognito-cli signup
    
    
#### verifyEmail

    Verify the email in the config. 
    
    Example
    cognito-cli verifyEmail

    
    
#### verifyPhone

    Verify the phone in the config. 
    
    Example
    cognito-cli verifyPhone
    
    
#### forceVerify

    Force verify email, phone number attributes in cognito 
    
    Example
    cognito-cli forceVerify

#### enableMFA

    Enable MFA for the user.  
    
    Example
    cognito-cli enableMFA
