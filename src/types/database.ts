export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      salons: {
        Row: {
          id: string;
          name: string;
          timezone: string;
          locale_default: string;
          opening_hours: Json;
          default_appointment_duration_minutes: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          timezone?: string;
          locale_default?: string;
          opening_hours?: Json;
          default_appointment_duration_minutes?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          timezone?: string;
          locale_default?: string;
          opening_hours?: Json;
          default_appointment_duration_minutes?: number;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      salon_closures: {
        Row: {
          id: string;
          salon_id: string;
          closure_date: string;
          reason: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          salon_id: string;
          closure_date: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          closure_date?: string;
          reason?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          salon_id: string;
          role: "admin" | "staff";
          full_name: string;
          phone: string | null;
          email: string | null;
          locale: string;
          active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          salon_id: string;
          role: "admin" | "staff";
          full_name: string;
          phone?: string | null;
          email?: string | null;
          locale?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          role?: "admin" | "staff";
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          locale?: string;
          active?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          duration_minutes: number;
          price: number;
          active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          duration_minutes: number;
          price: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          name?: string;
          duration_minutes?: number;
          price?: number;
          active?: boolean;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          salon_id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          instagram_handle: string | null;
          other_socials: Json;
          acquisition_channel: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          salon_id: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          instagram_handle?: string | null;
          other_socials?: Json;
          acquisition_channel?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          instagram_handle?: string | null;
          other_socials?: Json;
          acquisition_channel?: string | null;
          notes?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          salon_id: string;
          client_id: string;
          staff_user_id: string;
          start_at: string;
          end_at: string;
          status: "scheduled" | "confirmed" | "completed" | "no_show" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          salon_id: string;
          client_id: string;
          staff_user_id: string;
          start_at: string;
          end_at: string;
          status?: "scheduled" | "confirmed" | "completed" | "no_show" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          client_id?: string;
          staff_user_id?: string;
          start_at?: string;
          end_at?: string;
          status?: "scheduled" | "confirmed" | "completed" | "no_show" | "cancelled";
          notes?: string | null;
          updated_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      appointment_services: {
        Row: {
          id: string;
          salon_id: string;
          appointment_id: string;
          service_id: string;
          price_at_booking: number;
          duration_at_booking: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          appointment_id: string;
          service_id: string;
          price_at_booking: number;
          duration_at_booking: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          price_at_booking?: number;
          duration_at_booking?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          salon_id: string;
          appointment_id: string;
          amount: number;
          method: "cash" | "card" | "transfer" | "other";
          status: "paid" | "deposit" | "refunded";
          paid_at: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          salon_id: string;
          appointment_id: string;
          amount: number;
          method: "cash" | "card" | "transfer" | "other";
          status: "paid" | "deposit" | "refunded";
          paid_at?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          amount?: number;
          method?: "cash" | "card" | "transfer" | "other";
          status?: "paid" | "deposit" | "refunded";
          paid_at?: string;
          notes?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_salon_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
