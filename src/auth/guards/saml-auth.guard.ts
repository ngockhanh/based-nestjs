import ssoConfig from '@/configs/sso.config';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class SamlAuthGuard extends AuthGuard('saml') {
  /**
   * @type {{ successRedirect: string; failureRedirect: string; }}
   */
  config: { successRedirect: string; failureRedirect: string; };

  /**
   * Creates an instance of SamlAuthGuard.
   */
  constructor() {
    super();
    this.config = ssoConfig();
  }

  /** @override */
  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions | undefined {
    const opts = super.getAuthenticateOptions(context) || {};
    const request = this.getRequest(context);
    const { origin } = request.query;

    if (origin) {
      const { failureRedirect, successRedirect } = this.config;
      opts.failureFlash = true;
      opts.failureRedirect = `${origin}/${failureRedirect}`;

      opts.additionalParams = {
        RelayState: `${origin}/${successRedirect}`,
      };
    }

    return opts;
  }
}
