# FreightOps Pro - HQ Module Documentation

## Overview

The HQ Module provides comprehensive platform administration for FreightOps Pro, enabling system-wide management, tenant oversight, revenue analytics, and operational control across all client companies. It serves as the central command center for platform owners and administrators to monitor, manage, and optimize the multi-tenant SaaS platform.

## Core Features

### Platform Administration
- **Tenant Management**: Complete oversight of all client companies and their operations
- **System Monitoring**: Platform-wide health monitoring and performance analytics
- **Revenue Analytics**: Comprehensive financial tracking across all tenants
- **Support Management**: Centralized customer support and ticket management
- **Feature Rollouts**: Controlled feature deployment and A/B testing capabilities

### Multi-Tenant Oversight
- **Company Dashboards**: Individual tenant performance and health monitoring
- **Usage Analytics**: Feature adoption and utilization tracking across tenants
- **Billing Management**: Subscription management and revenue optimization
- **Compliance Monitoring**: Platform-wide regulatory compliance and audit trails
- **Risk Assessment**: Financial and operational risk monitoring across clients

### Enterprise Banking Management
- **Railsr Integration**: Centralized banking service oversight for all tenants
- **Account Monitoring**: Real-time banking account status and transaction tracking
- **Risk Management**: Financial risk assessment and fraud detection
- **Compliance Oversight**: Banking compliance monitoring and reporting
- **Transaction Analytics**: Platform-wide financial transaction analysis

### System Analytics & Intelligence
- **Performance Metrics**: Platform performance and optimization opportunities
- **User Behavior Analytics**: Cross-tenant usage patterns and insights
- **Predictive Analytics**: Churn prediction and growth opportunity identification
- **Competitive Intelligence**: Market analysis and competitive positioning
- **Business Intelligence**: Strategic insights for platform growth

## Access Control & Security

### Authentication System
```
HQ Admin Authentication:
- Secure login: rcarbonellusa@gmail.com / Catalina$2023
- Role-based access: platform_owner, hq_admin
- Multi-factor authentication required
- Session management with secure tokens
- IP-based access restrictions
```

### Role Permissions
```
Platform Owner (Full Access):
- Complete system administration
- Financial data access
- User management across all tenants
- System configuration changes
- Revenue and billing management

HQ Admin (Limited Access):
- Tenant support and assistance
- System health monitoring
- Usage analytics and reporting
- Customer communication
- Basic tenant management
```

### Security Features
```
- Encrypted data transmission
- Audit logging for all actions
- IP whitelisting capabilities
- Secure API endpoints
- Data privacy compliance
- Regular security assessments
```

## API Endpoints

### Tenant Management
```
GET /api/hq/tenants - List all tenant companies
GET /api/hq/tenants/:id - Get specific tenant details
PUT /api/hq/tenants/:id - Update tenant information
POST /api/hq/tenants/:id/suspend - Suspend tenant account
POST /api/hq/tenants/:id/activate - Activate suspended tenant
DELETE /api/hq/tenants/:id - Remove tenant (archive)
```

### System Analytics
```
GET /api/hq/analytics/platform - Platform-wide performance metrics
GET /api/hq/analytics/revenue - Revenue analytics across all tenants
GET /api/hq/analytics/usage - Feature usage statistics
GET /api/hq/analytics/growth - Growth metrics and trends
GET /api/hq/analytics/churn - Churn analysis and predictions
```

### Banking Management
```
GET /api/hq/banking/overview - Banking services overview
GET /api/hq/banking/accounts - All tenant banking accounts
GET /api/hq/banking/transactions - Platform transaction analytics
GET /api/hq/banking/compliance - Banking compliance status
POST /api/hq/banking/risk-assessment - Generate risk reports
```

### Support & Tickets
```
GET /api/hq/support/tickets - All support tickets
POST /api/hq/support/tickets - Create new ticket
PUT /api/hq/support/tickets/:id - Update ticket status
GET /api/hq/support/analytics - Support performance metrics
```

### System Management
```
GET /api/hq/system/health - Platform health status
GET /api/hq/system/performance - Performance monitoring
POST /api/hq/system/maintenance - Schedule maintenance
GET /api/hq/system/logs - System audit logs
POST /api/hq/system/backup - Initiate system backup
```

## Database Schema

