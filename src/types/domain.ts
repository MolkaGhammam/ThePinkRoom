import type { Database } from "./database";

type Tables = Database["public"]["Tables"];

export type Salon = Tables["salons"]["Row"];
export type SalonClosure = Tables["salon_closures"]["Row"];
export type User = Tables["users"]["Row"];
export type Service = Tables["services"]["Row"];
export type Client = Tables["clients"]["Row"];
export type Appointment = Tables["appointments"]["Row"];
export type AppointmentService = Tables["appointment_services"]["Row"];
export type Payment = Tables["payments"]["Row"];

export type UserRole = User["role"];
export type AppointmentStatus = Appointment["status"];
export type PaymentMethod = Payment["method"];
export type PaymentStatus = Payment["status"];

// Derived payment badge shown on an appointment (computed from payments rows, not stored).
export type PaymentBadge = "unpaid" | "deposit" | "paid" | "refunded";
