import axios from 'axios';

if (!process.env.TAX_BANDIT_API_KEY || !process.env.TAX_BANDIT_USER_TOKEN) {
  throw new Error("TAX_BANDIT_API_KEY and TAX_BANDIT_USER_TOKEN environment variables must be set");
}

export interface TaxBanditBusiness {
  EINorSSN: string;
  BusinessNm: string;
  TradeNm?: string;
  IsEIN: boolean;
  Email: string;
  ContactNm: string;
  Phone: string;
  PhoneExtn?: string;
  USAddress: {
    Address1: string;
    Address2?: string;
    City: string;
    State: string;
    ZipCd: string;
  };
}

export interface Recipient1099 {
  SequenceId: string;
  TINType: 'EIN' | 'SSN' | 'ATIN' | 'ITIN';
  TIN: string;
  FirstNm?: string;
  LastNm?: string;
  BusinessNm?: string;
  Email?: string;
  Phone?: string;
  IsForeign: boolean;
  USAddress?: {
    Address1: string;
    Address2?: string;
    City: string;
    State: string;
    ZipCd: string;
  };
  ForeignAddress?: {
    Address1: string;
    Address2?: string;
    City: string;
    ProvinceOrStateNm: string;
    Country: string;
    PostalCd: string;
  };
}

export interface Form1099NEC {
  SequenceId: string;
  Recipient: Recipient1099;
  NECFormData: {
    Rents: number;
    Royalties: number;
    OtherIncome: number;
    FedTaxWH: number;
    FishingBoatProceeds: number;
    MedHealthCarePymts: number;
    NonEmpComp: number;
    Substitute: number;
    CropInsurance: number;
    StateTaxWH: number;
    StateId: string;
    PayerStateNo?: string;
  };
}

export interface TaxBanditSubmission {
  SubmissionId: string;
  BusinessId: string;
  PayerRef: string;
  TaxYear: number;
  Status: 'Accepted' | 'Rejected' | 'Transmitted' | 'Pending' | 'InProgress';
  Forms: Form1099NEC[];
  CreatedTs: string;
  StatusTs: string;
  Errors?: Array<{
    Id: string;
    Name: string;
    Message: string;
  }>;
}

export class TaxBanditService {
  private baseURL = 'https://testapi.taxbandits.com/v1.7.1'; // Use production URL for live
  private headers = {
    'Auth': process.env.TAX_BANDIT_API_KEY!,
    'UserToken': process.env.TAX_BANDIT_USER_TOKEN!,
    'Content-Type': 'application/json',
  };

