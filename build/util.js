// @flow
/* eslint-disable import/prefer-default-export */

/**
 * Returns a Promise which resolves after the {@code delay} in milliseconds
 * @param {Number} delay Delay in milliseconds
 * @returns Promise
 */
export function timeout(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
