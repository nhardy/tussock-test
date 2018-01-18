// @flow
/* eslint-disable no-console */

import yargs from 'yargs';

import clean from './clean';
import ensureCertificate from './certificate';
import serve from './serve';
import { webpackProd, webpackClientDev, webpackServerDev } from './webpack';
import { zip, deploy, deployToS3 } from './deploy';


function runTask(name, runner: () => Promise<any>) {
  return () => {
    console.log(`[${name}] Starting...`);
    return runner()
      .then(() => {
        console.log(`[${name}] Completed successfully.`);
      })
      .catch((error) => {
        console.error(`[${name}] Failed to complete. Reason:`);
        console.error(error);
        throw error;
      });
  };
}

function failOnError(error: Error) {
  if (error) {
    process.exitCode = 1;
  }
}

// `yargs` uses a getter function to execute
// eslint-disable-next-line no-unused-expressions
yargs.command('*', 'Informational message', () => {}, () => {
  console.log('Run `npm run dev` for the dev task'); // eslint-disable-line no-console
})
  .command('dev', 'Builds the application in development mode, starts the dev server and watches for changes', () => {}, () => {
    Promise.resolve()
      .then(runTask('clean', clean))
      .then(runTask('ensure-certificate', ensureCertificate))
      .then(runTask('webpack-client-dev', webpackClientDev))
      .then(runTask('wepack-server-dev', webpackServerDev))
      .then(runTask('serve', serve))
      .catch(failOnError);
  })
  .command('prod', 'Builds the application in production mode and starts the server', () => {}, () => {
    process.env.HTTPS_ORIGIN = 'true';
    Promise.resolve()
      .then(runTask('clean', clean))
      .then(runTask('ensure-certificate', ensureCertificate))
      .then(runTask('webpack-prod', webpackProd))
      .then(runTask('serve', serve))
      .catch(failOnError);
  })
  .command('build', 'Builds the application in production mode', () => {}, () => {
    Promise.resolve()
      .then(runTask('clean', clean))
      .then(runTask('ensure-certificate', ensureCertificate))
      .then(runTask('webpack-prod', webpackProd))
      .then(failOnError);
  })
  .command('package', 'Packages the pre-built application to a zip', () => {}, () => {
    Promise.resolve()
      .then(runTask('zip', zip))
      .catch(failOnError);
  })
  .command('deploy', 'Deploys the pre-built application to the Azure App Service', () => {}, () => {
    Promise.resolve()
      .then(runTask('deploy', deploy))
      .catch(failOnError);
  })
  .command('deployToS3', 'Deploys the pre-built application to AWS S3', () => {}, () => {
    Promise.resolve()
      .then(runTask('deployToS3', deployToS3))
      .catch(failOnError);
  })
  // .demandCommand()
  .help()
  .argv;
