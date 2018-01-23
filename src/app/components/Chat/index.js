/* eslint-disable react/no-array-index-key */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { get } from 'lodash-es';

import config from 'app/config';
import { registerHandle, subscribe, messageOutgoing } from 'app/actions/mqtt';
import timeout from 'app/lib/timeout';
import styles from './styles.styl';


type Props = {
  handle: string,
  messages: Array<{ handle: string, message: string }>,
  registerHandle: (handle: string) => void,
  subscribe: (topic: string) => void,
  messageOutgoing: (topic: string, message: string) => void,
};

type State = {
  inflight: boolean,
};

@connect(state => ({
  handle: state.mqtt.handle,
  messages: get(state.mqtt.topics, [config.mqtt.topic], []),
}), { registerHandle, subscribe, messageOutgoing })
export default class Chat extends Component<Props, State> {
  state = {
    inflight: false,
  };

  componentDidMount() {
    this.props.subscribe(config.mqtt.topic);
  }

  pickHandle = () => {
    const valid = this._handle.checkValidity();
    valid && this.props.registerHandle(this._handle.value);
  };

  sendMessage = async () => {
    if (!this._message.checkValidity()) return;

    this.setState({ inflight: true });
    // Ideally this would return a Redux Thunk Promise to be awaited on
    // but for the purposes of this test, a delay will be simulated instead
    this.props.messageOutgoing(config.mqtt.topic, this._message.value);

    await timeout(150);
    this._message.value = '';
    this.setState({ inflight: false });
  };

  render() {
    const { handle, messages } = this.props;
    const { inflight } = this.state;

    return (
      <div className={styles.root}>
        {!handle && (
          <div className={styles.prompt}>
            <label className={styles.pick}>
              <span>Pick a handle:</span>
              <input type="text" pattern="[a-z0-9]{3,15}" ref={ref => (this._handle = ref)} />
            </label>
            <button onClick={this.pickHandle}>Join</button>
          </div>
        )}
        <div className={cx(styles.messages, { [styles.blurred]: !handle })}>
          {messages.map(({ handle: sender, message }, i) => (
            <div className={styles.message} key={i}>
              <span className={styles.sender}>{sender} says:</span>
              <span className={styles.content}>{message}</span>
            </div>
          ))}
        </div>
        <div className={cx(styles.draft, { [styles.blurred]: !handle })}>
          <span className={styles.user}>{handle || 'You'}:</span>
          <input type="text" pattern=".+" ref={ref => (this._message = ref)} disabled={inflight || !handle} />
          <button onClick={this.sendMessage} disabled={inflight || !handle}>Send</button>
        </div>
      </div>
    );
  }
}
