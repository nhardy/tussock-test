import React, { Component } from 'react';
import { connect } from 'redux';

import { subscribe, messageOutgoing } from 'app/actions/mqtt';
import styles from './styles.styl';


@connect(state => ({
  data: state.mqtt,
}), { subscribe, messageOutgoing })
export default class Chat extends Component<> {
  componentDidMount() {

  }

  render() {
    const { data } = this.props;
    return (
      <div className={styles.root}>
        <div />
      </div>
    );
  }
}
