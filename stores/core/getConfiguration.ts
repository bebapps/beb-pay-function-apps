import { AppConfigurationClient } from '@azure/app-configuration';
import ms from 'ms';

const client = new AppConfigurationClient(process.env.APP_CONFIGURATION_CONNECTION_STRING);
const checkForUpdatesEveryMs = ms('5 mins');

export interface Configuration {
  COSMOS_DB_CONNECTION_STRING: string;
  JWT_SIGNING_SECRET: string;
  SENDGRID_API_KEY: string;
  RESOURCES_STORAGE_ACCOUNT_CONNECTION_STRING: string;
}

let lastSentinelEtag: string | undefined;
let nextLoad: number = -1;
let currentConfiguration: Promise<Configuration> = loadConfiguration();

async function hasSentinelChanged() {
  if (!lastSentinelEtag) {
    return true;
  }
  const { statusCode } = await client.getConfigurationSetting(
    { key: '.sentinel', etag: lastSentinelEtag },
    { onlyIfChanged: true },
  );
  return statusCode === 200;
}

async function loadConfiguration(): Promise<Configuration> {
  const configuration = {} as Configuration;

  for await (const setting of client.listConfigurationSettings()) {
    if (setting.key === '.sentinel') {
      lastSentinelEtag = setting.etag;
      continue;
    }
    switch (setting.contentType) {
      case 'application/json': {
        configuration[setting.key] = JSON.parse(setting.value);
        break;
      }
      default: {
        configuration[setting.key] = setting.value;
        break;
      }
    }
  }

  return configuration;
}

export function getConfiguration(): Promise<Configuration> {
  const now = Date.now();

  if (nextLoad < now) {
    nextLoad = now + checkForUpdatesEveryMs;

    const previousConfiguration = currentConfiguration;
    currentConfiguration = hasSentinelChanged()
      .then((hasChanged) => {
        if (hasChanged) {
          return loadConfiguration();
        } else {
          return previousConfiguration;
        }
      })
      .catch((err) => {
        console.error(err);
        return previousConfiguration;
      });
  }

  return currentConfiguration;
}
