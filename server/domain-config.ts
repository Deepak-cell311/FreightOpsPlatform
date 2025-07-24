export interface DomainConfiguration {
  currentDomain: string;
  customDomain?: string;
  isCustomDomainActive: boolean;
  sslEnabled: boolean;
  redirectConfig: {
    redirectWww: boolean;
    forceHttps: boolean;
  };
}

export class DomainConfigService {
  private config: DomainConfiguration;

  constructor() {
    this.config = {
      currentDomain: process.env.CUSTOM_DOMAIN || 'freightopspro.replit.app',
      customDomain: process.env.CUSTOM_DOMAIN,
      isCustomDomainActive: !!process.env.CUSTOM_DOMAIN,
      sslEnabled: true,
      redirectConfig: {
        redirectWww: true,
        forceHttps: true
      }
    };
  }

  getCurrentDomain(): string {
    return this.config.customDomain || this.config.currentDomain;
  }

  getBaseUrl(): string {
    const domain = this.getCurrentDomain();
    const protocol = this.config.sslEnabled ? 'https' : 'http';
    return `${protocol}://${domain}`;
  }

  isUsingCustomDomain(): boolean {
    return this.config.isCustomDomainActive;
  }

  getConfig(): DomainConfiguration {
    return { ...this.config };
  }

  // Middleware to handle domain redirects
  handleDomainRedirects(req: any, res: any, next: any) {
    const host = req.get('host');
    const protocol = req.protocol;
    const targetDomain = this.getCurrentDomain();
    const isProduction = process.env.NODE_ENV === 'production';

    // Only apply redirects in production with custom domains
    if (!isProduction || !this.config.isCustomDomainActive) {
      return next();
    }

    // Force HTTPS if enabled and in production
    if (this.config.redirectConfig.forceHttps && protocol === 'http') {
      return res.redirect(301, `https://${host}${req.url}`);
    }

    // Handle www redirect
    if (this.config.redirectConfig.redirectWww) {
      if (host?.startsWith('www.') && !targetDomain.startsWith('www.')) {
        const newHost = host.replace('www.', '');
        return res.redirect(301, `${protocol}://${newHost}${req.url}`);
      }
    }

    next();
  }

  // Generate domain configuration for frontend
  getClientConfig() {
    return {
      domain: this.getCurrentDomain(),
      baseUrl: this.getBaseUrl(),
      isCustomDomain: this.isUsingCustomDomain(),
      sslEnabled: this.config.sslEnabled
    };
  }
}

export const domainConfig = new DomainConfigService();