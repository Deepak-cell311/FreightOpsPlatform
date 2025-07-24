interface FMCSACarrierData {
  dotNumber: string;
  legalName: string;
  dbaName?: string;
  carrierOperation: string;
  hm_flag: string;
  pc_flag: string;
  phyStreet: string;
  phyCity: string;
  phyState: string;
  phyZip: string;
  phyCountry: string;
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
  mailingCountry?: string;
  telephone: string;
  fax?: string;
  emailAddress?: string;
  mcMxffNumber?: string;
  statusCode: string;
  allowedToOperate: string;
  saferRating?: string;
  reviewDate?: string;
  reviewType?: string;
  totalDrivers: number;
  totalPowerUnits: number;
  censusData?: any;
  safetyRating?: string;
  ratingDate?: string;
  reviewDate2?: string;
  outOfServiceDate?: string;
  mcs150FormDate?: string;
  mcs150Mileage?: number;
  mcs150MileageYear?: number;
}

interface SafetyViolation {
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  violationDate: string;
  description: string;
  penaltyAmount?: number;
  resolved: boolean;
}

interface CarrierSafetyProfile {
  dotNumber: string;
  safetyRating: string;
  totalInspections: number;
  outOfServiceRate: number;
  crashRating: number;
  unsafeDrivingScore: number;
  vehicleMaintenanceScore: number;
  driverFitnessScore: number;
  controlledSubstanceScore: number;
  hazmatScore: number;
  violations: SafetyViolation[];
  lastUpdateDate: string;
  complianceReview?: {
    date: string;
    result: string;
    nextReviewDue?: string;
  };
}

