import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// EDI X12 Transaction Sets for Transportation Industry
export class EDIService {
  private companyInfo: any;
  private sequenceNumber: number = 1;

  constructor(companyInfo: any) {
    this.companyInfo = companyInfo;
  }

  // Generate EDI 204 - Motor Carrier Load Tender
  generateEDI204(loadData: any): string {
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const currentTime = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const controlNumber = this.getNextControlNumber();

    const segments = [
      // ISA - Interchange Control Header
      `ISA*00*          *00*          *ZZ*${this.companyInfo.scac.padEnd(15)}*ZZ*${loadData.carrier.scac.padEnd(15)}*${currentDate}*${currentTime}*U*00401*${controlNumber.toString().padStart(9, '0')}*0*P*>`,
      
      // GS - Functional Group Header
      `GS*SM*${this.companyInfo.scac}*${loadData.carrier.scac}*${currentDate}*${currentTime}*${controlNumber}*X*004010`,
      
      // ST - Transaction Set Header
      `ST*204*${controlNumber.toString().padStart(4, '0')}`,
      
      // B2 - Beginning Segment for Shipment Information Transaction
      `B2*${loadData.shipmentMethod || ''}*${loadData.loadNumber}*${loadData.scac || ''}`,
      
      // B2A - Set Purpose
      `B2A*${loadData.purpose || '00'}`,
      
      // L11 - Business Instructions and Reference Number
      `L11*${loadData.loadNumber}*BM`,
      
      // MS3 - Interline Information
      `MS3*${this.companyInfo.scac}*B*U`,
      
      // AT5 - Bill of Lading Handling Requirements
      `AT5*B*A`,
      
      // G62 - DateTime
      `G62*38*${loadData.pickupDate.replace(/-/g, '')}*${loadData.pickupTime || '0800'}`,
      `G62*10*${loadData.deliveryDate.replace(/-/g, '')}*${loadData.deliveryTime || '1700'}`,
      
      // AT8 - Shipment Weight, Packaging and Quantity Data
      `AT8*G*${loadData.weight || '0'}*LB`,
      
      // LAD - Lading Detail
      `LAD*A*${loadData.pieces || '1'}*${loadData.packageType || 'PLT'}`,
      
      // AT9 - Trailer or Container Dimension and Weight
      `AT9*${loadData.equipmentType || 'TL'}*${loadData.equipmentLength || '53'}*F`,
      
      // PLD - Pallet Information
      `PLD*${loadData.palletCount || '1'}*${loadData.palletType || 'PLT'}`,
      
      // N1 Loop - Name Segments for each party
      // Shipper
      `N1*SH*${loadData.shipper.name}*93*${loadData.shipper.code || ''}`,
      `N3*${loadData.shipper.address}`,
      `N4*${loadData.shipper.city}*${loadData.shipper.state}*${loadData.shipper.zip}`,
      `G61*IC*${loadData.shipper.contact}*TE*${loadData.shipper.phone}`,
      
      // Consignee
      `N1*CN*${loadData.consignee.name}*93*${loadData.consignee.code || ''}`,
      `N3*${loadData.consignee.address}`,
      `N4*${loadData.consignee.city}*${loadData.consignee.state}*${loadData.consignee.zip}`,
      `G61*IC*${loadData.consignee.contact}*TE*${loadData.consignee.phone}`,
      
      // Bill To
      `N1*BT*${loadData.billTo.name}*93*${loadData.billTo.code || ''}`,
      `N3*${loadData.billTo.address}`,
      `N4*${loadData.billTo.city}*${loadData.billTo.state}*${loadData.billTo.zip}`,
      
      // Origin Stop
      `S5*1*CL*${loadData.shipper.appointmentNumber || ''}*${loadData.pickupDate.replace(/-/g, '')}*${loadData.pickupTime || '0800'}`,
      
      // Destination Stop
      `S5*2*CU*${loadData.consignee.appointmentNumber || ''}*${loadData.deliveryDate.replace(/-/g, '')}*${loadData.deliveryTime || '1700'}`,
      
      // LX - Assigned Number for Load Detail
      `LX*1`,
      
      // L5 - Description, Marks and Numbers
      `L5*1*${loadData.description || 'FREIGHT'}*${loadData.hazmat || 'N'}`,
      
      // L0 - Line Item - Quantity and Weight
      `L0*1*${loadData.weight || '0'}*LB*${loadData.pieces || '1'}*${loadData.packageType || 'PLT'}`,
      
      // SE - Transaction Set Trailer
      `SE*${(segments.length + 2).toString()}*${controlNumber.toString().padStart(4, '0')}`,
      
      // GE - Group Control Trailer
      `GE*1*${controlNumber}`,
      
      // IEA - Interchange Control Trailer
      `IEA*1*${controlNumber.toString().padStart(9, '0')}`
    ];

    return segments.join('~') + '~';
  }

