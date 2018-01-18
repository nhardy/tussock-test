// @flow

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { last } from 'lodash-es';
import Archiver from 'archiver';
import Application from 'azur';
import AWS from 'aws-sdk';
import { spawn } from 'child_process';
import fetch from 'isomorphic-fetch';
import mime from 'mime-types';

import { timeout } from './util';
import config from '../config';


export function zip(): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(path.join(__dirname, '..', '.tmp', 'app.zip'));
    const archive = new Archiver('zip', {
      zlib: { level: 9 },
    });
    output.on('close', () => resolve());
    archive.on('error', (error: Error) => {
      throw error;
    });
    archive.pipe(output);
    [
      'iisnode.yml',
      'LICENSE',
      'npm-shrinkwrap.json',
      'package.json',
      'README.md',
      'server.js',
    ].forEach((file) => {
      archive.file(path.join(__dirname, '..', file), { name: file });
    });
    glob(path.join(__dirname, '..', 'dist', '**', '*'), (err: ?Error, files: string[]) => {
      if (err) {
        reject(err);
        return;
      }

      files.forEach((file) => {
        archive.file(file, { name: path.join('dist', last(file.split('dist'))) });
      });

      archive.finalize();
    });
  });
}

export function deploy() {
  const app = new Application({
    appName: process.env.AZURE_APP_NAME,
    username: process.env.AZURE_GIT_USERNAME,
    password: process.env.AZURE_GIT_PASSWORD,
    gitName: 'Automated Deployments',
    gitEmail: 'noreply@nhardy.id.au',
  });

  return app.deploy({
    archiveFilePath: path.resolve(__dirname, '..', '.tmp', 'app.zip'),
  });
}

export async function deployToS3() {
  AWS.config.update({ region: process.env.AWS_REGION });
  const s3Service = new AWS.S3({ apiVersion: '2006-03-01' });
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: null,
    Body: null,
  };

  const indexHtml = await new Promise(async (resolve, reject) => {
    const server = spawn('node', ['server.js'], { cwd: path.resolve(__dirname, '..') });
    server.on('error', reject);
    let stopTrying = false;
    timeout(10000)
      .then(() => {
        stopTrying = true;
      });
    let result = null;
    while (!result && !stopTrying) {
      try {
        // eslint-disable-next-line no-await-in-loop
        result = await fetch(`http://localhost:${config.port}`)
          .then(raw => raw.text())
          .then((response) => {
            server.kill();
            resolve(response);
          });
      } catch (e) {
        // eslint-disable-next-line no-await-in-loop
        await timeout(150);
      }
    }

    if (result) {
      resolve(result);
    } else {
      reject(new Error('Could not get a response in time'));
    }
  });

  await s3Service.upload({
    ...uploadParams,
    Key: 'index.html',
    Body: indexHtml,
    ContentType: 'text/html',
  })
    .promise();

  await Promise.all((await new Promise((resolve, reject) => {
    glob(
      path.join(__dirname, '..', 'dist', '**', '*'),
      {
        ignore: ['server.js', 'webpackStats.json', 'webpack-dump-client.json'].map(file => path.join(__dirname, '..', 'dist', file)),
      },
      (err: ?Error, files: string[]) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(files.map(file => ({ local: file, remote: path.posix.join('static', last(file.split('dist'))) })));
      },
    );
  }))
    .map(({ local, remote }) => {
      console.log('[upload-to-s3] Uploading', local, 'to', remote);

      return s3Service.upload({
        ...uploadParams,
        Key: remote,
        Body: fs.createReadStream(local),
        ContentType: mime.lookup(local),
      })
        .promise();
    }));
}
