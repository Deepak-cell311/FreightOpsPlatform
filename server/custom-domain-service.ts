import { db } from "./db";
import { companies } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface CustomDomainConfig {
  id: string;
  companyId: string;
  domain: string;
  subdomain?: string;
  isVerified: boolean;
  sslEnabled: boolean;
  invoicePortalEnabled: boolean;
  paymentPortalEnabled: boolean;
  brandingConfig: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    companyName: string;
  };
  dnsRecords: {
    type: string;
    name: string;
    value: string;
    status: 'pending' | 'verified' | 'failed';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export class CustomDomainService {
  
  async setupCustomDomain(companyId: string, domainConfig: {
    domain: string;
    subdomain?: string;
    enableInvoicePortal?: boolean;
    enablePaymentPortal?: boolean;
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
      accentColor?: string;
    };
  }): Promise<CustomDomainConfig> {
    try {
      // Get company details for branding
      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, companyId));

      if (!company) {
        throw new Error("Company not found");
      }

      // Generate DNS records for domain verification
      const dnsRecords = this.generateDNSRecords(domainConfig.domain, domainConfig.subdomain);

      const customDomain: CustomDomainConfig = {
        id: `domain_${Date.now()}`,
        companyId,
        domain: domainConfig.domain,
        subdomain: domainConfig.subdomain,
        isVerified: false,
        sslEnabled: false,
        invoicePortalEnabled: domainConfig.enableInvoicePortal || false,
        paymentPortalEnabled: domainConfig.enablePaymentPortal || false,
        brandingConfig: {
          logoUrl: domainConfig.branding?.logoUrl,
          primaryColor: domainConfig.branding?.primaryColor || '#2563eb',
          accentColor: domainConfig.branding?.accentColor || '#1d4ed8',
          companyName: company.name
        },
        dnsRecords,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Custom domain configuration created:', {
        domain: customDomain.domain,
        subdomain: customDomain.subdomain,
        company: company.name
      });

      return customDomain;
    } catch (error) {
      console.error("Error setting up custom domain:", error);
      throw new Error("Failed to setup custom domain");
    }
  }

  private generateDNSRecords(domain: string, subdomain?: string): CustomDomainConfig['dnsRecords'] {
    const targetDomain = subdomain ? `${subdomain}.${domain}` : domain;
    
    return [
      {
        type: 'CNAME',
        name: subdomain || '@',
        value: 'freightops-pro.replit.app',
        status: 'pending'
      },
      {
        type: 'TXT',
        name: '_freightops-verification',
        value: `freightops-verify=${Buffer.from(targetDomain).toString('base64')}`,
        status: 'pending'
      }
    ];
  }

  async verifyDomain(domainId: string): Promise<{ verified: boolean; sslReady: boolean }> {
    try {
      // In a real implementation, this would check DNS records
      // For demo purposes, we'll simulate verification
      console.log('Verifying domain:', domainId);
      
      // Simulate DNS verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        verified: true,
        sslReady: true
      };
    } catch (error) {
      console.error("Error verifying domain:", error);
      return {
        verified: false,
        sslReady: false
      };
    }
  }

  async generateInvoicePortalUrl(invoiceId: number, domainConfig: CustomDomainConfig): Promise<string> {
    const baseUrl = domainConfig.subdomain 
      ? `https://${domainConfig.subdomain}.${domainConfig.domain}`
      : `https://${domainConfig.domain}`;
    
    return `${baseUrl}/invoice/${invoiceId}`;
  }

  async generatePaymentPortalUrl(customerId: number, domainConfig: CustomDomainConfig): Promise<string> {
    const baseUrl = domainConfig.subdomain 
      ? `https://${domainConfig.subdomain}.${domainConfig.domain}`
      : `https://${domainConfig.domain}`;
    
    return `${baseUrl}/pay/${customerId}`;
  }

  async getCompanyDomains(companyId: string): Promise<CustomDomainConfig[]> {
    try {
      // In a real implementation, this would fetch from database
      // For demo purposes, return sample data
      return [
        {
          id: 'domain_1',
          companyId,
          domain: 'freightops.com',
          subdomain: 'billing',
          isVerified: true,
          sslEnabled: true,
          invoicePortalEnabled: true,
          paymentPortalEnabled: true,
          brandingConfig: {
            logoUrl: 'https://example.com/logo.png',
            primaryColor: '#2563eb',
            accentColor: '#1d4ed8',
            companyName: 'FreightOps Pro'
          },
          dnsRecords: [
            {
              type: 'CNAME',
              name: 'billing',
              value: 'freightops-pro.replit.app',
              status: 'verified'
            }
          ],
          createdAt: new Date('2024-06-01'),
          updatedAt: new Date('2024-06-01')
        }
      ];
    } catch (error) {
      console.error("Error fetching company domains:", error);
      return [];
    }
  }

  async updateDomainBranding(domainId: string, branding: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
  }): Promise<CustomDomainConfig> {
    try {
      // In a real implementation, this would update the database
      console.log('Updating domain branding:', { domainId, branding });
      
      // Return updated config for demo
      return {
        id: domainId,
        companyId: 'demo-company',
        domain: 'freightops.com',
        subdomain: 'billing',
        isVerified: true,
        sslEnabled: true,
        invoicePortalEnabled: true,
        paymentPortalEnabled: true,
        brandingConfig: {
          logoUrl: branding.logoUrl || 'https://example.com/logo.png',
          primaryColor: branding.primaryColor || '#2563eb',
          accentColor: branding.accentColor || '#1d4ed8',
          companyName: 'FreightOps Pro'
        },
        dnsRecords: [],
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error("Error updating domain branding:", error);
      throw new Error("Failed to update domain branding");
    }
  }

  async enableSSL(domainId: string): Promise<{ success: boolean; certificateInfo?: any }> {
    try {
      console.log('Enabling SSL for domain:', domainId);
      
      // Simulate SSL certificate provisioning
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        certificateInfo: {
          issuer: 'Let\'s Encrypt',
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          status: 'active'
        }
      };
    } catch (error) {
      console.error("Error enabling SSL:", error);
      return { success: false };
    }
  }

  async generateCustomerPortal(customerId: number, domainConfig: CustomDomainConfig): Promise<{
    portalUrl: string;
    features: string[];
  }> {
    const portalUrl = await this.generatePaymentPortalUrl(customerId, domainConfig);
    
    return {
      portalUrl,
      features: [
        'View and pay outstanding invoices',
        'Download invoice PDFs',
        'Update payment methods',
        'View payment history',
        'Set up auto-pay',
        'Access support chat'
      ]
    };
  }
}

export const customDomainService = new CustomDomainService();