import { request } from '../request';

/** get dict */
export function fetchGetDict() {
  return request({ url: '/core/common/getDict' });
}
export function fetchGetConfig() {
  return request({ url: '/core/common/getConfig' });
}
