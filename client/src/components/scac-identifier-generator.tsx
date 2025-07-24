import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, Shield, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SCACOption {
  identifier: string;
  isValid: boolean;
  businessType: string;
  isAvailable: boolean;
  inUseBy?: string | null;
}

interface GenerateResponse {
  companyName: string;
  businessType: string;
  options: string[];
  recommendations: {
    primary: string;
    alternates: string[];
  };
}

export function SCACIdentifierGenerator() {
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("motor_carrier");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<SCACOption[]>([]);
  const { toast } = useToast();

  const businessTypes = [
    { value: "motor_carrier", label: "Motor Carrier (Trucking)" },
    { value: "freight_forwarder", label: "Freight Forwarder" },
    { value: "logistics_provider", label: "Logistics Provider" },
    { value: "intermodal", label: "Intermodal Services" },
    { value: "rail_carrier", label: "Rail Carrier" },
    { value: "ocean_carrier", label: "Ocean Carrier" },
    { value: "air_carrier", label: "Air Carrier" },
    { value: "general", label: "General Transportation" }
  ];

  const generateIdentifiers = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company Name Required",
        description: "Please enter a company name to generate SCAC identifiers",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/company-ids/scac/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName, businessType }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate identifiers');
      }

      const data: GenerateResponse = await response.json();
      setGeneratedOptions(data.options);
      
      // Validate all generated options
      await validateOptions(data.options);
      
      toast({
        title: "SCAC Identifiers Generated",
        description: `Generated ${data.options.length} unique identifiers for ${companyName}`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate SCAC identifiers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateOptions = async (options: string[]) => {
    const validationPromises = options.map(async (identifier) => {
      const response = await fetch('/api/company-ids/scac/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    });

    const results = await Promise.all(validationPromises);
    setValidationResults(results.filter(Boolean));
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'motor_carrier':
        return <Truck className="h-4 w-4" />;
      case 'freight_forwarder':
      case 'logistics_provider':
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getBusinessTypeBadge = (type: string) => {
    const colors = {
      motor_carrier: "bg-blue-100 text-blue-800",
      freight_forwarder: "bg-green-100 text-green-800",
      logistics_provider: "bg-purple-100 text-purple-800",
      intermodal: "bg-orange-100 text-orange-800",
      rail_carrier: "bg-gray-100 text-gray-800",
      ocean_carrier: "bg-cyan-100 text-cyan-800",
      air_carrier: "bg-red-100 text-red-800",
      general: "bg-yellow-100 text-yellow-800"
    };

    return (
      <Badge variant="secondary" className={colors[type] || colors.general}>
        {getBusinessTypeIcon(type)}
        <span className="ml-1 capitalize">{type.replace('_', ' ')}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SCAC-Style Company Identifier Generator
          </CardTitle>
          <CardDescription>
            Generate secure, unique company identifiers based on Standard Carrier Alpha Code (SCAC) methodology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g., ABC Transportation LLC"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateIdentifiers} 
            disabled={isLoading || !companyName.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Generate SCAC Identifiers
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Identifiers</CardTitle>
            <CardDescription>
              SCAC-style identifiers for {companyName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationResults.map((option, index) => (
                <div
                  key={option.identifier}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-lg font-bold">
                      {option.identifier}
                    </div>
                    {getBusinessTypeBadge(option.businessType)}
                    {index === 0 && (
                      <Badge variant="default">Recommended</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {option.isAvailable ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">In Use</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {validationResults.length > 0 && (
              <Alert className="mt-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Enhancement:</strong> These SCAC-style identifiers replace simple
                  "company-1" formats with secure, industry-standard codes that provide better
                  security and professional appearance for your transportation company.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}