  // Generate EDI 214 - Transportation Carrier Shipment Status Message
  generateEDI214(statusData: any): string {
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const currentTime = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const controlNumber = this.getNextControlNumber();

    const segments = [
      // ISA - Interchange Control Header
      `ISA*00*          *00*          *ZZ*${this.companyInfo.scac.padEnd(15)}*ZZ*${statusData.broker.scac.padEnd(15)}*${currentDate}*${currentTime}*U*00401*${controlNumber.toString().padStart(9, '0')}*0*P*>`,
      
      // GS - Functional Group Header
      `GS*QM*${this.companyInfo.scac}*${statusData.broker.scac}*${currentDate}*${currentTime}*${controlNumber}*X*004010`,
      
      // ST - Transaction Set Header
      `ST*214*${controlNumber.toString().padStart(4, '0')}`,
      
      // B10 - Beginning Segment for Transportation Carrier Shipment Status Message
      `B10*${statusData.loadNumber}*${statusData.scac || ''}*${statusData.statusCode}`,
      
      // L11 - Business Instructions and Reference Number
      `L11*${statusData.loadNumber}*BM`,
      
      // MS3 - Interline Information
      `MS3*${this.companyInfo.scac}*${statusData.standardCarrierAlphaCode || 'B'}*U`,
      
      // N1 - Name
      `N1*SF*${statusData.shipper.name}`,
      `N4*${statusData.shipper.city}*${statusData.shipper.state}*${statusData.shipper.zip}`,
      
      // AT7 - Shipment Status Details
      `AT7*${statusData.statusCode}*${statusData.statusReason || ''}*${statusData.statusDate.replace(/-/g, '')}*${statusData.statusTime || ''}*${statusData.timeZone || 'ET'}`,
      
      // MS1 - Equipment, Shipment, or Real Property Location
      `MS1*${statusData.location.city}*${statusData.location.state}*${statusData.location.country || 'US'}`,
      
      // SE - Transaction Set Trailer
      `SE*${(segments.length + 2).toString()}*${controlNumber.toString().padStart(4, '0')}`,
      
      // GE - Group Control Trailer
      `GE*1*${controlNumber}`,
      
      // IEA - Interchange Control Trailer
      `IEA*1*${controlNumber.toString().padStart(9, '0')}`
    ];

    return segments.join('~') + '~';
  }

