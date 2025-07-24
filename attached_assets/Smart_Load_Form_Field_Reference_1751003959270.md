
# 📋 Smart Load Form Field Reference

This document lists all fields used in the Smart Load Creation form, grouped by load/trailer type.

---

## ✅ General Load Fields (All Load Types)

| Field | Type | Description |
|-------|------|-------------|
| `loadId` | string | Internal load identifier |
| `pickupLocation` | string | Origin address or facility |
| `dropoffLocation` | string | Destination address or facility |
| `pickupDate` | date | Scheduled pickup |
| `dropoffDate` | date | Scheduled delivery |
| `rate` | number | Agreed rate |
| `customerName` | string | Broker/Shipper name |
| `trailerType` | string | Trailer/Load type selector |
| `commodity` | string | General description of goods |

---

## 🚢 Container Load Fields

| Field | Type | Description |
|-------|------|-------------|
| `containerNumber` | string | Unique container ID |
| `bolNumber` | string | Bill of Lading number |
| `lfsNumber` | string | Line Freight Schedule reference |
| `ssl` | string | Steamship Line |
| `vesselName` | string | Vessel name |
| `portOfLoading` | string | POL |
| `portOfDischarge` | string | POD |
| `containerSize` | dropdown (20ft/40ft/45ft) | Container size |
| `grossWeight` | number | Total weight in lbs or kg |
| `hazmat` | boolean | Is hazardous material? |
| `currentLocation` | string | Container's current location |
| `isCustomerHold` | boolean | On customer hold? |
| `isAvailableForPickup` | boolean | Ready for pickup? |
| `chassisRequired` | boolean | Requires chassis? |
| `chassisId` | string | Linked chassis asset ID |
| `chassisType` | string | Standard / Triaxle / Tank |
| `chassisProvider` | string | TRAC, FlexiVan, DCLI, etc. |
| `chassisFreeDays` | number | Free days before per diem |
| `chassisPerDiemRate` | number | Daily cost after free days |
| `containerFreeDays` | number | Days before demurrage |
| `containerDemurrageRate` | number | Daily demurrage fee |
| `expressPassRequired` | boolean | Generate HIT pass? |
| `terminal` | string | HIT terminal name |

---

## 🧊 Reefer Load Fields

| Field | Type | Description |
|-------|------|-------------|
| `temperature` | number | Required °F or °C |
| `isFSMACompliant` | boolean | FSMA handling required? |
| `preloadChecklistComplete` | boolean | Safety checks completed? |

---

## 🛢️ Tanker Load Fields

| Field | Type | Description |
|-------|------|-------------|
| `liquidType` | string | Fuel, Milk, Water, Chemicals |
| `hazmat` | boolean | Hazmat classified? |
| `washType` | string | Pre-clean type (Kosher, Rinse, etc.) |
| `volume` | number | Volume in gallons or liters |

---

## 📦 Flatbed Load Fields

| Field | Type | Description |
|-------|------|-------------|
| `loadLength` | number | Length in feet |
| `loadWidth` | number | Width in feet |
| `loadHeight` | number | Height in feet |
| `tarpRequired` | boolean | Needs tarp covering? |
| `securementType` | string | Chains, Straps, Coil Racks |

---

## 📥 Dry Van Load Fields

| Field | Type | Description |
|-------|------|-------------|
| `palletCount` | number | Total pallets |
| `isStackable` | boolean | Stackable cargo? |
| `sealNumber` | string | Security seal number |

---