### HQ Tenants Management
```sql
hq_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  tenant_name VARCHAR NOT NULL,
  subscription_tier VARCHAR NOT NULL,
  monthly_revenue DECIMAL(10,2),
  user_count INTEGER DEFAULT 0,
  feature_usage JSONB DEFAULT '{}',
  last_activity TIMESTAMP,
  health_score DECIMAL(3,2) DEFAULT 0.0,
  risk_level VARCHAR DEFAULT 'low',
  support_tier VARCHAR DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### System Metrics
```sql
hq_system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR NOT NULL,
  metric_name VARCHAR NOT NULL,
  metric_value DECIMAL(15,2),
  measurement_date DATE NOT NULL,
  tenant_id UUID REFERENCES hq_tenants(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Support Tickets
```sql
hq_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES hq_tenants(id),
  ticket_number VARCHAR UNIQUE NOT NULL,
  subject VARCHAR NOT NULL,
  description TEXT,
  priority VARCHAR DEFAULT 'medium',
  status VARCHAR DEFAULT 'open',
  assigned_to VARCHAR,
  customer_email VARCHAR,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Banking Oversight
```sql
hq_banking_overview (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES hq_tenants(id),
  unit_account_id VARCHAR,
  account_status VARCHAR,
  account_balance DECIMAL(12,2) DEFAULT 0,
  monthly_volume DECIMAL(15,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  risk_score DECIMAL(3,2) DEFAULT 0.0,
  compliance_status VARCHAR DEFAULT 'compliant',
  last_transaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Feature Usage Tracking
```sql
hq_feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES hq_tenants(id),
  feature_name VARCHAR NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  usage_trend VARCHAR DEFAULT 'stable',
  billing_impact DECIMAL(8,2) DEFAULT 0,
  recorded_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Frontend Components

### HQ Dashboard Layout
- **Multi-tenant Overview**: High-level metrics across all clients
- **Revenue Dashboard**: Financial performance and billing analytics
- **System Health Monitor**: Platform performance and uptime tracking
- **Alert Center**: Critical notifications and system alerts
- **Quick Actions**: Common administrative tasks and shortcuts

### Tenant Management Interface
- **Tenant Grid**: Sortable, filterable list of all client companies
- **Health Scoring**: Visual health indicators for each tenant
- **Usage Analytics**: Feature adoption and utilization tracking
- **Billing Status**: Subscription status and payment information
- **Support Integration**: Direct access to tenant support history

### Revenue Analytics Dashboard
- **Revenue Trends**: Monthly and yearly revenue tracking
- **Subscription Analytics**: Plan distribution and upgrade patterns
- **Churn Analysis**: Customer retention and churn prediction
- **LTV Calculations**: Customer lifetime value analysis
- **Forecasting**: Revenue predictions and growth projections

### Banking Management Console
- **Account Overview**: All tenant banking accounts and status
- **Transaction Monitoring**: Real-time transaction tracking
- **Risk Dashboard**: Financial risk assessment and alerts
- **Compliance Tracking**: Banking regulation compliance status
- **Fraud Detection**: Suspicious activity monitoring and alerts

### Support Management System
- **Ticket Dashboard**: All support tickets with filtering and sorting
- **Customer Communication**: Integrated communication tools
- **Knowledge Base**: Centralized documentation and solutions
- **Escalation Management**: Automatic escalation rules and procedures
- **Performance Metrics**: Support team performance tracking

## Advanced Analytics

### Platform Performance Metrics
```
Active Tenants: Real-time count of active client companies
Monthly Recurring Revenue (MRR): Total recurring revenue
Customer Acquisition Cost (CAC): Cost to acquire new clients
Customer Lifetime Value (LTV): Average customer lifetime value
Churn Rate: Monthly and annual churn analysis
Feature Adoption: Cross-tenant feature usage statistics
System Uptime: Platform availability and performance
Support Resolution Time: Average ticket resolution time
```

### Revenue Analytics
```
Total Platform Revenue: Aggregate revenue across all tenants
Revenue Growth Rate: Month-over-month growth tracking
Plan Distribution: Breakdown of subscription plans
Add-on Revenue: Revenue from additional features
Geographic Revenue: Revenue by geographic regions
Seasonal Trends: Revenue patterns and seasonality
Upsell Opportunities: Identification of upgrade candidates
Payment Performance: Payment success rates and failures
```

### Operational Intelligence
```
User Activity Patterns: Cross-tenant usage patterns
Feature Performance: Most and least used features
Support Trends: Common issues and resolution patterns
System Resource Usage: Platform resource utilization
Security Incidents: Security events and response times
Compliance Status: Regulatory compliance across tenants
Integration Health: Third-party integration performance
Database Performance: Query performance and optimization
```

## Banking Integration Management

### Railsr Banking Service Oversight
```
Account Creation Monitoring:
- Automated account setup tracking
- KYC compliance verification
- Account activation timelines
- Initial deposit monitoring

Transaction Processing:
- Real-time transaction monitoring
- Payment processing analytics
- ACH and wire transfer tracking
- Failed transaction analysis

Risk Management:
- Automated risk scoring
- Fraud detection algorithms
- Compliance monitoring
- Suspicious activity reporting

Customer Support:
- Banking-related support tickets
- Account issue resolution
- Payment problem troubleshooting
- Regulatory inquiry handling
```

### Financial Risk Assessment
```
Tenant Risk Scoring:
- Payment history analysis
- Transaction volume patterns
- Account balance monitoring
- Credit risk assessment

Platform Risk Management:
- Aggregate exposure monitoring
- Concentration risk analysis
- Regulatory compliance tracking
- Insurance coverage verification

Fraud Prevention:
- Pattern recognition algorithms
- Velocity checking
- Geographic analysis
- Device fingerprinting
```

## System Administration

### Platform Health Monitoring
```
Server Performance:
- CPU and memory utilization
- Database performance metrics
- API response times
- Error rate monitoring

Network Health:
- Bandwidth utilization
- Latency measurements
- CDN performance
- Third-party API status

Application Monitoring:
- User session tracking
- Feature usage analytics
- Error logging and alerts
- Performance bottlenecks

Security Monitoring:
- Login attempt tracking
- Failed authentication alerts
- Suspicious activity detection
- Vulnerability assessments
```

### Maintenance & Updates
```
Scheduled Maintenance:
- Planned downtime coordination
- Tenant notification systems
- Rollback procedures
- Impact assessment

Feature Rollouts:
- Staged deployment process
- A/B testing capabilities
- Feature flag management
- Rollback mechanisms

System Updates:
- Security patch management
- Database migrations
- Third-party updates
- Performance optimizations

Backup & Recovery:
- Automated backup schedules
- Disaster recovery procedures
- Data retention policies
- Recovery testing protocols
```

## Reporting & Business Intelligence

### Executive Reporting
```
Monthly Business Reviews:
- Platform performance summary
- Revenue and growth metrics
- Customer satisfaction scores
- Strategic recommendations

Quarterly Reports:
- Financial performance analysis
- Market position assessment
- Competitive analysis
- Growth strategy updates

Annual Reviews:
- Comprehensive platform analysis
- Customer success stories
- Technology roadmap
- Investment recommendations
```

### Compliance Reporting
```
Regulatory Compliance:
- SOC 2 Type II compliance
- GDPR compliance reporting
- Financial services regulations
- Industry-specific requirements

Audit Support:
- Complete audit trail access
- Documentation preparation
- Compliance verification
- Remediation tracking

Risk Assessment:
- Risk register maintenance
- Mitigation strategy tracking
- Incident response reporting
- Business continuity planning
```

### Customer Success Analytics
```
Health Scoring:
- Tenant health assessments
- Churn risk identification
- Expansion opportunities
- Success metrics tracking

Usage Analytics:
- Feature adoption rates
- User engagement metrics
- Training effectiveness
- Support utilization

Satisfaction Monitoring:
- Customer satisfaction surveys
- Net Promoter Score tracking
- Feedback analysis
- Improvement recommendations
```

## Mobile HQ App

### Mobile Dashboard Features
```
Real-time Monitoring:
- Platform health status
- Critical alert notifications
- Revenue tracking
- Support ticket status

Emergency Response:
- System outage management
- Critical incident response
- Customer communication
- Escalation procedures

Administrative Tasks:
- Tenant account management
- Support ticket handling
- System maintenance
- Approval workflows
```

## API Integration Points

### External Service Management
```
Banking Services:
- Railsr API management
- Stripe integration oversight
- Payment processor monitoring
- Financial data aggregation

Communication Services:
- SendGrid email analytics
- Twilio SMS monitoring
- Notification delivery tracking
- Communication preferences

Third-party Integrations:
- ELD system connectivity
- Load board integrations
- Port system connections
- Government API access
```

## Security & Compliance

### Data Protection
```
Encryption Standards:
- AES-256 data encryption
- TLS 1.3 for transmission
- Key management systems
- Certificate management

Access Controls:
- Multi-factor authentication
- Role-based permissions
- IP whitelisting
- Session management

Privacy Compliance:
- GDPR compliance
- CCPA compliance
- Data retention policies
- Right to deletion
```

### Audit & Compliance
```
Audit Logging:
- Complete activity tracking
- Immutable audit trails
- Compliance reporting
- Forensic capabilities

Regulatory Compliance:
- SOC 2 Type II
- PCI DSS compliance
- HIPAA considerations
- Industry regulations

Incident Response:
- Security incident procedures
- Breach notification protocols
- Recovery procedures
- Post-incident analysis
```

## Troubleshooting & Support

### Common Administrative Tasks
```
Tenant Management:
- Account creation and setup
- Subscription modifications
- Feature enablement
- Account suspension/reactivation

System Maintenance:
- Performance optimization
- Database maintenance
- Security updates
- Backup verification

Customer Support:
- Ticket escalation
- Technical assistance
- Account issues
- Billing inquiries
```

### Emergency Procedures
```
System Outages:
- Incident response procedures
- Customer communication
- Service restoration
- Post-incident review

Security Incidents:
- Threat assessment
- Containment procedures
- Investigation protocols
- Recovery planning

Data Issues:
- Backup restoration
- Data recovery procedures
- Corruption handling
- Integrity verification
```

---

## Recent Updates

- **June 27, 2025**: Implemented comprehensive HQ management system with Railsr banking integration and tenant lifecycle management
- **June 18, 2025**: Built complete HQ database tables with system metrics, support tickets, billing events, and feature usage tracking
- **June 17, 2025**: Fixed HQ authentication system with proper security and role-based access control
- **June 17, 2025**: Verified HQ system integration with consolidated production routing infrastructure
- **June 14, 2025**: Enhanced HQ management with tenant analytics and subscription distribution monitoring