  async createBusiness(businessData: TaxBanditBusiness): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/Business/Create`,
        businessData,
        { headers: this.headers }
      );

      if (response.data.StatusCode === 200) {
        return response.data.BusinessId;
      } else {
        throw new Error(`Business creation failed: ${response.data.StatusMessage}`);
      }
    } catch (error) {
      console.error('Tax Bandit business creation error:', error);
      throw new Error('Failed to create business with Tax Bandit');
    }
  }

  async getBusiness(businessId: string): Promise<TaxBanditBusiness> {
    try {
      const response = await axios.get(
        `${this.baseURL}/Business/Get?BusinessId=${businessId}`,
        { headers: this.headers }
      );

      if (response.data.StatusCode === 200) {
        return response.data.Business;
      } else {
        throw new Error(`Business retrieval failed: ${response.data.StatusMessage}`);
      }
    } catch (error) {
      console.error('Tax Bandit business retrieval error:', error);
      throw new Error('Failed to retrieve business from Tax Bandit');
    }
  }

  async create1099NECForms(
    businessId: string,
    taxYear: number,
    forms: Form1099NEC[]
  ): Promise<TaxBanditSubmission> {
    try {
      const requestData = {
        BusinessId: businessId,
        PayerRef: `FreightOps-${Date.now()}`,
        TaxYear: taxYear,
        Forms: forms,
      };

      const response = await axios.post(
        `${this.baseURL}/Form1099NEC/Create`,
        requestData,
        { headers: this.headers }
      );

      if (response.data.StatusCode === 200) {
        return {
          SubmissionId: response.data.SubmissionId,
          BusinessId: businessId,
          PayerRef: requestData.PayerRef,
          TaxYear: taxYear,
          Status: response.data.Status,
          Forms: forms,
          CreatedTs: new Date().toISOString(),
          StatusTs: new Date().toISOString(),
        };
      } else {
        throw new Error(`1099-NEC creation failed: ${response.data.StatusMessage}`);
      }
    } catch (error) {
      console.error('Tax Bandit 1099-NEC creation error:', error);
      throw new Error('Failed to create 1099-NEC forms');
    }
  }

  async getSubmissionStatus(submissionId: string): Promise<TaxBanditSubmission> {
    try {
      const response = await axios.get(
        `${this.baseURL}/Form1099NEC/Status?SubmissionId=${submissionId}`,
        { headers: this.headers }
      );

      if (response.data.StatusCode === 200) {
        return response.data;
      } else {
        throw new Error(`Status retrieval failed: ${response.data.StatusMessage}`);
      }
    } catch (error) {
      console.error('Tax Bandit status retrieval error:', error);
      throw new Error('Failed to retrieve submission status');
    }
  }

  async transmitSubmission(submissionId: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseURL}/Form1099NEC/Transmit`,
        { SubmissionId: submissionId },
        { headers: this.headers }
      );

      return response.data.StatusCode === 200;
    } catch (error) {
      console.error('Tax Bandit transmission error:', error);
      throw new Error('Failed to transmit forms to IRS');
    }
  }

  async validateTIN(tin: string, tinType: 'EIN' | 'SSN' | 'ATIN' | 'ITIN'): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseURL}/TINMatching/RequestByEmail`,
        {
          TIN: tin,
          TINType: tinType,
        },
        { headers: this.headers }
      );

      return response.data.StatusCode === 200;
    } catch (error) {
      console.error('Tax Bandit TIN validation error:', error);
      return false;
    }
  }

  // Generate 1099-NEC for carrier payments
  async generate1099ForCarrier(
    businessId: string,
    taxYear: number,
    carrierData: {
      tin: string;
      tinType: 'EIN' | 'SSN';
      businessName?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      address: {
        address1: string;
        address2?: string;
        city: string;
        state: string;
        zipCode: string;
      };
      totalPayments: number;
      federalTaxWithheld?: number;
      stateTaxWithheld?: number;
      stateId?: string;
    }
  ): Promise<Form1099NEC> {
    const form1099NEC: Form1099NEC = {
      SequenceId: `CARRIER-${carrierData.tin}-${taxYear}`,
      Recipient: {
        SequenceId: `RCP-${carrierData.tin}`,
        TINType: carrierData.tinType,
        TIN: carrierData.tin,
        FirstNm: carrierData.firstName,
        LastNm: carrierData.lastName,
        BusinessNm: carrierData.businessName,
        Email: carrierData.email,
        Phone: carrierData.phone,
        IsForeign: false,
        USAddress: {
          Address1: carrierData.address.address1,
          Address2: carrierData.address.address2,
          City: carrierData.address.city,
          State: carrierData.address.state,
          ZipCd: carrierData.address.zipCode,
        },
      },
      NECFormData: {
        Rents: 0,
        Royalties: 0,
        OtherIncome: 0,
        FedTaxWH: carrierData.federalTaxWithheld || 0,
        FishingBoatProceeds: 0,
        MedHealthCarePymts: 0,
        NonEmpComp: carrierData.totalPayments,
        Substitute: 0,
        CropInsurance: 0,
        StateTaxWH: carrierData.stateTaxWithheld || 0,
        StateId: carrierData.stateId || '',
        PayerStateNo: '',
      },
    };

    return form1099NEC;
  }

  // Process year-end 1099s for all carriers
  async processYearEnd1099s(
    companyId: string,
    businessId: string,
    taxYear: number,
    carrierPayments: Array<{
      carrierId: string;
      carrierName: string;
      tin: string;
      tinType: 'EIN' | 'SSN';
      totalPayments: number;
      address: any;
      email?: string;
      phone?: string;
    }>
  ): Promise<TaxBanditSubmission[]> {
    const submissions: TaxBanditSubmission[] = [];

    // Process in batches of 50 (Tax Bandit limit)
    const batchSize = 50;
    for (let i = 0; i < carrierPayments.length; i += batchSize) {
      const batch = carrierPayments.slice(i, i + batchSize);
      
      const forms: Form1099NEC[] = [];
      for (const carrier of batch) {
        // Only create 1099 if payments >= $600
        if (carrier.totalPayments >= 600) {
          const form = await this.generate1099ForCarrier(businessId, taxYear, {
            tin: carrier.tin,
            tinType: carrier.tinType,
            businessName: carrier.carrierName,
            email: carrier.email,
            phone: carrier.phone,
            address: carrier.address,
            totalPayments: carrier.totalPayments,
          });
          forms.push(form);
        }
      }

      if (forms.length > 0) {
        const submission = await this.create1099NECForms(businessId, taxYear, forms);
        submissions.push(submission);
      }
    }

    return submissions;
  }
}

export const taxBanditService = new TaxBanditService();