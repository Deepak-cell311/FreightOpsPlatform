// Webhook Status Check - Verify Gusto webhook verification status
import fs from 'fs';
import path from 'path';

export class WebhookStatusChecker {
  private logFile = path.join(process.cwd(), 'webhook-verification.log');

  // Log verification attempt
  logVerification(data: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp}: ${JSON.stringify(data)}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
      console.log('Verification logged:', data);
    } catch (error) {
      console.error('Failed to log verification:', error);
    }
  }

  // Check if verification was successful
  getVerificationStatus(): { verified: boolean; lastAttempt?: string; details?: any } {
    try {
      if (!fs.existsSync(this.logFile)) {
        return { verified: false };
      }

      const logs = fs.readFileSync(this.logFile, 'utf8');
      const lines = logs.trim().split('\n').filter(line => line.length > 0);
      
      if (lines.length === 0) {
        return { verified: false };
      }

      const lastLine = lines[lines.length - 1];
      const lastAttempt = lastLine.split(': ')[0];
      
      try {
        const details = JSON.parse(lastLine.split(': ').slice(1).join(': '));
        return {
          verified: details.success === true,
          lastAttempt,
          details
        };
      } catch {
        return { verified: false, lastAttempt };
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      return { verified: false };
    }
  }

  // Get all verification attempts
  getAllAttempts(): any[] {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const logs = fs.readFileSync(this.logFile, 'utf8');
      const lines = logs.trim().split('\n').filter(line => line.length > 0);
      
      return lines.map(line => {
        try {
          const [timestamp, ...jsonParts] = line.split(': ');
          const data = JSON.parse(jsonParts.join(': '));
          return { timestamp, ...data };
        } catch {
          return { timestamp: line.split(': ')[0], raw: line };
        }
      });
    } catch (error) {
      console.error('Error getting attempts:', error);
      return [];
    }
  }
}

export const webhookStatusChecker = new WebhookStatusChecker();