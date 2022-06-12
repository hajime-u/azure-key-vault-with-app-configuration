require('dotenv').config();
const appConfig = require('@azure/app-configuration');
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

const {APP_CONFIG_CONN_STRING, APP_CONFIG_KEY_NAME, KEY_VAULT_SECRET_NAME} = process.env;
if (typeof APP_CONFIG_CONN_STRING === 'undefined', typeof APP_CONFIG_KEY_NAME === 'undefined', typeof KEY_VAULT_SECRET_NAME === 'undefined') {
  console.log('Configure Environment Variables');
  process.exit(1);
}


const appConfConnStr = APP_CONFIG_CONN_STRING;
const appConfClient = new appConfig.AppConfigurationClient(appConfConnStr);
async function run() {
  let retrievedSetting = await appConfClient.getConfigurationSetting({
    key: APP_CONFIG_KEY_NAME
  });

  // get key vault url from app config value
  const kvUri = new URL(JSON.parse(retrievedSetting.value).uri);

  const credential = new DefaultAzureCredential();
  const kvClient = new SecretClient(kvUri.protocol + '//' + kvUri.hostname, credential);
  const secret = await kvClient.getSecret(KEY_VAULT_SECRET_NAME);
  console.log("secret: ", secret.value);
}

run().catch((err) => console.log("ERROR:", err));
