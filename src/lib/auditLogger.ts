import { supabase } from "@/integrations/supabase/client";

export type AuditAction = 
  | "user_created" 
  | "user_role_changed" 
  | "user_suspended" 
  | "user_unsuspended"
  | "user_enrolled"
  | "course_created"
  | "course_updated"
  | "course_deleted"
  | "blog_created"
  | "blog_updated"
  | "blog_deleted"
  | "testimonial_created"
  | "testimonial_deleted"
  | "certificate_issued"
  | "certificate_revoked"
  | "settings_updated";

export interface AuditLogDetails {
  [key: string]: any;
}

export async function logAuditEvent(
  action: AuditAction,
  entityType: string,
  entityId: string | null,
  details?: AuditLogDetails
): Promise<void> {
  try {
    const { error } = await supabase.rpc("log_audit_event", {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_details: details || null,
    });

    if (error) {
      console.error("Failed to log audit event:", error);
    }
  } catch (err) {
    console.error("Error logging audit event:", err);
  }
}
