export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agency_rules: {
        Row: {
          created_at: string | null
          description: string | null
          effective_date: string | null
          enforcement_level: string | null
          expiry_date: string | null
          geometry: Json | null
          id: string
          is_active: boolean | null
          parameters: Json | null
          region: Database["public"]["Enums"]["region_code"]
          rule_type: string
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          enforcement_level?: string | null
          expiry_date?: string | null
          geometry?: Json | null
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          region: Database["public"]["Enums"]["region_code"]
          rule_type: string
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          enforcement_level?: string | null
          expiry_date?: string | null
          geometry?: Json | null
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          region?: Database["public"]["Enums"]["region_code"]
          rule_type?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      airspace_zones: {
        Row: {
          airspace_class: string | null
          authority: string | null
          auto_approval_ceiling_ft: number | null
          ceiling_ft: number | null
          center_point: Json | null
          chart_cycle: string | null
          created_at: string | null
          description: string | null
          effective_date: string | null
          expiry_date: string | null
          facility_id: string | null
          floor_ft: number | null
          geometry: Json
          id: string
          is_active: boolean | null
          laanc_enabled: boolean | null
          max_allowable_ft: number | null
          name: string
          region: Database["public"]["Enums"]["region_code"]
          requires_authorization: boolean | null
          source: string | null
          source_id: string | null
          updated_at: string | null
          zone_type: string
        }
        Insert: {
          airspace_class?: string | null
          authority?: string | null
          auto_approval_ceiling_ft?: number | null
          ceiling_ft?: number | null
          center_point?: Json | null
          chart_cycle?: string | null
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          facility_id?: string | null
          floor_ft?: number | null
          geometry: Json
          id?: string
          is_active?: boolean | null
          laanc_enabled?: boolean | null
          max_allowable_ft?: number | null
          name: string
          region: Database["public"]["Enums"]["region_code"]
          requires_authorization?: boolean | null
          source?: string | null
          source_id?: string | null
          updated_at?: string | null
          zone_type: string
        }
        Update: {
          airspace_class?: string | null
          authority?: string | null
          auto_approval_ceiling_ft?: number | null
          ceiling_ft?: number | null
          center_point?: Json | null
          chart_cycle?: string | null
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          facility_id?: string | null
          floor_ft?: number | null
          geometry?: Json
          id?: string
          is_active?: boolean | null
          laanc_enabled?: boolean | null
          max_allowable_ft?: number | null
          name?: string
          region?: Database["public"]["Enums"]["region_code"]
          requires_authorization?: boolean | null
          source?: string | null
          source_id?: string | null
          updated_at?: string | null
          zone_type?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          environment: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          rate_limit: number | null
          scopes: string[]
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          rate_limit?: number | null
          scopes?: string[]
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          rate_limit?: number | null
          scopes?: string[]
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          region: Database["public"]["Enums"]["region_code"] | null
          resource_id: string | null
          resource_type: string
          risk_level: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          region?: Database["public"]["Enums"]["region_code"] | null
          resource_id?: string | null
          resource_type: string
          risk_level?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          region?: Database["public"]["Enums"]["region_code"] | null
          resource_id?: string | null
          resource_type?: string
          risk_level?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      b4ufly_checks: {
        Row: {
          airport_count: number | null
          altitude_ft: number | null
          check_radius_nm: number | null
          check_results: Json
          checked_at: string
          id: string
          laanc_available: boolean | null
          latitude: number
          longitude: number
          national_park_nearby: boolean | null
          notam_count: number | null
          overall_advisory: Database["public"]["Enums"]["b4ufly_advisory_level"]
          region: Database["public"]["Enums"]["region_code"]
          stadium_nearby: boolean | null
          sua_count: number | null
          tenant_id: string
          tfr_count: number | null
          uasfm_ceiling_ft: number | null
          user_id: string | null
        }
        Insert: {
          airport_count?: number | null
          altitude_ft?: number | null
          check_radius_nm?: number | null
          check_results?: Json
          checked_at?: string
          id?: string
          laanc_available?: boolean | null
          latitude: number
          longitude: number
          national_park_nearby?: boolean | null
          notam_count?: number | null
          overall_advisory?: Database["public"]["Enums"]["b4ufly_advisory_level"]
          region?: Database["public"]["Enums"]["region_code"]
          stadium_nearby?: boolean | null
          sua_count?: number | null
          tenant_id: string
          tfr_count?: number | null
          uasfm_ceiling_ft?: number | null
          user_id?: string | null
        }
        Update: {
          airport_count?: number | null
          altitude_ft?: number | null
          check_radius_nm?: number | null
          check_results?: Json
          checked_at?: string
          id?: string
          laanc_available?: boolean | null
          latitude?: number
          longitude?: number
          national_park_nearby?: boolean | null
          notam_count?: number | null
          overall_advisory?: Database["public"]["Enums"]["b4ufly_advisory_level"]
          region?: Database["public"]["Enums"]["region_code"]
          stadium_nearby?: boolean | null
          sua_count?: number | null
          tenant_id?: string
          tfr_count?: number | null
          uasfm_ceiling_ft?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b4ufly_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b4ufly_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drone_registrations: {
        Row: {
          auto_renew: boolean
          category: string
          certificate_url: string | null
          created_at: string
          currency: string
          digital_drone_id: string | null
          drone_id: string
          expires_at: string | null
          fee_invoice_id: string | null
          fee_paid_at: string | null
          government_portion_fee: number
          id: string
          issued_at: string | null
          manufacturer: string
          model: string
          owner_address: Json
          owner_email: string
          owner_id: string
          owner_name: string
          platform_portion_fee: number
          previous_registration_id: string | null
          publicly_verifiable: boolean
          qr_code_url: string | null
          region: Database["public"]["Enums"]["region_code"]
          registration_fee: number
          registration_number: string | null
          registration_type: Database["public"]["Enums"]["registration_type"]
          regulatory_authority: string
          remote_id_serial: string | null
          serial_number: string
          status: Database["public"]["Enums"]["registration_status"]
          suspension_reason: string | null
          tenant_id: string
          transferred_at: string | null
          transferred_from: string | null
          updated_at: string
          verification_code: string | null
          weight_grams: number
        }
        Insert: {
          auto_renew?: boolean
          category: string
          certificate_url?: string | null
          created_at?: string
          currency?: string
          digital_drone_id?: string | null
          drone_id: string
          expires_at?: string | null
          fee_invoice_id?: string | null
          fee_paid_at?: string | null
          government_portion_fee?: number
          id?: string
          issued_at?: string | null
          manufacturer: string
          model: string
          owner_address?: Json
          owner_email: string
          owner_id: string
          owner_name: string
          platform_portion_fee?: number
          previous_registration_id?: string | null
          publicly_verifiable?: boolean
          qr_code_url?: string | null
          region?: Database["public"]["Enums"]["region_code"]
          registration_fee?: number
          registration_number?: string | null
          registration_type?: Database["public"]["Enums"]["registration_type"]
          regulatory_authority?: string
          remote_id_serial?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["registration_status"]
          suspension_reason?: string | null
          tenant_id: string
          transferred_at?: string | null
          transferred_from?: string | null
          updated_at?: string
          verification_code?: string | null
          weight_grams?: number
        }
        Update: {
          auto_renew?: boolean
          category?: string
          certificate_url?: string | null
          created_at?: string
          currency?: string
          digital_drone_id?: string | null
          drone_id?: string
          expires_at?: string | null
          fee_invoice_id?: string | null
          fee_paid_at?: string | null
          government_portion_fee?: number
          id?: string
          issued_at?: string | null
          manufacturer?: string
          model?: string
          owner_address?: Json
          owner_email?: string
          owner_id?: string
          owner_name?: string
          platform_portion_fee?: number
          previous_registration_id?: string | null
          publicly_verifiable?: boolean
          qr_code_url?: string | null
          region?: Database["public"]["Enums"]["region_code"]
          registration_fee?: number
          registration_number?: string | null
          registration_type?: Database["public"]["Enums"]["registration_type"]
          regulatory_authority?: string
          remote_id_serial?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["registration_status"]
          suspension_reason?: string | null
          tenant_id?: string
          transferred_at?: string | null
          transferred_from?: string | null
          updated_at?: string
          verification_code?: string | null
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "drone_registrations_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drone_registrations_fee_invoice_id_fkey"
            columns: ["fee_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drone_registrations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drone_registrations_previous_registration_id_fkey"
            columns: ["previous_registration_id"]
            isOneToOne: false
            referencedRelation: "drone_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drone_registrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      drones: {
        Row: {
          battery_cycle_count: number | null
          category: string
          created_at: string | null
          current_location: Json | null
          documents: Json | null
          faa_registration_number: string | null
          firmware_version: string | null
          id: string
          image_url: string | null
          manufacturer: string
          max_altitude_ft: number | null
          max_flight_time_minutes: number | null
          max_speed_mps: number | null
          model: string
          national_registration_number: string | null
          next_maintenance_due: string | null
          nickname: string | null
          region: Database["public"]["Enums"]["region_code"]
          registration_expiry: string | null
          remote_id_compliant: boolean | null
          remote_id_serial: string | null
          remote_id_type: string | null
          serial_number: string
          status: string
          tags: string[] | null
          tc_registration_number: string | null
          tenant_id: string
          total_flight_hours: number | null
          total_flights: number | null
          updated_at: string | null
          weight_grams: number | null
        }
        Insert: {
          battery_cycle_count?: number | null
          category: string
          created_at?: string | null
          current_location?: Json | null
          documents?: Json | null
          faa_registration_number?: string | null
          firmware_version?: string | null
          id?: string
          image_url?: string | null
          manufacturer: string
          max_altitude_ft?: number | null
          max_flight_time_minutes?: number | null
          max_speed_mps?: number | null
          model: string
          national_registration_number?: string | null
          next_maintenance_due?: string | null
          nickname?: string | null
          region: Database["public"]["Enums"]["region_code"]
          registration_expiry?: string | null
          remote_id_compliant?: boolean | null
          remote_id_serial?: string | null
          remote_id_type?: string | null
          serial_number: string
          status?: string
          tags?: string[] | null
          tc_registration_number?: string | null
          tenant_id: string
          total_flight_hours?: number | null
          total_flights?: number | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Update: {
          battery_cycle_count?: number | null
          category?: string
          created_at?: string | null
          current_location?: Json | null
          documents?: Json | null
          faa_registration_number?: string | null
          firmware_version?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string
          max_altitude_ft?: number | null
          max_flight_time_minutes?: number | null
          max_speed_mps?: number | null
          model?: string
          national_registration_number?: string | null
          next_maintenance_due?: string | null
          nickname?: string | null
          region?: Database["public"]["Enums"]["region_code"]
          registration_expiry?: string | null
          remote_id_compliant?: boolean | null
          remote_id_serial?: string | null
          remote_id_type?: string | null
          serial_number?: string
          status?: string
          tags?: string[] | null
          tc_registration_number?: string | null
          tenant_id?: string
          total_flight_hours?: number | null
          total_flights?: number | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_authorizations: {
        Row: {
          airspace_class: string | null
          approved_altitude_ft: number | null
          authorization_type: string
          conditions: string[] | null
          created_at: string | null
          decided_at: string | null
          denial_reason: string | null
          drone_id: string | null
          end_time: string
          facility_id: string | null
          id: string
          operation_area: Json
          pilot_id: string | null
          reference_code: string
          region: Database["public"]["Enums"]["region_code"]
          requested_altitude_ft: number
          response_time_ms: number | null
          reviewed_by: string | null
          start_time: string
          status: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          airspace_class?: string | null
          approved_altitude_ft?: number | null
          authorization_type: string
          conditions?: string[] | null
          created_at?: string | null
          decided_at?: string | null
          denial_reason?: string | null
          drone_id?: string | null
          end_time: string
          facility_id?: string | null
          id?: string
          operation_area: Json
          pilot_id?: string | null
          reference_code: string
          region: Database["public"]["Enums"]["region_code"]
          requested_altitude_ft: number
          response_time_ms?: number | null
          reviewed_by?: string | null
          start_time: string
          status?: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          airspace_class?: string | null
          approved_altitude_ft?: number | null
          authorization_type?: string
          conditions?: string[] | null
          created_at?: string | null
          decided_at?: string | null
          denial_reason?: string | null
          drone_id?: string | null
          end_time?: string
          facility_id?: string | null
          id?: string
          operation_area?: Json
          pilot_id?: string | null
          reference_code?: string
          region?: Database["public"]["Enums"]["region_code"]
          requested_altitude_ft?: number
          response_time_ms?: number | null
          reviewed_by?: string | null
          start_time?: string
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_authorizations_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_authorizations_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_authorizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      government_disbursements: {
        Row: {
          completed_at: string | null
          created_at: string
          currency: string
          disbursement_method: Database["public"]["Enums"]["disbursement_method"]
          id: string
          period_end: string
          period_start: string
          record_count: number
          reference: string | null
          region: Database["public"]["Enums"]["region_code"]
          regulatory_authority: string
          status: Database["public"]["Enums"]["disbursement_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          disbursement_method?: Database["public"]["Enums"]["disbursement_method"]
          id?: string
          period_end: string
          period_start: string
          record_count?: number
          reference?: string | null
          region: Database["public"]["Enums"]["region_code"]
          regulatory_authority: string
          status?: Database["public"]["Enums"]["disbursement_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          disbursement_method?: Database["public"]["Enums"]["disbursement_method"]
          id?: string
          period_end?: string
          period_start?: string
          record_count?: number
          reference?: string | null
          region?: Database["public"]["Enums"]["region_code"]
          regulatory_authority?: string
          status?: Database["public"]["Enums"]["disbursement_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      government_revenue_records: {
        Row: {
          category: Database["public"]["Enums"]["gov_revenue_category"]
          created_at: string
          currency: string
          description: string | null
          disbursed: boolean
          disbursed_at: string | null
          disbursement_reference: string | null
          government_amount: number
          gross_amount: number
          id: string
          period_end: string | null
          period_start: string | null
          platform_commission: number
          reference_id: string | null
          reference_type: string | null
          region: Database["public"]["Enums"]["region_code"]
          regulatory_authority: string
          tenant_id: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["gov_revenue_category"]
          created_at?: string
          currency?: string
          description?: string | null
          disbursed?: boolean
          disbursed_at?: string | null
          disbursement_reference?: string | null
          government_amount?: number
          gross_amount?: number
          id?: string
          period_end?: string | null
          period_start?: string | null
          platform_commission?: number
          reference_id?: string | null
          reference_type?: string | null
          region: Database["public"]["Enums"]["region_code"]
          regulatory_authority: string
          tenant_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["gov_revenue_category"]
          created_at?: string
          currency?: string
          description?: string | null
          disbursed?: boolean
          disbursed_at?: string | null
          disbursement_reference?: string | null
          government_amount?: number
          gross_amount?: number
          id?: string
          period_end?: string | null
          period_start?: string | null
          platform_commission?: number
          reference_id?: string | null
          reference_type?: string | null
          region?: Database["public"]["Enums"]["region_code"]
          regulatory_authority?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_revenue_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          category: Database["public"]["Enums"]["line_item_category"]
          created_at: string
          description: string
          id: string
          invoice_id: string
          metadata: Json
          quantity: number
          revenue_recipient: Database["public"]["Enums"]["revenue_recipient"]
          taxable: boolean
          total_price: number
          unit_price: number
        }
        Insert: {
          category: Database["public"]["Enums"]["line_item_category"]
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          metadata?: Json
          quantity?: number
          revenue_recipient?: Database["public"]["Enums"]["revenue_recipient"]
          taxable?: boolean
          total_price?: number
          unit_price?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["line_item_category"]
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          metadata?: Json
          quantity?: number
          revenue_recipient?: Database["public"]["Enums"]["revenue_recipient"]
          taxable?: boolean
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          currency: string
          due_date: string | null
          government_fees: number
          id: string
          invoice_number: string
          issued_at: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          pdf_url: string | null
          platform_fees: number
          receipt_url: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subscription_id: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          due_date?: string | null
          government_fees?: number
          id?: string
          invoice_number: string
          issued_at?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          platform_fees?: number
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subscription_id?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          tenant_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          due_date?: string | null
          government_fees?: number
          id?: string
          invoice_number?: string
          issued_at?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          platform_fees?: number
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subscription_id?: string | null
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          authorization_status: string | null
          created_at: string | null
          description: string | null
          drone_id: string | null
          flight_log: Json | null
          id: string
          incidents: Json | null
          laanc_authorization_id: string | null
          launch_point: Json | null
          max_altitude_ft: number | null
          mission_type: string
          notes: string | null
          operation_area: Json | null
          pilot_id: string | null
          preflight_checklist: Json | null
          region: Database["public"]["Enums"]["region_code"]
          risk_score: number | null
          scheduled_end: string | null
          scheduled_start: string | null
          status: string
          tenant_id: string
          title: string
          updated_at: string | null
          waypoints: Json | null
          weather_check: Json | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          authorization_status?: string | null
          created_at?: string | null
          description?: string | null
          drone_id?: string | null
          flight_log?: Json | null
          id?: string
          incidents?: Json | null
          laanc_authorization_id?: string | null
          launch_point?: Json | null
          max_altitude_ft?: number | null
          mission_type: string
          notes?: string | null
          operation_area?: Json | null
          pilot_id?: string | null
          preflight_checklist?: Json | null
          region: Database["public"]["Enums"]["region_code"]
          risk_score?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string | null
          waypoints?: Json | null
          weather_check?: Json | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          authorization_status?: string | null
          created_at?: string | null
          description?: string | null
          drone_id?: string | null
          flight_log?: Json | null
          id?: string
          incidents?: Json | null
          laanc_authorization_id?: string | null
          launch_point?: Json | null
          max_altitude_ft?: number | null
          mission_type?: string
          notes?: string | null
          operation_area?: Json | null
          pilot_id?: string | null
          preflight_checklist?: Json | null
          region?: Database["public"]["Enums"]["region_code"]
          risk_score?: number | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
          waypoints?: Json | null
          weather_check?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          tenant_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          tenant_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          tenant_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_last4: string | null
          bank_name: string | null
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string
          external_payment_method_id: string | null
          id: string
          is_default: boolean
          mobile_number: string | null
          mobile_provider:
            | Database["public"]["Enums"]["mobile_money_provider"]
            | null
          tenant_id: string
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at: string
        }
        Insert: {
          account_last4?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          external_payment_method_id?: string | null
          id?: string
          is_default?: boolean
          mobile_number?: string | null
          mobile_provider?:
            | Database["public"]["Enums"]["mobile_money_provider"]
            | null
          tenant_id: string
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
        }
        Update: {
          account_last4?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          external_payment_method_id?: string | null
          id?: string
          is_default?: boolean
          mobile_number?: string | null
          mobile_provider?:
            | Database["public"]["Enums"]["mobile_money_provider"]
            | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_profiles: {
        Row: {
          assigned_drone_ids: string[] | null
          created_at: string | null
          endorsements: string[] | null
          faa_tracking_number: string | null
          id: string
          insurance_expiry: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          medical_certificate_expiry: string | null
          national_license_authority: string | null
          national_license_expiry: string | null
          national_license_number: string | null
          part107_certificate_number: string | null
          part107_expires_at: string | null
          region: Database["public"]["Enums"]["region_code"]
          rpas_advanced_certificate: string | null
          rpas_basic_certificate: string | null
          sfoc_numbers: string[] | null
          tc_pilot_certificate_expiry: string | null
          tenant_id: string | null
          total_flight_hours: number | null
          trust_completion_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_drone_ids?: string[] | null
          created_at?: string | null
          endorsements?: string[] | null
          faa_tracking_number?: string | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_certificate_expiry?: string | null
          national_license_authority?: string | null
          national_license_expiry?: string | null
          national_license_number?: string | null
          part107_certificate_number?: string | null
          part107_expires_at?: string | null
          region: Database["public"]["Enums"]["region_code"]
          rpas_advanced_certificate?: string | null
          rpas_basic_certificate?: string | null
          sfoc_numbers?: string[] | null
          tc_pilot_certificate_expiry?: string | null
          tenant_id?: string | null
          total_flight_hours?: number | null
          trust_completion_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_drone_ids?: string[] | null
          created_at?: string | null
          endorsements?: string[] | null
          faa_tracking_number?: string | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_certificate_expiry?: string | null
          national_license_authority?: string | null
          national_license_expiry?: string | null
          national_license_number?: string | null
          part107_certificate_number?: string | null
          part107_expires_at?: string | null
          region?: Database["public"]["Enums"]["region_code"]
          rpas_advanced_certificate?: string | null
          rpas_basic_certificate?: string | null
          sfoc_numbers?: string[] | null
          tc_pilot_certificate_expiry?: string | null
          tenant_id?: string | null
          total_flight_hours?: number | null
          trust_completion_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pilot_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_fee_schedules: {
        Row: {
          commercial_annual_fee: number
          created_at: string
          currency: string
          educational_fee: number
          effective_date: string
          event_per_day_fee: number
          government_fee: number
          government_revenue_split: number
          id: string
          is_active: boolean
          late_fee_percentage: number
          platform_revenue_split: number
          region: Database["public"]["Enums"]["region_code"]
          replacement_fee: number
          researcher_30day_fee: number
          standard_annual_fee: number
          temp_operator_90day_fee: number
          tourist_7day_fee: number
          transfer_fee: number
          updated_at: string
        }
        Insert: {
          commercial_annual_fee?: number
          created_at?: string
          currency?: string
          educational_fee?: number
          effective_date?: string
          event_per_day_fee?: number
          government_fee?: number
          government_revenue_split?: number
          id?: string
          is_active?: boolean
          late_fee_percentage?: number
          platform_revenue_split?: number
          region: Database["public"]["Enums"]["region_code"]
          replacement_fee?: number
          researcher_30day_fee?: number
          standard_annual_fee?: number
          temp_operator_90day_fee?: number
          tourist_7day_fee?: number
          transfer_fee?: number
          updated_at?: string
        }
        Update: {
          commercial_annual_fee?: number
          created_at?: string
          currency?: string
          educational_fee?: number
          effective_date?: string
          event_per_day_fee?: number
          government_fee?: number
          government_revenue_split?: number
          id?: string
          is_active?: boolean
          late_fee_percentage?: number
          platform_revenue_split?: number
          region?: Database["public"]["Enums"]["region_code"]
          replacement_fee?: number
          researcher_30day_fee?: number
          standard_annual_fee?: number
          temp_operator_90day_fee?: number
          tourist_7day_fee?: number
          transfer_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      remote_id_broadcasts: {
        Row: {
          broadcast_method: string | null
          drone_id: string | null
          id: string
          operator_altitude_ft: number | null
          operator_latitude: number | null
          operator_longitude: number | null
          region: Database["public"]["Enums"]["region_code"]
          tenant_id: string | null
          timestamp: string
          uas_altitude_ft: number | null
          uas_heading_deg: number | null
          uas_id: string
          uas_latitude: number | null
          uas_longitude: number | null
          uas_speed_mps: number | null
        }
        Insert: {
          broadcast_method?: string | null
          drone_id?: string | null
          id?: string
          operator_altitude_ft?: number | null
          operator_latitude?: number | null
          operator_longitude?: number | null
          region: Database["public"]["Enums"]["region_code"]
          tenant_id?: string | null
          timestamp?: string
          uas_altitude_ft?: number | null
          uas_heading_deg?: number | null
          uas_id: string
          uas_latitude?: number | null
          uas_longitude?: number | null
          uas_speed_mps?: number | null
        }
        Update: {
          broadcast_method?: string | null
          drone_id?: string | null
          id?: string
          operator_altitude_ft?: number | null
          operator_latitude?: number | null
          operator_longitude?: number | null
          region?: Database["public"]["Enums"]["region_code"]
          tenant_id?: string | null
          timestamp?: string
          uas_altitude_ft?: number | null
          uas_heading_deg?: number | null
          uas_id?: string
          uas_latitude?: number | null
          uas_longitude?: number | null
          uas_speed_mps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "remote_id_broadcasts_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remote_id_broadcasts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      remote_id_compliance: {
        Row: {
          altitude_accuracy_ft: number | null
          broadcast_performance_pass: boolean | null
          broadcast_rate_hz: number | null
          compliance_type: Database["public"]["Enums"]["rid_compliance_type"]
          created_at: string
          drone_id: string
          id: string
          is_compliant: boolean | null
          last_verified_at: string | null
          latency_seconds: number | null
          next_verification_due: string | null
          position_accuracy_ft: number | null
          serial_format: string | null
          serial_number_valid: boolean | null
          tenant_id: string
          updated_at: string
          verification_notes: string | null
        }
        Insert: {
          altitude_accuracy_ft?: number | null
          broadcast_performance_pass?: boolean | null
          broadcast_rate_hz?: number | null
          compliance_type?: Database["public"]["Enums"]["rid_compliance_type"]
          created_at?: string
          drone_id: string
          id?: string
          is_compliant?: boolean | null
          last_verified_at?: string | null
          latency_seconds?: number | null
          next_verification_due?: string | null
          position_accuracy_ft?: number | null
          serial_format?: string | null
          serial_number_valid?: boolean | null
          tenant_id: string
          updated_at?: string
          verification_notes?: string | null
        }
        Update: {
          altitude_accuracy_ft?: number | null
          broadcast_performance_pass?: boolean | null
          broadcast_rate_hz?: number | null
          compliance_type?: Database["public"]["Enums"]["rid_compliance_type"]
          created_at?: string
          drone_id?: string
          id?: string
          is_compliant?: boolean | null
          last_verified_at?: string | null
          latency_seconds?: number | null
          next_verification_due?: string | null
          position_accuracy_ft?: number | null
          serial_format?: string | null
          serial_number_valid?: boolean | null
          tenant_id?: string
          updated_at?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remote_id_compliance_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remote_id_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          id: string
          is_system: boolean | null
          name: string
          permissions: string[]
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          permissions?: string[]
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          permissions?: string[]
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_reports: {
        Row: {
          airspace_violation: boolean | null
          assigned_to: string | null
          attachments: Json | null
          corrective_actions: string | null
          created_at: string
          description: string | null
          drone_id: string | null
          enforcement_protection: boolean | null
          filing_deadline: string | null
          id: string
          incident_date: string
          injury_severity: string | null
          investigation_closed_at: string | null
          investigation_notes: Json | null
          investigation_started_at: string | null
          involves_injury: boolean | null
          lessons_learned: string | null
          location_coords: Json | null
          location_description: string | null
          mission_id: string | null
          nasa_6_conditions_met: boolean | null
          nasa_asrs_number: string | null
          property_damage_usd: number | null
          region: Database["public"]["Enums"]["region_code"]
          report_type: Database["public"]["Enums"]["safety_report_type"]
          reporter_id: string | null
          root_cause: string | null
          status: Database["public"]["Enums"]["safety_report_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          airspace_violation?: boolean | null
          assigned_to?: string | null
          attachments?: Json | null
          corrective_actions?: string | null
          created_at?: string
          description?: string | null
          drone_id?: string | null
          enforcement_protection?: boolean | null
          filing_deadline?: string | null
          id?: string
          incident_date: string
          injury_severity?: string | null
          investigation_closed_at?: string | null
          investigation_notes?: Json | null
          investigation_started_at?: string | null
          involves_injury?: boolean | null
          lessons_learned?: string | null
          location_coords?: Json | null
          location_description?: string | null
          mission_id?: string | null
          nasa_6_conditions_met?: boolean | null
          nasa_asrs_number?: string | null
          property_damage_usd?: number | null
          region?: Database["public"]["Enums"]["region_code"]
          report_type?: Database["public"]["Enums"]["safety_report_type"]
          reporter_id?: string | null
          root_cause?: string | null
          status?: Database["public"]["Enums"]["safety_report_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          airspace_violation?: boolean | null
          assigned_to?: string | null
          attachments?: Json | null
          corrective_actions?: string | null
          created_at?: string
          description?: string | null
          drone_id?: string | null
          enforcement_protection?: boolean | null
          filing_deadline?: string | null
          id?: string
          incident_date?: string
          injury_severity?: string | null
          investigation_closed_at?: string | null
          investigation_notes?: Json | null
          investigation_started_at?: string | null
          involves_injury?: boolean | null
          lessons_learned?: string | null
          location_coords?: Json | null
          location_description?: string | null
          mission_id?: string | null
          nasa_6_conditions_met?: boolean | null
          nasa_asrs_number?: string | null
          property_damage_usd?: number | null
          region?: Database["public"]["Enums"]["region_code"]
          report_type?: Database["public"]["Enums"]["safety_report_type"]
          reporter_id?: string | null
          root_cause?: string | null
          status?: Database["public"]["Enums"]["safety_report_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_reports_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          annual_amount: number
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          external_customer_id: string | null
          external_subscription_id: string | null
          id: string
          monthly_amount: number
          next_payment_date: string | null
          past_due_amount: number
          payment_method_id: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          status: Database["public"]["Enums"]["subscription_status"]
          tenant_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          annual_amount?: number
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          monthly_amount?: number
          next_payment_date?: string | null
          past_due_amount?: number
          payment_method_id?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          status?: Database["public"]["Enums"]["subscription_status"]
          tenant_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          annual_amount?: number
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          monthly_amount?: number
          next_payment_date?: string | null
          past_due_amount?: number
          payment_method_id?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          status?: Database["public"]["Enums"]["subscription_status"]
          tenant_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      temporary_permits: {
        Row: {
          applicant_email: string
          applicant_name: string
          applicant_nationality: string | null
          applicant_phone: string | null
          applicant_type: Database["public"]["Enums"]["temporary_permit_applicant_type"]
          approval_conditions: string[]
          created_at: string
          currency: string
          denial_reason: string | null
          duration_days: number
          end_date: string
          id: string
          max_renewals: number
          operation_area: Json | null
          operation_description: string | null
          operation_locations: string[]
          passport_number: string | null
          permit_fee: number
          permit_type: Database["public"]["Enums"]["temporary_permit_type"]
          purpose: string
          registration_id: string
          renewal_count: number
          required_documents: Json
          security_deposit: number
          start_date: string
          status: Database["public"]["Enums"]["temporary_permit_status"]
          updated_at: string
        }
        Insert: {
          applicant_email: string
          applicant_name: string
          applicant_nationality?: string | null
          applicant_phone?: string | null
          applicant_type: Database["public"]["Enums"]["temporary_permit_applicant_type"]
          approval_conditions?: string[]
          created_at?: string
          currency?: string
          denial_reason?: string | null
          duration_days: number
          end_date: string
          id?: string
          max_renewals?: number
          operation_area?: Json | null
          operation_description?: string | null
          operation_locations?: string[]
          passport_number?: string | null
          permit_fee?: number
          permit_type: Database["public"]["Enums"]["temporary_permit_type"]
          purpose: string
          registration_id: string
          renewal_count?: number
          required_documents?: Json
          security_deposit?: number
          start_date: string
          status?: Database["public"]["Enums"]["temporary_permit_status"]
          updated_at?: string
        }
        Update: {
          applicant_email?: string
          applicant_name?: string
          applicant_nationality?: string | null
          applicant_phone?: string | null
          applicant_type?: Database["public"]["Enums"]["temporary_permit_applicant_type"]
          approval_conditions?: string[]
          created_at?: string
          currency?: string
          denial_reason?: string | null
          duration_days?: number
          end_date?: string
          id?: string
          max_renewals?: number
          operation_area?: Json | null
          operation_description?: string | null
          operation_locations?: string[]
          passport_number?: string | null
          permit_fee?: number
          permit_type?: Database["public"]["Enums"]["temporary_permit_type"]
          purpose?: string
          registration_id?: string
          renewal_count?: number
          required_documents?: Json
          security_deposit?: number
          start_date?: string
          status?: Database["public"]["Enums"]["temporary_permit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "temporary_permits_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "drone_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          country_name: string
          created_at: string | null
          id: string
          name: string
          plan: string
          region: Database["public"]["Enums"]["region_code"]
          regulatory_authority: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          country_name?: string
          created_at?: string | null
          id?: string
          name: string
          plan?: string
          region?: Database["public"]["Enums"]["region_code"]
          regulatory_authority?: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          country_name?: string
          created_at?: string | null
          id?: string
          name?: string
          plan?: string
          region?: Database["public"]["Enums"]["region_code"]
          regulatory_authority?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_records: {
        Row: {
          id: string
          metric: Database["public"]["Enums"]["usage_metric"]
          period_end: string
          period_start: string
          quantity: number
          recorded_at: string
          subscription_id: string | null
          tenant_id: string
        }
        Insert: {
          id?: string
          metric: Database["public"]["Enums"]["usage_metric"]
          period_end: string
          period_start: string
          quantity?: number
          recorded_at?: string
          subscription_id?: string | null
          tenant_id: string
        }
        Update: {
          id?: string
          metric?: Database["public"]["Enums"]["usage_metric"]
          period_end?: string
          period_start?: string
          quantity?: number
          recorded_at?: string
          subscription_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string
          email: string
          id: string
          onboarding_completed: boolean | null
          persona: Database["public"]["Enums"]["persona_type"]
          phone: string | null
          region: Database["public"]["Enums"]["region_code"]
          tenant_id: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name: string
          email: string
          id: string
          onboarding_completed?: boolean | null
          persona?: Database["public"]["Enums"]["persona_type"]
          phone?: string | null
          region?: Database["public"]["Enums"]["region_code"]
          tenant_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string
          email?: string
          id?: string
          onboarding_completed?: boolean | null
          persona?: Database["public"]["Enums"]["persona_type"]
          phone?: string | null
          region?: Database["public"]["Enums"]["region_code"]
          tenant_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant_id: { Args: never; Returns: string }
    }
    Enums: {
      b4ufly_advisory_level: "green" | "yellow" | "red"
      billing_cycle: "monthly" | "annual"
      disbursement_method: "wire_transfer" | "ach" | "eft" | "mobile_money"
      disbursement_status: "pending" | "processing" | "completed" | "failed"
      gov_revenue_category:
        | "registration"
        | "authorization"
        | "certification"
        | "penalty"
        | "exam"
      invoice_status:
        | "draft"
        | "issued"
        | "paid"
        | "partially_paid"
        | "overdue"
        | "void"
        | "refunded"
      line_item_category:
        | "subscription"
        | "registration"
        | "authorization"
        | "api_usage"
        | "addon"
        | "government_fee"
        | "penalty"
      mobile_money_provider:
        | "mpesa"
        | "mtn_momo"
        | "airtel_money"
        | "orange_money"
      payment_method_type:
        | "credit_card"
        | "bank_transfer"
        | "mobile_money"
        | "paypal"
        | "wire_transfer"
        | "invoice"
      persona_type:
        | "individual_pilot"
        | "enterprise_manager"
        | "agency_representative"
        | "developer"
      plan_tier: "free" | "pro" | "enterprise" | "agency" | "developer"
      region_code:
        | "US"
        | "CA"
        | "NG"
        | "KE"
        | "ZA"
        | "GH"
        | "RW"
        | "TZ"
        | "ET"
        | "SN"
        | "CI"
        | "UG"
        | "TD"
        | "CF"
        | "CG"
        | "GQ"
        | "GA"
        | "BW"
        | "ZM"
        | "SS"
        | "AO"
        | "CD"
      registration_status:
        | "pending_payment"
        | "pending_review"
        | "active"
        | "expired"
        | "suspended"
        | "revoked"
        | "transferred"
      registration_type:
        | "standard"
        | "commercial"
        | "government"
        | "educational"
        | "temporary"
      revenue_recipient: "platform" | "government"
      rid_compliance_type: "standard_rid" | "broadcast_module" | "fria"
      safety_report_status:
        | "draft"
        | "submitted"
        | "under_investigation"
        | "closed"
        | "overdue"
      safety_report_type: "mandatory" | "voluntary_nasa_asrs"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "paused"
        | "cancelled"
        | "expired"
      temporary_permit_applicant_type:
        | "tourist"
        | "researcher"
        | "commercial_visitor"
        | "event_organizer"
        | "ngo"
        | "media"
      temporary_permit_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "denied"
        | "active"
        | "expired"
        | "revoked"
      temporary_permit_type:
        | "tourist"
        | "researcher"
        | "temporary_operator"
        | "event"
      usage_metric:
        | "api_calls"
        | "missions"
        | "flight_hours"
        | "authorizations"
        | "storage_gb"
        | "drones_registered"
        | "active_pilots"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      b4ufly_advisory_level: ["green", "yellow", "red"],
      billing_cycle: ["monthly", "annual"],
      disbursement_method: ["wire_transfer", "ach", "eft", "mobile_money"],
      disbursement_status: ["pending", "processing", "completed", "failed"],
      gov_revenue_category: [
        "registration",
        "authorization",
        "certification",
        "penalty",
        "exam",
      ],
      invoice_status: [
        "draft",
        "issued",
        "paid",
        "partially_paid",
        "overdue",
        "void",
        "refunded",
      ],
      line_item_category: [
        "subscription",
        "registration",
        "authorization",
        "api_usage",
        "addon",
        "government_fee",
        "penalty",
      ],
      mobile_money_provider: [
        "mpesa",
        "mtn_momo",
        "airtel_money",
        "orange_money",
      ],
      payment_method_type: [
        "credit_card",
        "bank_transfer",
        "mobile_money",
        "paypal",
        "wire_transfer",
        "invoice",
      ],
      persona_type: [
        "individual_pilot",
        "enterprise_manager",
        "agency_representative",
        "developer",
      ],
      plan_tier: ["free", "pro", "enterprise", "agency", "developer"],
      region_code: [
        "US",
        "CA",
        "NG",
        "KE",
        "ZA",
        "GH",
        "RW",
        "TZ",
        "ET",
        "SN",
        "CI",
        "UG",
        "TD",
        "CF",
        "CG",
        "GQ",
        "GA",
        "BW",
        "ZM",
        "SS",
        "AO",
        "CD",
      ],
      registration_status: [
        "pending_payment",
        "pending_review",
        "active",
        "expired",
        "suspended",
        "revoked",
        "transferred",
      ],
      registration_type: [
        "standard",
        "commercial",
        "government",
        "educational",
        "temporary",
      ],
      revenue_recipient: ["platform", "government"],
      rid_compliance_type: ["standard_rid", "broadcast_module", "fria"],
      safety_report_status: [
        "draft",
        "submitted",
        "under_investigation",
        "closed",
        "overdue",
      ],
      safety_report_type: ["mandatory", "voluntary_nasa_asrs"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "paused",
        "cancelled",
        "expired",
      ],
      temporary_permit_applicant_type: [
        "tourist",
        "researcher",
        "commercial_visitor",
        "event_organizer",
        "ngo",
        "media",
      ],
      temporary_permit_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "denied",
        "active",
        "expired",
        "revoked",
      ],
      temporary_permit_type: [
        "tourist",
        "researcher",
        "temporary_operator",
        "event",
      ],
      usage_metric: [
        "api_calls",
        "missions",
        "flight_hours",
        "authorizations",
        "storage_gb",
        "drones_registered",
        "active_pilots",
      ],
    },
  },
} as const
