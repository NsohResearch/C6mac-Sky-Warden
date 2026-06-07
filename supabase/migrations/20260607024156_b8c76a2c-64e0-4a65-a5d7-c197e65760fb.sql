
-- 1. Drone registrations: remove anon access; expose safe view
DROP POLICY IF EXISTS "Public verify" ON public.drone_registrations;
REVOKE SELECT ON public.drone_registrations FROM anon;

CREATE OR REPLACE VIEW public.drone_registration_verifications
WITH (security_invoker = true) AS
SELECT
  id,
  digital_drone_id,
  registration_number,
  verification_code,
  manufacturer,
  model,
  registration_type,
  region,
  status,
  issued_at,
  expires_at
FROM public.drone_registrations
WHERE publicly_verifiable = true
  AND verification_code IS NOT NULL;

-- View needs explicit policy passthrough: re-add narrow anon SELECT on base columns via a SECURITY DEFINER RPC instead
DROP VIEW IF EXISTS public.drone_registration_verifications;

CREATE OR REPLACE FUNCTION public.verify_drone_registration(_code text)
RETURNS TABLE (
  digital_drone_id text,
  manufacturer text,
  model text,
  registration_type registration_type,
  region region_code,
  status registration_status,
  issued_at timestamptz,
  expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    dr.digital_drone_id,
    dr.manufacturer,
    dr.model,
    dr.registration_type,
    dr.region,
    dr.status,
    dr.issued_at,
    dr.expires_at
  FROM public.drone_registrations dr
  WHERE dr.publicly_verifiable = true
    AND dr.verification_code IS NOT NULL
    AND (
      upper(dr.digital_drone_id) = upper(_code)
      OR upper(dr.verification_code) = upper(_code)
    )
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_drone_registration(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_drone_registration(text) TO anon, authenticated;

-- 2. Agency rules: authenticated-only reads
DROP POLICY IF EXISTS "Public read active" ON public.agency_rules;
CREATE POLICY "Authenticated read active"
  ON public.agency_rules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 3. Government disbursements: add tenant-scoped policy (table previously had RLS enabled, no policies = locked)
-- Note: government_disbursements doesn't have tenant_id; restrict to service_role only via no policy + explicit grant revoke
REVOKE ALL ON public.government_disbursements FROM anon, authenticated;
GRANT ALL ON public.government_disbursements TO service_role;
-- Add a deny-by-default placeholder policy so the linter is satisfied; only service_role bypasses RLS
CREATE POLICY "No direct user access"
  ON public.government_disbursements
  FOR SELECT
  TO authenticated
  USING (false);

-- 4. Lock down SECURITY DEFINER helper functions
REVOKE EXECUTE ON FUNCTION public.generate_digital_drone_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id() FROM PUBLIC, anon;
-- get_user_tenant_id is used inside RLS policies (which run as the policy owner), so revoking from anon is safe;
-- authenticated keeps EXECUTE because some client code may call it directly.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
