import { request } from '../request';

/**
 * Login
 *
 * @param username User name
 * @param password Password
 * @param captcha captcha
 */
export function fetchLogin(data: Api.Auth.LoginParams) {
  return request<Api.Auth.LoginToken>({
    url: '/core/common/login',
    method: 'post',
    data
  });
}

/** Get Captcha */
export function fetchGetCaptcha() {
  return request<Api.Auth.Captcha>({ url: '/core/common/captcha' });
}

/** Get PublicKey */
export function fetchGetPublicKey() {
  return request<Api.Auth.PublicKey>({ url: '/core/common/getPublicKey' });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/core/common/getUserInfo' });
}

/** Update Profile */
export function fetchUpdateProfile(data: Api.Auth.UpdateProfileParams) {
  return request<Api.Auth.UpdateProfileParams>({
    url: '/core/common/updateProfile',
    method: 'post',
    data
  });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}

// 上传文件
export function fetchUpload(data: FormData) {
  return request({
    url: '/core/attachment/upload',
    method: 'post',
    data,
    headers: {
      Accept: '*/*',
      'Content-Type': 'multipart/form-data'
    }
  });
}
