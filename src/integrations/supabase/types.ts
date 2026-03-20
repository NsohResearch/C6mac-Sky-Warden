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
      persona_type:
        | "individual_pilot"
        | "enterprise_manager"
        | "agency_representative"
        | "developer"
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
      persona_type: [
        "individual_pilot",
        "enterprise_manager",
        "agency_representative",
        "developer",
      ],
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
      ],
    },
  },
} as const