  // Generate EDI 210 - Motor Carrier Freight Details and Invoice
  generateEDI210(invoiceData: any): string {
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const currentTime = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const controlNumber = this.getNextControlNumber();

    const segments = [
      // ISA - Interchange Control Header
      `ISA*00*          *00*          *ZZ*${this.companyInfo.scac.padEnd(15)}*ZZ*${invoiceData.customer.scac.padEnd(15)}*${currentDate}*${currentTime}*U*00401*${controlNumber.toString().padStart(9, '0')}*0*P*>`,
      
      // GS - Functional Group Header
      `GS*FR*${this.companyInfo.scac}*${invoiceData.customer.scac}*${currentDate}*${currentTime}*${controlNumber}*X*004010`,
      
      // ST - Transaction Set Header
      `ST*210*${controlNumber.toString().padStart(4, '0')}`,
      
      // B3 - Beginning Segment for Carriers Invoice
      `B3*${invoiceData.invoiceNumber}*${invoiceData.shipmentMethodOfPayment || 'PP'}*${invoiceData.loadNumber}*${invoiceData.scac || ''}*${invoiceData.invoiceDate.replace(/-/g, '')}`,
      
      // C3 - Currency
      `C3*USD`,
      
      // ITD - Terms of Sale/Deferred Terms of Sale
      `ITD*01****${invoiceData.paymentTerms || '30'}`,
      
      // N1 Loop - Name segments
      // Bill To
      `N1*BT*${invoiceData.billTo.name}*93*${invoiceData.billTo.code || ''}`,
      `N3*${invoiceData.billTo.address}`,
      `N4*${invoiceData.billTo.city}*${invoiceData.billTo.state}*${invoiceData.billTo.zip}`,
      
      // Remit To
      `N1*RT*${this.companyInfo.name}*93*${this.companyInfo.code || ''}`,
      `N3*${this.companyInfo.address}`,
      `N4*${this.companyInfo.city}*${this.companyInfo.state}*${this.companyInfo.zip}`,
      
      // G62 - DateTime
      `G62*86*${invoiceData.pickupDate.replace(/-/g, '')}`,
      `G62*07*${invoiceData.deliveryDate.replace(/-/g, '')}`,
      
      // LX - Assigned Number
      `LX*1`,
      
      // L5 - Description, Marks and Numbers
      `L5*1*${invoiceData.commodityDescription || 'FREIGHT'}`,
      
      // L0 - Line Item - Quantity and Weight
      `L0*1*${invoiceData.weight || '0'}*LB*${invoiceData.pieces || '1'}`,
      
      // L1 - Rate and Charges
      `L1*1*${invoiceData.linehaul || '0'}*FR*${invoiceData.rate || '0'}`,
      
      // L3 - Total Weight and Charges
      `L3*${invoiceData.weight || '0'}*LB****${invoiceData.totalCharges}`,
      
      // SE - Transaction Set Trailer
      `SE*${(segments.length + 2).toString()}*${controlNumber.toString().padStart(4, '0')}`,
      
      // GE - Group Control Trailer
      `GE*1*${controlNumber}`,
      
      // IEA - Interchange Control Trailer
      `IEA*1*${controlNumber.toString().padStart(9, '0')}`
    ];

    return segments.join('~') + '~';
  }

