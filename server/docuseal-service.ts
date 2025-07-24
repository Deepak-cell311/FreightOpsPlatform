import axios from 'axios';

if (!process.env.DOCUSEAL_API_KEY) {
  throw new Error("DOCUSEAL_API_KEY environment variable must be set");
}

export interface DocuSealTemplate {
  id: string;
  name: string;
  fields: Array<{
    name: string;
    type: 'text' | 'signature' | 'date' | 'checkbox' | 'radio' | 'select';
    required: boolean;
    page: number;
  }>;
}

export interface DocuSealSubmission {
  id: string;
  templateId: string;
  status: 'pending' | 'completed' | 'declined' | 'expired';
  submitters: Array<{
    email: string;
    name: string;
    role: string;
    status: 'pending' | 'completed' | 'declined';
    signedAt?: Date;
  }>;
  documents: Array<{
    filename: string;
    url: string;
  }>;
  createdAt: Date;
  completedAt?: Date;
}

export interface DocumentSigningRequest {
  templateId: string;
  signers: Array<{
    email: string;
    name: string;
    role: string;
    fields?: { [key: string]: string };
  }>;
  subject?: string;
  message?: string;
  expiresIn?: number; // days
}

export class DocuSealService {
  private baseURL = 'https://api.docuseal.co';
  private headers = {
    'Authorization': `Bearer ${process.env.DOCUSEAL_API_KEY}`,
    'Content-Type': 'application/json',
  };

  async createTemplate(
    name: string,
    documentBuffer: Buffer,
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      page: number;
      coordinates: { x: number; y: number; width: number; height: number };
    }>
  ): Promise<DocuSealTemplate> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('document', new Blob([documentBuffer]), 'document.pdf');
      formData.append('fields', JSON.stringify(fields));

      const response = await axios.post(
        `${this.baseURL}/templates`,
        formData,
        {
          headers: {
            ...this.headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('DocuSeal template creation error:', error);
      throw new Error('Failed to create document template');
    }
  }

  async createSubmission(request: DocumentSigningRequest): Promise<DocuSealSubmission> {
    try {
      const response = await axios.post(
        `${this.baseURL}/submissions`,
        {
          template_id: request.templateId,
          submitters: request.signers.map(signer => ({
            email: signer.email,
            name: signer.name,
            role: signer.role,
            fields: signer.fields || {},
          })),
          subject: request.subject,
          message: request.message,
          expires_at: request.expiresIn ? 
            new Date(Date.now() + request.expiresIn * 24 * 60 * 60 * 1000).toISOString() : 
            undefined,
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('DocuSeal submission creation error:', error);
      throw new Error('Failed to create document submission');
    }
  }

  async getSubmission(submissionId: string): Promise<DocuSealSubmission> {
    try {
      const response = await axios.get(
        `${this.baseURL}/submissions/${submissionId}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('DocuSeal submission retrieval error:', error);
      throw new Error('Failed to retrieve submission');
    }
  }

  async getSubmissionStatus(submissionId: string): Promise<string> {
    const submission = await this.getSubmission(submissionId);
    return submission.status;
  }

  async downloadCompletedDocument(submissionId: string): Promise<Buffer> {
    try {
      const response = await axios.get(
        `${this.baseURL}/submissions/${submissionId}/download`,
        {
          headers: this.headers,
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('DocuSeal document download error:', error);
      throw new Error('Failed to download completed document');
    }
  }

  async cancelSubmission(submissionId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/submissions/${submissionId}`,
        { headers: this.headers }
      );
    } catch (error) {
      console.error('DocuSeal submission cancellation error:', error);
      throw new Error('Failed to cancel submission');
    }
  }

  async getTemplates(): Promise<DocuSealTemplate[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/templates`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('DocuSeal templates retrieval error:', error);
      throw new Error('Failed to retrieve templates');
    }
  }

  // Carrier onboarding document workflows
  async sendCarrierPacket(
    carrierName: string,
    carrierEmail: string,
    contactName: string,
    companyId: string
  ): Promise<DocuSealSubmission> {
    const request: DocumentSigningRequest = {
      templateId: 'carrier_packet_template', // This would be created in DocuSeal dashboard
      signers: [
        {
          email: carrierEmail,
          name: contactName,
          role: 'carrier',
          fields: {
            'carrier_name': carrierName,
            'contact_name': contactName,
            'date': new Date().toLocaleDateString(),
          },
        },
      ],
      subject: 'Carrier Agreement - FreightOps Pro',
      message: 'Please review and sign the carrier agreement to begin working with us.',
      expiresIn: 7,
    };

    return await this.createSubmission(request);
  }

  // Rate confirmation workflow
  async sendRateConfirmation(
    loadNumber: string,
    carrierEmail: string,
    carrierName: string,
    rate: number,
    pickupDate: Date,
    deliveryDate: Date,
    pickupAddress: string,
    deliveryAddress: string
  ): Promise<DocuSealSubmission> {
    const request: DocumentSigningRequest = {
      templateId: 'rate_confirmation_template',
      signers: [
        {
          email: carrierEmail,
          name: carrierName,
          role: 'carrier',
          fields: {
            'load_number': loadNumber,
            'carrier_name': carrierName,
            'rate': `$${rate.toFixed(2)}`,
            'pickup_date': pickupDate.toLocaleDateString(),
            'delivery_date': deliveryDate.toLocaleDateString(),
            'pickup_address': pickupAddress,
            'delivery_address': deliveryAddress,
          },
        },
      ],
      subject: `Rate Confirmation - Load ${loadNumber}`,
      message: 'Please review and sign the rate confirmation for this load.',
      expiresIn: 2,
    };

    return await this.createSubmission(request);
  }

  // Driver employment documents
  async sendDriverEmploymentPacket(
    driverName: string,
    driverEmail: string,
    position: string,
    startDate: Date,
    salary: number
  ): Promise<DocuSealSubmission> {
    const request: DocumentSigningRequest = {
      templateId: 'driver_employment_template',
      signers: [
        {
          email: driverEmail,
          name: driverName,
          role: 'employee',
          fields: {
            'driver_name': driverName,
            'position': position,
            'start_date': startDate.toLocaleDateString(),
            'salary': `$${salary.toFixed(2)}`,
          },
        },
      ],
      subject: 'Employment Agreement - FreightOps Pro',
      message: 'Please review and sign your employment agreement.',
      expiresIn: 7,
    };

    return await this.createSubmission(request);
  }
}

export const docuSealService = new DocuSealService();