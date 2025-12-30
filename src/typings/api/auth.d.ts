declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }

    interface LoginParams {
      username: string;
      password: string;
      captcha: string;
    }
    interface Captcha {
      captcha: string;
    }
    interface PublicKey {
      publicKey: string;
    }

    interface UserInfo {
      userId: string;
      username: string;
      roles: string[];
      buttons: string[];
    }
  }
}