  // Parse incoming EDI 204 Load Tender
  parseEDI204(ediContent: string): any {
    const segments = ediContent.split('~');
    const loadData: any = {
      shipper: {},
      consignee: {},
      billTo: {},
      stops: []
    };

    let currentEntity = '';
    
    for (const segment of segments) {
      const elements = segment.split('*');
      const segmentId = elements[0];

      switch (segmentId) {
        case 'B2':
          loadData.shipmentMethod = elements[1];
          loadData.loadNumber = elements[2];
          loadData.scac = elements[3];
          break;

        case 'L11':
          if (elements[2] === 'BM') {
            loadData.billOfLading = elements[1];
          }
          break;

        case 'G62':
          if (elements[1] === '38') { // Pickup date
            loadData.pickupDate = this.formatEDIDate(elements[2]);
            loadData.pickupTime = elements[3];
          } else if (elements[1] === '10') { // Delivery date
            loadData.deliveryDate = this.formatEDIDate(elements[2]);
            loadData.deliveryTime = elements[3];
          }
          break;

        case 'AT8':
          loadData.weight = elements[2];
          loadData.weightUnit = elements[3];
          break;

        case 'N1':
          currentEntity = elements[1];
          const entityName = elements[2];
          if (currentEntity === 'SH') {
            loadData.shipper.name = entityName;
            loadData.shipper.code = elements[4];
          } else if (currentEntity === 'CN') {
            loadData.consignee.name = entityName;
            loadData.consignee.code = elements[4];
          } else if (currentEntity === 'BT') {
            loadData.billTo.name = entityName;
            loadData.billTo.code = elements[4];
          }
          break;

        case 'N3':
          if (currentEntity === 'SH') {
            loadData.shipper.address = elements[1];
          } else if (currentEntity === 'CN') {
            loadData.consignee.address = elements[1];
          } else if (currentEntity === 'BT') {
            loadData.billTo.address = elements[1];
          }
          break;

        case 'N4':
          if (currentEntity === 'SH') {
            loadData.shipper.city = elements[1];
            loadData.shipper.state = elements[2];
            loadData.shipper.zip = elements[3];
          } else if (currentEntity === 'CN') {
            loadData.consignee.city = elements[1];
            loadData.consignee.state = elements[2];
            loadData.consignee.zip = elements[3];
          } else if (currentEntity === 'BT') {
            loadData.billTo.city = elements[1];
            loadData.billTo.state = elements[2];
            loadData.billTo.zip = elements[3];
          }
          break;

        case 'L5':
          loadData.description = elements[2];
          loadData.hazmat = elements[3];
          break;
      }
    }

    return loadData;
  }

  // Parse incoming EDI 214 Status Update
  parseEDI214(ediContent: string): any {
    const segments = ediContent.split('~');
    const statusData: any = {
      location: {}
    };

    for (const segment of segments) {
      const elements = segment.split('*');
      const segmentId = elements[0];

      switch (segmentId) {
        case 'B10':
          statusData.loadNumber = elements[1];
          statusData.scac = elements[2];
          statusData.statusCode = elements[3];
          break;

        case 'AT7':
          statusData.statusCode = elements[1];
          statusData.statusReason = elements[2];
          statusData.statusDate = this.formatEDIDate(elements[3]);
          statusData.statusTime = elements[4];
          statusData.timeZone = elements[5];
          break;

        case 'MS1':
          statusData.location.city = elements[1];
          statusData.location.state = elements[2];
          statusData.location.country = elements[3];
          break;
      }
    }

    return statusData;
  }

