export type RideRequest = {
  id: string;
  pickup: string;
  destination: string;
  estimate: number;
  status: "REQUESTED" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};