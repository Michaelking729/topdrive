export type RideStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "ARRIVING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type RideRequest = {
  id: string;
  pickup: string;
  destination: string;
  estimate: number;
  offeredPrice?: number;
  status: RideStatus;
  driverName?: string;
  createdAt: string;
  updatedAt: string;
  city: "Ijebu-Ode";
};

export const STORAGE_KEY = "topdrive:ridelist:v1";