class FMCSASaferService {
  private readonly BASE_URL = 'https://mobile.fmcsa.dot.gov/qc/services/carriers';
  private readonly API_KEY = process.env.FMCSA_API_KEY;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    if (!this.API_KEY) {
      console.warn('FMCSA_API_KEY not found - carrier verification will be limited');
    }
  }

  /**
   * Lookup carrier information by MC number using FMCSA Safer API
   */
  async lookupCarrierByMC(mcNumber: string): Promise<FMCSACarrierData | null> {
    try {
      // Check cache first
      const cacheKey = `mc_${mcNumber}`;
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        return cached.data;
      }

      // FMCSA API uses MC numbers in the format MC-123456
      const formattedMC = mcNumber.startsWith('MC-') ? mcNumber : `MC-${mcNumber}`;
      
      const response = await fetch(`${this.BASE_URL}/docket-number/${formattedMC}?webKey=${this.API_KEY}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FreightOps-Pro/1.0'
        }
      });

      if (!response.ok) {
        console.error(`FMCSA MC API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const response_data = await response.json();
      const data = response_data.content?.carrier;
      
      if (!data) {
        console.error('No carrier data found in FMCSA MC response');
        return null;
      }
      
      // Transform FMCSA response to our interface
      const carrierData: FMCSACarrierData = {
        dotNumber: data.dotNumber || '',
        legalName: data.legalName || '',
        dbaName: data.dbaName,
        carrierOperation: data.carrierOperation?.carrierOperationDesc || '',
        hm_flag: data.hm_flag || 'N',
        pc_flag: data.pc_flag || 'N',
        phyStreet: data.phyStreet || '',
        phyCity: data.phyCity || '',
        phyState: data.phyState || '',
        phyZip: data.phyZipcode || '',
        phyCountry: data.phyCountry || 'US',
        mailingStreet: data.mailingStreet,
        mailingCity: data.mailingCity,
        mailingState: data.mailingState,
        mailingZip: data.mailingZip,
        mailingCountry: data.mailingCountry,
        telephone: data.telephone || '',
        fax: data.fax,
        emailAddress: data.emailAddress,
        mcMxffNumber: mcNumber,
        statusCode: data.statusCode || '',
        allowedToOperate: data.allowedToOperate || '',
        saferRating: data.saferRating,
        reviewDate: data.reviewDate,
        reviewType: data.reviewType,
        totalDrivers: parseInt(data.totalDrivers) || 0,
        totalPowerUnits: parseInt(data.totalPowerUnits) || 0,
        censusData: data.censusData,
        safetyRating: data.safetyRating,
        ratingDate: data.safetyRatingDate,
        reviewDate2: data.safetyReviewDate,
        outOfServiceDate: data.oosDate,
        mcs150FormDate: data.mcs150FormDate,
        mcs150Mileage: parseInt(data.mcs150Mileage) || 0,
        mcs150MileageYear: parseInt(data.mcs150MileageYear) || 0
      };

      // Cache the result
      this.cache.set(cacheKey, { data: carrierData, timestamp: Date.now() });
      
      return carrierData;
    } catch (error) {
      console.error('Error fetching FMCSA carrier data by MC:', error);
      return null;
    }
  }

  /**
   * Lookup carrier information by DOT number using FMCSA Safer API
   */
  async lookupCarrierByDOT(dotNumber: string): Promise<FMCSACarrierData | null> {
    try {
      // Check cache first
      const cacheKey = `dot_${dotNumber}`;
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        return cached.data;
      }

      const response = await fetch(`${this.BASE_URL}/${dotNumber}?webKey=${this.API_KEY}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FreightOps-Pro/1.0'
        }
      });

      if (!response.ok) {
        console.error(`FMCSA API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const response_data = await response.json();
      const data = response_data.content?.carrier;
      
      if (!data) {
        console.error('No carrier data found in FMCSA response');
        return null;
      }
      
      // Transform FMCSA response to our interface
      const carrierData: FMCSACarrierData = {
        dotNumber: data.dotNumber || dotNumber,
        legalName: data.legalName || '',
        dbaName: data.dbaName,
        carrierOperation: data.carrierOperation?.carrierOperationDesc || '',
        hm_flag: data.hm_flag || 'N',
        pc_flag: data.pc_flag || 'N',
        phyStreet: data.phyStreet || '',
        phyCity: data.phyCity || '',
        phyState: data.phyState || '',
        phyZip: data.phyZipcode || '',
        phyCountry: data.phyCountry || 'US',
        mailingStreet: data.mailingStreet,
        mailingCity: data.mailingCity,
        mailingState: data.mailingState,
        mailingZip: data.mailingZip,
        mailingCountry: data.mailingCountry,
        telephone: data.telephone || '',
        fax: data.fax,
        emailAddress: data.emailAddress,
        mcMxffNumber: data.mcMxffNumber,
        statusCode: data.statusCode || '',
        allowedToOperate: data.allowedToOperate || '',
        saferRating: data.saferRating,
        reviewDate: data.reviewDate,
        reviewType: data.reviewType,
        totalDrivers: parseInt(data.totalDrivers) || 0,
        totalPowerUnits: parseInt(data.totalPowerUnits) || 0,
        censusData: data.censusData,
        safetyRating: data.safetyRating,
        ratingDate: data.safetyRatingDate,
        reviewDate2: data.safetyReviewDate,
        outOfServiceDate: data.oosDate,
        mcs150FormDate: data.mcs150FormDate,
        mcs150Mileage: parseInt(data.mcs150Mileage) || 0,
        mcs150MileageYear: parseInt(data.mcs150MileageYear) || 0
      };

      // Cache the result
      this.cache.set(cacheKey, { data: carrierData, timestamp: Date.now() });
      
      return carrierData;
    } catch (error) {
      console.error('Error fetching FMCSA carrier data:', error);
      return null;
    }
  }

  /**
   * Get comprehensive safety profile including violations and ratings
   */
  async getSafetyProfile(dotNumber: string): Promise<CarrierSafetyProfile | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/${dotNumber}/safety?webKey=${this.API_KEY}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FreightOps-Pro/1.0'
        }
      });

      if (!response.ok) {
        console.error(`FMCSA Safety API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      const safetyProfile: CarrierSafetyProfile = {
        dotNumber: dotNumber,
        safetyRating: data.safetyRating || 'NOT_RATED',
        totalInspections: parseInt(data.totalInspections) || 0,
        outOfServiceRate: parseFloat(data.outOfServiceRate) || 0,
        crashRating: parseInt(data.crashRating) || 0,
        unsafeDrivingScore: parseFloat(data.unsafeDrivingScore) || 0,
        vehicleMaintenanceScore: parseFloat(data.vehicleMaintenanceScore) || 0,
        driverFitnessScore: parseFloat(data.driverFitnessScore) || 0,
        controlledSubstanceScore: parseFloat(data.controlledSubstanceScore) || 0,
        hazmatScore: parseFloat(data.hazmatScore) || 0,
        violations: this.parseViolations(data.violations || []),
        lastUpdateDate: data.lastUpdateDate || new Date().toISOString(),
        complianceReview: data.complianceReview ? {
          date: data.complianceReview.date,
          result: data.complianceReview.result,
          nextReviewDue: data.complianceReview.nextReviewDue
        } : undefined
      };

      return safetyProfile;
    } catch (error) {
      console.error('Error fetching FMCSA safety profile:', error);
      return null;
    }
  }

  /**
   * Lookup carrier by company name using FMCSA Safer API
   */
  async lookupCarrierByName(companyName: string): Promise<FMCSACarrierData[] | null> {
    try {
      // Check cache first
      const cacheKey = `name_${companyName.toLowerCase()}`;
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        return cached.data;
      }

      const response = await fetch(`${this.BASE_URL}/name/${encodeURIComponent(companyName)}?webKey=${this.API_KEY}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FreightOps-Pro/1.0'
        }
      });

      if (!response.ok) {
        console.error(`FMCSA Name API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const response_data = await response.json();
      const carriers = response_data.content?.carriers || [];
      
      if (!carriers || carriers.length === 0) {
        console.log('No carriers found for company name:', companyName);
        return null;
      }
      
      // Transform FMCSA response to our interface
      const carrierData: FMCSACarrierData[] = carriers.map((data: any) => ({
        dotNumber: data.dotNumber || '',
        legalName: data.legalName || '',
        dbaName: data.dbaName,
        carrierOperation: data.carrierOperation?.carrierOperationDesc || '',
        hm_flag: data.hm_flag || 'N',
        pc_flag: data.pc_flag || 'N',
        phyStreet: data.phyStreet || '',
        phyCity: data.phyCity || '',
        phyState: data.phyState || '',
        phyZip: data.phyZipcode || '',
        phyCountry: data.phyCountry || 'US',
        mailingStreet: data.mailingStreet,
        mailingCity: data.mailingCity,
        mailingState: data.mailingState,
        mailingZip: data.mailingZip,
        mailingCountry: data.mailingCountry,
        telephone: data.telephone || '',
        fax: data.fax,
        emailAddress: data.emailAddress,
        mcMxffNumber: data.mcMxffNumber,
        statusCode: data.statusCode || '',
        allowedToOperate: data.allowedToOperate || '',
        saferRating: data.saferRating,
        reviewDate: data.reviewDate,
        reviewType: data.reviewType,
        totalDrivers: parseInt(data.totalDrivers) || 0,
        totalPowerUnits: parseInt(data.totalPowerUnits) || 0,
        censusData: data.censusData,
        safetyRating: data.safetyRating,
        ratingDate: data.ratingDate,
        reviewDate2: data.reviewDate2,
        outOfServiceDate: data.outOfServiceDate,
        mcs150FormDate: data.mcs150FormDate,
        mcs150Mileage: data.mcs150Mileage,
        mcs150MileageYear: data.mcs150MileageYear
      }));
      
      // Cache the result
      this.cache.set(cacheKey, { data: carrierData, timestamp: Date.now() });
      
      return carrierData;
    } catch (error) {
      console.error('Error fetching FMCSA carrier data by name:', error);
      return null;
    }
  }

  /**
   * Lookup carrier by either DOT or MC number
   */
  async lookupCarrier(identifier: string): Promise<FMCSACarrierData | null> {
    // Determine if it's a DOT or MC number
    const cleanedId = identifier.replace(/[^0-9]/g, '');
    
    // Try MC number first if identifier contains MC prefix or is formatted like MC
    if (identifier.toUpperCase().includes('MC') || identifier.includes('-')) {
      const result = await this.lookupCarrierByMC(cleanedId);
      if (result) return result;
    }
    
    // Try DOT number lookup
    return await this.lookupCarrierByDOT(cleanedId);
  }

  /**
   * Validate carrier credentials and operating authority
   */
  async validateCarrier(dotNumber: string, mcNumber?: string): Promise<{
    valid: boolean;
    activeAuthority: boolean;
    insuranceRequired: boolean;
    outOfService: boolean;
    safetyRating: string;
    issues: string[];
  }> {
    const carrier = await this.lookupCarrierByDOT(dotNumber);
    
    if (!carrier) {
      return {
        valid: false,
        activeAuthority: false,
        insuranceRequired: false,
        outOfService: false,
        safetyRating: 'UNKNOWN',
        issues: ['DOT number not found in FMCSA database']
      };
    }

    const issues: string[] = [];
    let valid = true;
    let activeAuthority = false;
    let outOfService = false;

    // Check operating authority
    if (carrier.allowedToOperate === 'Y') {
      activeAuthority = true;
    } else {
      issues.push('Carrier not authorized to operate');
      valid = false;
    }

    // Check out of service status
    if (carrier.outOfServiceDate) {
      outOfService = true;
      issues.push(`Carrier placed out of service on ${carrier.outOfServiceDate}`);
      valid = false;
    }

    // Validate MC number if provided
    if (mcNumber && carrier.mcMxffNumber !== mcNumber) {
      issues.push('MC number does not match FMCSA records');
      valid = false;
    }

    // Check safety rating
    if (carrier.safetyRating === 'UNSATISFACTORY') {
      issues.push('Carrier has UNSATISFACTORY safety rating');
      valid = false;
    }

    return {
      valid,
      activeAuthority,
      insuranceRequired: carrier.carrierOperation.includes('INTERSTATE'),
      outOfService,
      safetyRating: carrier.safetyRating || 'NOT_RATED',
      issues
    };
  }

  /**
   * Search carriers by name or partial information
   */
  async searchCarriers(searchTerm: string, limit: number = 10): Promise<FMCSACarrierData[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FreightOps-Pro/1.0'
        }
      });

      if (!response.ok) {
        console.error(`FMCSA Search API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      return data.carriers || [];
    } catch (error) {
      console.error('Error searching FMCSA carriers:', error);
      return [];
    }
  }

  private parseViolations(violationsData: any[]): SafetyViolation[] {
    return violationsData.map(v => ({
      violationType: v.type || 'UNKNOWN',
      severity: this.mapSeverity(v.severity || 'low'),
      violationDate: v.date || '',
      description: v.description || '',
      penaltyAmount: parseFloat(v.penalty) || undefined,
      resolved: v.resolved === true || v.status === 'RESOLVED'
    }));
  }

  private mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: { [key: string]: 'low' | 'medium' | 'high' | 'critical' } = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'critical',
      'minor': 'low',
      'major': 'high',
      'severe': 'critical'
    };
    return severityMap[severity.toLowerCase()] || 'low';
  }

  /**
   * Get carrier insurance information
   */
  async getInsuranceInfo(dotNumber: string): Promise<{
    required: boolean;
    onFile: boolean;
    policies: Array<{
      type: string;
      carrier: string;
      policyNumber: string;
      effectiveDate: string;
      expirationDate: string;
      coverageAmount: number;
    }>;
  } | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/${dotNumber}/insurance`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FreightOps-Pro/1.0'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        required: data.required || false,
        onFile: data.onFile || false,
        policies: data.policies || []
      };
    } catch (error) {
      console.error('Error fetching FMCSA insurance info:', error);
      return null;
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

export const fmcsaSaferService = new FMCSASaferService();

// Clear expired cache every hour
setInterval(() => {
  fmcsaSaferService.clearExpiredCache();
}, 60 * 60 * 1000);