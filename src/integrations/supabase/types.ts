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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      formula_agencies: {
        Row: {
          created_at: string
          display_name: string
          id: string
          kind: string
          source_id: string
          source_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          kind: string
          source_id: string
          source_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          kind?: string
          source_id?: string
          source_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      formula_agency_memberships: {
        Row: {
          agency_id: string
          created_at: string
          id: string
          is_primary: boolean
          member_id: string
          membership_role: string
          source_id: string
          source_type: string
          state: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          member_id: string
          membership_role: string
          source_id: string
          source_type: string
          state?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          member_id?: string
          membership_role?: string
          source_id?: string
          source_type?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formula_agency_memberships_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "formula_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formula_agency_memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "formula_members"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_auth_identities: {
        Row: {
          created_at: string
          id: string
          link_state: string
          linked_at: string | null
          member_id: string
          provider: string
          provider_subject: string
          revoked_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_state?: string
          linked_at?: string | null
          member_id: string
          provider?: string
          provider_subject: string
          revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          link_state?: string
          linked_at?: string | null
          member_id?: string
          provider?: string
          provider_subject?: string
          revoked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formula_auth_identities_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "formula_members"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_entitlements: {
        Row: {
          access_state: string
          agency_business_module_slugs: string[]
          ai_capture_allowed: boolean
          capture_write_from: string | null
          capture_write_until: string | null
          created_at: string
          dashboard_read_allowed: boolean
          dashboard_read_until: string | null
          event_attendance_allowed: boolean
          event_registration_id: string
          id: string
          partner_hub_allowed: boolean
          personal_module_slugs: string[]
          projection_version: number
          publisher_module_slugs: string[]
          revocation_version: number
          revoked_at: string | null
          updated_at: string
        }
        Insert: {
          access_state?: string
          agency_business_module_slugs?: string[]
          ai_capture_allowed?: boolean
          capture_write_from?: string | null
          capture_write_until?: string | null
          created_at?: string
          dashboard_read_allowed?: boolean
          dashboard_read_until?: string | null
          event_attendance_allowed?: boolean
          event_registration_id: string
          id?: string
          partner_hub_allowed?: boolean
          personal_module_slugs?: string[]
          projection_version?: number
          publisher_module_slugs?: string[]
          revocation_version?: number
          revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          access_state?: string
          agency_business_module_slugs?: string[]
          ai_capture_allowed?: boolean
          capture_write_from?: string | null
          capture_write_until?: string | null
          created_at?: string
          dashboard_read_allowed?: boolean
          dashboard_read_until?: string | null
          event_attendance_allowed?: boolean
          event_registration_id?: string
          id?: string
          partner_hub_allowed?: boolean
          personal_module_slugs?: string[]
          projection_version?: number
          publisher_module_slugs?: string[]
          revocation_version?: number
          revoked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formula_entitlements_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: true
            referencedRelation: "formula_event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_event_registrations: {
        Row: {
          agency_id: string | null
          checked_in_at: string | null
          claim_state: string
          claimed_at: string | null
          created_at: string
          event_id: string
          event_role: string
          id: string
          invited_email: string | null
          invited_name: string | null
          member_id: string | null
          normalized_email: string | null
          registration_state: string
          revoked_at: string | null
          seat_type: string
          source_record_id: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          checked_in_at?: string | null
          claim_state?: string
          claimed_at?: string | null
          created_at?: string
          event_id: string
          event_role: string
          id?: string
          invited_email?: string | null
          invited_name?: string | null
          member_id?: string | null
          normalized_email?: string | null
          registration_state?: string
          revoked_at?: string | null
          seat_type: string
          source_record_id: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          checked_in_at?: string | null
          claim_state?: string
          claimed_at?: string | null
          created_at?: string
          event_id?: string
          event_role?: string
          id?: string
          invited_email?: string | null
          invited_name?: string | null
          member_id?: string | null
          normalized_email?: string | null
          registration_state?: string
          revoked_at?: string | null
          seat_type?: string
          source_record_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formula_event_registrations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "formula_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formula_event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "formula_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formula_event_registrations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "formula_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formula_event_registrations_source_record_id_fkey"
            columns: ["source_record_id"]
            isOneToOne: true
            referencedRelation: "formula_registration_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_events: {
        Row: {
          capture_write_from: string | null
          capture_write_until: string | null
          created_at: string
          dashboard_read_until: string | null
          display_name: string
          ends_at: string
          id: string
          registry_hash: string
          registry_version: number
          slug: string
          starts_at: string
          state: string
          timezone: string
          updated_at: string
        }
        Insert: {
          capture_write_from?: string | null
          capture_write_until?: string | null
          created_at?: string
          dashboard_read_until?: string | null
          display_name: string
          ends_at: string
          id: string
          registry_hash: string
          registry_version: number
          slug: string
          starts_at: string
          state?: string
          timezone: string
          updated_at?: string
        }
        Update: {
          capture_write_from?: string | null
          capture_write_until?: string | null
          created_at?: string
          dashboard_read_until?: string | null
          display_name?: string
          ends_at?: string
          id?: string
          registry_hash?: string
          registry_version?: number
          slug?: string
          starts_at?: string
          state?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      formula_member_emails: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          member_id: string
          normalized_email: string
          original_email: string
          source_id: string
          source_type: string
          state: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          member_id: string
          normalized_email: string
          original_email: string
          source_id: string
          source_type: string
          state?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          member_id?: string
          normalized_email?: string
          original_email?: string
          source_id?: string
          source_type?: string
          state?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formula_member_emails_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "formula_members"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_members: {
        Row: {
          created_at: string
          id: string
          status: string
          superseded_by_member_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          superseded_by_member_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          superseded_by_member_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formula_members_superseded_by_member_id_fkey"
            columns: ["superseded_by_member_id"]
            isOneToOne: false
            referencedRelation: "formula_members"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_registration_sources: {
        Row: {
          created_at: string
          event_id: string
          id: string
          invited_email: string | null
          invited_name: string | null
          normalized_email: string | null
          reconciliation_state: string
          registration_id: string | null
          review_reason: string | null
          source_id: string
          source_ordinal: number
          source_payload_hash: string
          source_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          invited_email?: string | null
          invited_name?: string | null
          normalized_email?: string | null
          reconciliation_state: string
          registration_id?: string | null
          review_reason?: string | null
          source_id: string
          source_ordinal: number
          source_payload_hash: string
          source_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          invited_email?: string | null
          invited_name?: string | null
          normalized_email?: string | null
          reconciliation_state?: string
          registration_id?: string | null
          review_reason?: string | null
          source_id?: string
          source_ordinal?: number
          source_payload_hash?: string
          source_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formula_registration_sources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "formula_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formula_registration_sources_registration_fk"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "formula_event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_downloads: {
        Row: {
          created_at: string | null
          download_type: string
          email: string
          id: string
          name: string
          phone: string
          photo_count: number
          selected_photos: Json | null
        }
        Insert: {
          created_at?: string | null
          download_type: string
          email: string
          id?: string
          name: string
          phone: string
          photo_count: number
          selected_photos?: Json | null
        }
        Update: {
          created_at?: string | null
          download_type?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          photo_count?: number
          selected_photos?: Json | null
        }
        Relationships: []
      }
      partner_profiles: {
        Row: {
          attendees: Json | null
          company_bio: string | null
          company_name: string | null
          created_at: string
          id: string
          logo_url: string | null
          marketing_contact_email: string | null
          marketing_contact_name: string | null
          onboarding_completed: boolean
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          purchase_email: string | null
          purchase_name: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          stage_file_urls: Json | null
          stripe_session_id: string | null
          tier: string
          updated_at: string
          video_loop_url: string | null
          website_url: string | null
        }
        Insert: {
          attendees?: Json | null
          company_bio?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          marketing_contact_email?: string | null
          marketing_contact_name?: string | null
          onboarding_completed?: boolean
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          purchase_email?: string | null
          purchase_name?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          stage_file_urls?: Json | null
          stripe_session_id?: string | null
          tier: string
          updated_at?: string
          video_loop_url?: string | null
          website_url?: string | null
        }
        Update: {
          attendees?: Json | null
          company_bio?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          marketing_contact_email?: string | null
          marketing_contact_name?: string | null
          onboarding_completed?: boolean
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          purchase_email?: string | null
          purchase_name?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          stage_file_urls?: Json | null
          stripe_session_id?: string | null
          tier?: string
          updated_at?: string
          video_loop_url?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      purchase_email_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          email_type: string
          failed_at: string | null
          id: string
          idempotency_key: string
          last_attempt_at: string | null
          last_error: string | null
          max_attempts: number
          metadata: Json
          next_attempt_at: string
          provider_email_id: string | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string
          stripe_session_id: string
          tier: string | null
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          email_type: string
          failed_at?: string | null
          id?: string
          idempotency_key: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          metadata?: Json
          next_attempt_at?: string
          provider_email_id?: string | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          stripe_session_id: string
          tier?: string | null
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          email_type?: string
          failed_at?: string | null
          id?: string
          idempotency_key?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          metadata?: Json
          next_attempt_at?: string
          provider_email_id?: string | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          stripe_session_id?: string
          tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_email_delivery_events: {
        Row: {
          event_created_at: string | null
          event_type: string
          id: string
          payload: Json
          provider_email_id: string | null
          received_at: string
          svix_id: string
        }
        Insert: {
          event_created_at?: string | null
          event_type: string
          id?: string
          payload?: Json
          provider_email_id?: string | null
          received_at?: string
          svix_id: string
        }
        Update: {
          event_created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          provider_email_id?: string | null
          received_at?: string
          svix_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string
          email: string
          id: string
          name: string | null
          pass_type: string
          quantity: number
          stripe_payment_link_id: string | null
          stripe_session_id: string
          tier: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          email: string
          id?: string
          name?: string | null
          pass_type: string
          quantity?: number
          stripe_payment_link_id?: string | null
          stripe_session_id: string
          tier: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string
          id?: string
          name?: string | null
          pass_type?: string
          quantity?: number
          stripe_payment_link_id?: string | null
          stripe_session_id?: string
          tier?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          agency_state: string
          attended_2025: boolean
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
        }
        Insert: {
          agency_state: string
          attended_2025: boolean
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
        }
        Update: {
          agency_state?: string
          attended_2025?: boolean
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fix_partner_purchases: { Args: never; Returns: Json }
      formula_bridge_claim_projection_outbox_batch: {
        Args: {
          p_batch_size: number
          p_integration_secret: string
          p_lease_seconds: number
          p_worker_id: string
        }
        Returns: {
          attempt_count: number
          event_registration_id: string
          lease_expires_at: string
          lease_token: string
          outbox_id: string
          payload_sha256: string
          payload_text: string
          projection_version: number
          revocation_version: number
          target_path: string
        }[]
      }
      formula_bridge_complete_projection_outbox: {
        Args: {
          p_integration_secret: string
          p_lease_token: string
          p_outbox_id: string
          p_payload_sha256: string
          p_result_code: string
        }
        Returns: string
      }
      formula_bridge_fail_projection_outbox: {
        Args: {
          p_error_code: string
          p_integration_secret: string
          p_lease_token: string
          p_outbox_id: string
          p_payload_sha256: string
          p_retry_after_seconds: number
          p_retryable: boolean
        }
        Returns: string
      }
      formula_bridge_link_firebase_identity: {
        Args: {
          p_email: string
          p_email_verified: boolean
          p_firebase_uid: string
          p_integration_secret: string
        }
        Returns: string
      }
      formula_claim_projection_outbox_batch: {
        Args: {
          p_batch_size: number
          p_lease_seconds: number
          p_worker_id: string
        }
        Returns: {
          attempt_count: number
          event_registration_id: string
          lease_expires_at: string
          lease_token: string
          outbox_id: string
          payload_sha256: string
          payload_text: string
          projection_version: number
          revocation_version: number
          target_path: string
        }[]
      }
      formula_complete_projection_outbox: {
        Args: {
          p_lease_token: string
          p_outbox_id: string
          p_payload_sha256: string
          p_result_code: string
        }
        Returns: string
      }
      formula_fail_projection_outbox: {
        Args: {
          p_error_code: string
          p_lease_token: string
          p_outbox_id: string
          p_payload_sha256: string
          p_retry_after_seconds: number
          p_retryable: boolean
        }
        Returns: string
      }
      get_partner_profile_by_session: {
        Args: { p_session_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      save_partner_profile: {
        Args: {
          p_attendees?: Json
          p_company_bio?: string
          p_company_name?: string
          p_logo_url?: string
          p_marketing_contact_email?: string
          p_marketing_contact_name?: string
          p_onboarding_completed?: boolean
          p_primary_contact_email?: string
          p_primary_contact_name?: string
          p_primary_contact_phone?: string
          p_session_id: string
          p_social_facebook?: string
          p_social_instagram?: string
          p_social_linkedin?: string
          p_social_twitter?: string
          p_stage_file_urls?: Json
          p_tier: string
          p_video_loop_url?: string
          p_website_url?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
