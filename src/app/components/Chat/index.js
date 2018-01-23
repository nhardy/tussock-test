/* eslint-disable react/no-array-index-key */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { get, isEqual } from 'lodash-es';

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

  componentDidUpdate(prevProps: Props) {
    if (!isEqual(prevProps.messages, this.props.messages)) {
      this._messages.scrollTop = this._messages.scrollHeight;
    }
  }

  pickHandle = (e: Event) => {
    e.preventDefault();
    if (!this._handle.checkValidity()) return;
    this.props.registerHandle(this._handle.value);
    this._message.focus();
  };

  sendMessage = async (e) => {
    e.preventDefault();

    if (!this._message.checkValidity()) return;

    this.setState({ inflight: true });
    // Ideally this would return a Redux Thunk Promise to be awaited on
    // but for the purposes of this test, a delay will be simulated instead
    this.props.messageOutgoing(config.mqtt.topic, this._message.value);

    await timeout(150);
    this._message.value = '';
    this.setState({ inflight: false });
    this._message.focus();
  };

  render() {
    const { handle, messages } = this.props;
    const { inflight } = this.state;

    return (
      <div className={styles.root}>
        {!handle && (
          <form className={styles.prompt} onSubmit={this.pickHandle}>
            <label className={styles.pick}>
              <span className="col-form-label col-form-label-lg">Pick a handle:</span>
              <input type="text" className={cx('form-control', 'form-control-lg', styles.handle)} pattern="[a-z0-9]{3,15}" ref={ref => (this._handle = ref)} />
            </label>
            <button type="submit" className={cx('btn', 'btn-lg', 'btn-primary', styles.button)}>Join</button>
          </form>
        )}
        <div className={cx(styles.messages, { [styles.blurred]: !handle })} ref={ref => (this._messages = ref)}>
          {messages.map(({ handle: sender, message }, i) => (
            <div className={styles.message} key={i}>
              <span className={styles.sender}>{sender} says:</span>
              <span className={styles.content}>{message}</span>
            </div>
          ))}
        </div>
        <form className={cx(styles.messaging, { [styles.blurred]: !handle })} onSubmit={this.sendMessage}>
          <label className={styles.draft}>
            <span className="col-form-label col-form-label-lg">{handle || 'You'}:</span>
            <input type="text" className={cx('form-control', 'form-control-lg', styles.input)} pattern=".+" ref={ref => (this._message = ref)} disabled={inflight || !handle} />
          </label>
          <button type="submit" className={cx('btn', 'btn-lg', 'btn-primary', styles.button)} disabled={inflight || !handle}>Send</button>
        </form>
      </div>
    );
  }
}
