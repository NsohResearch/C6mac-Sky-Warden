
-- Add new region codes for the 10 new countries
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'TD';
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'CF';
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'CG';
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'GQ';
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'GA';
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'BW';
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'ZM';
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'SS';
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'AO';
ALTER TYPE public.region_code ADD VALUE IF NOT EXISTS 'CD';

-- Update handle_new_user to map new countries to their authorities
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  tenant_id_var UUID;
  user_region public.region_code;
  user_authority TEXT;
BEGIN
  user_region := COALESCE((NEW.raw_user_meta_data->>'region')::public.region_code, 'US');
  
  user_authority := CASE user_region
    WHEN 'US' THEN 'FAA'
    WHEN 'CA' THEN 'Transport Canada'
    WHEN 'NG' THEN 'NCAA'
    WHEN 'KE' THEN 'KCAA'
    WHEN 'ZA' THEN 'SACAA'
    WHEN 'GH' THEN 'GCAA'
    WHEN 'RW' THEN 'RCAA'
    WHEN 'TZ' THEN 'TCAA'
    WHEN 'ET' THEN 'ECAA'
    WHEN 'SN' THEN 'ANACIM'
    WHEN 'CI' THEN 'ANAC-CI'
    WHEN 'UG' THEN 'UCAA'
    WHEN 'CM' THEN 'CCAA'
    WHEN 'TD' THEN 'ADAC'
    WHEN 'CF' THEN 'ANAC-CF'
    WHEN 'CG' THEN 'ANAC-CG'
    WHEN 'GQ' THEN 'DGAC-GQ'
    WHEN 'GA' THEN 'ANAC-GA'
    WHEN 'BW' THEN 'CAAB'
    WHEN 'ZM' THEN 'ZCAA'
    WHEN 'SS' THEN 'SSCAA'
    WHEN 'AO' THEN 'INAVIC'
    WHEN 'CD' THEN 'AAC-RDC'
    ELSE 'ICAO'
  END;

  INSERT INTO public.tenants (name, slug, region, regulatory_authority)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'organization_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), ' ', '-')) || '-' || LEFT(NEW.id::text, 8),
    user_region,
    user_authority
  )
  RETURNING id INTO tenant_id_var;

  INSERT INTO public.user_profiles (id, tenant_id, display_name, email, phone, persona, region)
  VALUES (
    NEW.id,
    tenant_id_var,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.phone,
    COALESCE((NEW.raw_user_meta_data->>'persona')::public.persona_type, 'individual_pilot'),
    user_region
  );

  INSERT INTO public.roles (tenant_id, name, permissions, is_system)
  VALUES (tenant_id_var, 'tenant_admin', ARRAY[
    'fleet:read', 'fleet:write', 'fleet:delete',
    'missions:read', 'missions:write', 'missions:delete',
    'airspace:read', 'laanc:read', 'laanc:write',
    'analytics:read', 'settings:read', 'settings:write',
    'team:read', 'team:write', 'compliance:read'
  ], true)
  RETURNING id INTO tenant_id_var;

  INSERT INTO public.user_roles (user_id, role_id, granted_by)
  VALUES (NEW.id, tenant_id_var, NEW.id);

  RETURN NEW;
END;
$function$;
