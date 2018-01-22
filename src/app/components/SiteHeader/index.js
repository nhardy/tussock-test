// @flow

import React, { Component } from 'react';
import { Link } from 'react-router';
import cx from 'classnames';

import config from 'app/config';
import throttle from 'app/lib/throttle';
import FontAwesome from 'app/components/FontAwesome';
import styles from './styles.styl';


const EVENTS = [
  'scroll',
  'resize',
];

type Props = {
  threshold: () => number,
  headerRef: (?HTMLElement) => void,
};

type State = {
  scrolled: boolean,
};

export default class SiteHeader extends Component<Props, State> {
  static defaultProps = {
    threshold: () => window.innerHeight / 3,
  };

  state = {
    scrolled: false,
  };

  componentDidMount() {
    this.update();
    EVENTS.forEach(event => window.addEventListener(event, this.update));
  }

  componentWillUnmount() {
    EVENTS.forEach(event => window.removeEventListener(event, this.update));
    this.update.cancel();
  }

  update = throttle(() => {
    this.setState({
      scrolled: window.scrollY > this.props.threshold(),
    });
  });

  render() {
    const { headerRef } = this.props;
    const { scrolled } = this.state;
    return (
      <header id="siteHeader" className={cx(styles.root, { [styles.scrolled]: scrolled })} ref={ref => headerRef(ref)}>
        <div className={cx(styles.wrapper)}>
          <label htmlFor="drawer" className={styles.hamburger}>
            <FontAwesome className="fa-bars" />
          </label>
          <Link to="/" className={styles.siteName}>{config.siteName}</Link>
          <nav className={styles.nav}>
            <ul className={styles.list}>
              <li className={styles.item}>
                <Link className={styles.link} to="/">Home</Link>
              </li>
              {/* <li className={styles.item}>
                <Link className={styles.link} to="/contact">Contact Me</Link>
              </li>
              <li className={styles.item}>
                <Link className={styles.link} to="/projects">Projects</Link>
              </li>
              <li className={styles.item}>
                <Link className={styles.link} to="/cv">Curriculum Vitæ</Link>
              </li>
              <li className={styles.item}>
                <Link className={styles.link} to="/govhack">GovHack</Link>
              </li> */}
            </ul>
          </nav>
        </div>
      </header>
    );
  }
}
