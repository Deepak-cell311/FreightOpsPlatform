import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmbeddedPayroll } from "@/components/gusto-embedded/embedded-payroll";
import { EmbeddedHR } from "@/components/gusto-embedded/embedded-hr";
import { EmbeddedBenefits } from "@/components/gusto-embedded/embedded-benefits";

export default function PayrollDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll & HR Management</h1>
          <p className="text-gray-600">Complete HR and payroll solution with white-label embedded interface</p>
        </div>
      </div>

      {/* Gusto White-Label Embedded Interface */}
      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payroll">Payroll Management</TabsTrigger>
          <TabsTrigger value="hr">HR & Employees</TabsTrigger>
          <TabsTrigger value="benefits">Benefits Administration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payroll" className="space-y-4">
          <EmbeddedPayroll />
        </TabsContent>
        
        <TabsContent value="hr" className="space-y-4">
          <EmbeddedHR />
        </TabsContent>
        
        <TabsContent value="benefits" className="space-y-4">
          <EmbeddedBenefits />
        </TabsContent>
      </Tabs>
    </div>
  );
}