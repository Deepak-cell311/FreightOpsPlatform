import { db } from "./db";
import { loads, dispatchLegs, loadAssignments, drivers, trucks } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import type { InsertLoad, InsertDispatchLeg, InsertLoadAssignment } from "../shared/schema";

export class DispatchService {
  // Create load with dispatch legs and assignments
  static async createLoadWithDispatch(loadData: any, companyId: string) {
    const loadId = `load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare load data
    const newLoad: InsertLoad = {
      id: loadId,
      companyId,
      loadNumber: loadData.loadNumber,
      customerName: loadData.customerName,
      pickupLocation: loadData.pickupLocation,
      deliveryLocation: loadData.deliveryLocation,
      pickupDate: loadData.pickupDate,
      deliveryDate: loadData.deliveryDate,
      commodity: loadData.commodity,
      weight: loadData.weight || 0,
      pieces: loadData.pieces || 1,
      rate: loadData.rate.toString(),
      priority: loadData.priority || "normal",
      dispatchNotes: loadData.specialInstructions,
      trailerType: loadData.trailerType,
      isMultiDriverLoad: loadData.isMultiDriverLoad || false,
      dispatchStatus: loadData.dispatchStatus || "planning",
      status: "pending",
      // Add trailer-specific fields
      ssl: loadData.ssl,
      lfsNumber: loadData.lfsNumber,
      vesselName: loadData.vesselName,
      portOfLoading: loadData.portOfLoading,
      portOfDischarge: loadData.portOfDischarge,
      containerSize: loadData.containerSize,
      grossWeight: loadData.grossWeight,
      hazmat: loadData.hazmat,
      expressPassRequired: loadData.expressPassRequired,
      chassisProvider: loadData.chassisProvider,
      chassisType: loadData.chassisType,
      temperature: loadData.temperature,
      isFSMACompliant: loadData.isFSMACompliant,
      preloadChecklistComplete: loadData.preloadChecklistComplete,
      liquidType: loadData.liquidType,
      volume: loadData.volume,
      washType: loadData.washType,
      loadLength: loadData.loadLength,
      loadWidth: loadData.loadWidth,
      loadHeight: loadData.loadHeight,
      securementType: loadData.securementType,
      tarpRequired: loadData.tarpRequired,
      palletCount: loadData.palletCount,
      isStackable: loadData.isStackable,
      containerNumber: loadData.containerNumber,
      bolNumber: loadData.bolNumber,
      terminal: loadData.terminal,
      sealNumber: loadData.sealNumber
    };

    try {
      // Insert the load
      await db.insert(loads).values(newLoad);

      // If multi-driver load, create dispatch legs and assignments
      if (loadData.isMultiDriverLoad && loadData.dispatchLegs?.length > 0) {
        const legs = loadData.dispatchLegs.map((leg: any) => ({
          id: `leg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          loadId,
          companyId,
          driverId: leg.driverId,
          truckId: leg.truckId,
          trailerId: leg.trailerId,
          chassisId: leg.chassisId,
          actionType: leg.actionType,
          location: leg.location,
          eta: leg.eta ? new Date(leg.eta) : null,
          etd: leg.etd ? new Date(leg.etd) : null,
          legOrder: leg.legOrder,
          notes: leg.notes,
          completed: false
        }));

        // Insert dispatch legs
        if (legs.length > 0) {
          await db.insert(dispatchLegs).values(legs);
        }

        // Create load assignments for each unique driver
        const uniqueDrivers = Array.from(new Set(loadData.dispatchLegs.map((leg: any) => leg.driverId).filter(Boolean)));
        
        const assignments = uniqueDrivers.map((driverId: string) => ({
          id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          loadId,
          companyId,
          driverId,
          status: "assigned",
          assignmentNotes: loadData.dispatchNotes || ""
        }));

        if (assignments.length > 0) {
          await db.insert(loadAssignments).values(assignments);
        }
      }

      return { success: true, loadId };
    } catch (error) {
      console.error("Error creating load with dispatch:", error);
      throw new Error("Failed to create load with dispatch integration");
    }
  }

  // Get dispatch legs for a load
  static async getDispatchLegs(loadId: string, companyId: string) {
    return await db
      .select()
      .from(dispatchLegs)
      .where(and(
        eq(dispatchLegs.loadId, loadId),
        eq(dispatchLegs.companyId, companyId)
      ));
  }

  // Get load assignments for a driver
  static async getDriverAssignments(driverId: string, companyId: string) {
    return await db
      .select()
      .from(loadAssignments)
      .where(and(
        eq(loadAssignments.driverId, driverId),
        eq(loadAssignments.companyId, companyId)
      ));
  }

  // Update dispatch leg completion
  static async completeDispatchLeg(legId: string, companyId: string) {
    return await db
      .update(dispatchLegs)
      .set({ 
        completed: true,
        actualArrival: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(dispatchLegs.id, legId),
        eq(dispatchLegs.companyId, companyId)
      ));
  }

  // Get dispatch calendar data
  static async getDispatchCalendar(companyId: string, startDate: string, endDate: string) {
    return await db
      .select({
        leg: dispatchLegs,
        load: loads,
        driver: drivers,
        truck: trucks
      })
      .from(dispatchLegs)
      .leftJoin(loads, eq(dispatchLegs.loadId, loads.id))
      .leftJoin(drivers, eq(dispatchLegs.driverId, drivers.id))
      .leftJoin(trucks, eq(dispatchLegs.truckId, trucks.id))
      .where(eq(dispatchLegs.companyId, companyId));
  }

  // Get driver mobile view data
  static async getDriverMobileData(driverId: string, companyId: string) {
    return await db
      .select({
        leg: dispatchLegs,
        load: loads
      })
      .from(dispatchLegs)
      .leftJoin(loads, eq(dispatchLegs.loadId, loads.id))
      .where(and(
        eq(dispatchLegs.driverId, driverId),
        eq(dispatchLegs.companyId, companyId),
        eq(dispatchLegs.completed, false)
      ));
  }
}