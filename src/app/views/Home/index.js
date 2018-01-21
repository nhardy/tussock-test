// @flow

import React from 'react';
import { Helmet } from 'react-helmet';

import config from 'app/config';
import { makeTitle } from 'app/lib/social';
import DefaultLayout from 'app/layouts/Default';
import P from 'app/components/P';
import Chat from 'app/components/Chat';
import styles from './styles.styl';


const TITLE = 'Chat Application';
const DESCRIPTION = [
  'The webpage for a Tussock Innovation Programming Test.',
  'Developed by Nathan Hardy',
].join(' ');

const HomeView = () => (
  <DefaultLayout className={styles.root}>
    <Helmet>
      <title>{TITLE}</title>
      <meta property="og:title" content={makeTitle(TITLE)} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content={config.twitter.handle} />
      <meta name="twitter:title" content={makeTitle(TITLE)} />
      <meta name="twitter:description" content={DESCRIPTION} />
    </Helmet>
    <h1>Chat Application</h1>
    <P className={styles.paragraph}>
      This webpage is part of a Tussock Innovation Programming Test to build a severless chat Application
      {' '}
      using AWS S3 and AWS IoT MQTT.
    </P>
    <Chat />
  </DefaultLayout>
);

export default HomeView;