  // Validate EDI structure
  validateEDI(ediContent: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const segments = ediContent.split('~');

    // Check for required envelope segments
    const hasISA = segments.some(s => s.startsWith('ISA'));
    const hasGS = segments.some(s => s.startsWith('GS'));
    const hasST = segments.some(s => s.startsWith('ST'));
    const hasSE = segments.some(s => s.startsWith('SE'));
    const hasGE = segments.some(s => s.startsWith('GE'));
    const hasIEA = segments.some(s => s.startsWith('IEA'));

    if (!hasISA) errors.push('Missing ISA segment');
    if (!hasGS) errors.push('Missing GS segment');
    if (!hasST) errors.push('Missing ST segment');
    if (!hasSE) errors.push('Missing SE segment');
    if (!hasGE) errors.push('Missing GE segment');
    if (!hasIEA) errors.push('Missing IEA segment');

    // Check segment count in SE
    const seSegment = segments.find(s => s.startsWith('SE'));
    if (seSegment) {
      const expectedCount = parseInt(seSegment.split('*')[1]);
      const actualCount = segments.length - 4; // Exclude envelope segments
      if (expectedCount !== actualCount) {
        errors.push(`Segment count mismatch: expected ${expectedCount}, got ${actualCount}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate acknowledgment (997 Functional Acknowledgment)
  generateEDI997(originalEDI: string, accepted: boolean = true): string {
    const segments = originalEDI.split('~');
    const isaSegment = segments.find(s => s.startsWith('ISA'));
    const gsSegment = segments.find(s => s.startsWith('GS'));
    const stSegment = segments.find(s => s.startsWith('ST'));

    if (!isaSegment || !gsSegment || !stSegment) {
      throw new Error('Invalid EDI structure for acknowledgment');
    }

    const isaElements = isaSegment.split('*');
    const gsElements = gsSegment.split('*');
    const stElements = stSegment.split('*');

    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const currentTime = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    const controlNumber = this.getNextControlNumber();

    const ackSegments = [
      // ISA - Interchange Control Header (reversed sender/receiver)
      `ISA*00*          *00*          *ZZ*${isaElements[7]}*ZZ*${isaElements[6]}*${currentDate}*${currentTime}*U*00401*${controlNumber.toString().padStart(9, '0')}*0*P*>`,
      
      // GS - Functional Group Header
      `GS*FA*${gsElements[3]}*${gsElements[2]}*${currentDate}*${currentTime}*${controlNumber}*X*004010`,
      
      // ST - Transaction Set Header
      `ST*997*${controlNumber.toString().padStart(4, '0')}`,
      
      // AK1 - Functional Group Response Header
      `AK1*${gsElements[1]}*${gsElements[6]}`,
      
      // AK2 - Transaction Set Response Header
      `AK2*${stElements[1]}*${stElements[2]}`,
      
      // AK5 - Transaction Set Response Trailer
      `AK5*${accepted ? 'A' : 'R'}`,
      
      // AK9 - Functional Group Response Trailer
      `AK9*${accepted ? 'A' : 'R'}*1*1*1`,
      
      // SE - Transaction Set Trailer
      `SE*7*${controlNumber.toString().padStart(4, '0')}`,
      
      // GE - Group Control Trailer
      `GE*1*${controlNumber}`,
      
      // IEA - Interchange Control Trailer
      `IEA*1*${controlNumber.toString().padStart(9, '0')}`
    ];

    return ackSegments.join('~') + '~';
  }

  private formatEDIDate(ediDate: string): string {
    if (ediDate.length === 8) {
      return `${ediDate.slice(0, 4)}-${ediDate.slice(4, 6)}-${ediDate.slice(6, 8)}`;
    }
    return ediDate;
  }

  private getNextControlNumber(): number {
    return this.sequenceNumber++;
  }

  // EDI Communication Status Codes
  getStatusCodes(): { [key: string]: string } {
    return {
      'AF': 'Loaded',
      'AG': 'En Route to Delivery',
      'AA': 'Delivered',
      'X1': 'Arrival at Pickup',
      'X2': 'Departure from Pickup', 
      'X3': 'Arrival at Delivery',
      'X4': 'Delivery Complete',
      'X6': 'Equipment Dispatched',
      'CD': 'Delayed',
      'NA': 'Not Available',
      'OC': 'Out for Collection',
      'OD': 'Out for Delivery'
    };
  }

  // Save EDI to file system
  saveEDI(ediContent: string, filename: string, directory: string = 'edi_outbound'): void {
    try {
      const filepath = join(process.cwd(), directory, filename);
      writeFileSync(filepath, ediContent);
    } catch (error) {
      console.error('Error saving EDI file:', error);
      throw new Error('Failed to save EDI file');
    }
  }

  // Read EDI from file system
  readEDI(filename: string, directory: string = 'edi_inbound'): string {
    try {
      const filepath = join(process.cwd(), directory, filename);
      return readFileSync(filepath, 'utf8');
    } catch (error) {
      console.error('Error reading EDI file:', error);
      throw new Error('Failed to read EDI file');
    }
  }
}

export const ediService = new EDIService({
  scac: process.env.COMPANY_SCAC || 'DEMO',
  name: process.env.COMPANY_NAME || 'Demo Trucking Co',
  code: process.env.COMPANY_CODE || 'DEMO123',
  address: process.env.COMPANY_ADDRESS || '123 Main St',
  city: process.env.COMPANY_CITY || 'Dallas',
  state: process.env.COMPANY_STATE || 'TX',
  zip: process.env.COMPANY_ZIP || '75201'
});