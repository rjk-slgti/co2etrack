
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'auditor', 'data_entry');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'LK',
  industry TEXT,
  reporting_currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'data_entry',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, organization_id)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _role app_role, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND organization_id = _org_id
  )
$$;

-- Reporting periods
CREATE TABLE public.reporting_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.reporting_periods ENABLE ROW LEVEL SECURITY;

-- Emission factor headers
CREATE TABLE public.emission_factor_headers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('Fuel', 'Electricity', 'Transport', 'Waste', 'Refrigerants', 'Materials', 'Other')),
  activity_type TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'GLOBAL',
  source TEXT NOT NULL CHECK (source IN ('Country', 'DEFRA', 'NGER', 'IPCC', 'IEA', 'Other')),
  source_version TEXT,
  methodology_note TEXT,
  valid_from DATE,
  valid_to DATE,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_reference TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.emission_factor_headers ENABLE ROW LEVEL SECURITY;

-- Emission factor values
CREATE TABLE public.emission_factor_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  factor_id UUID NOT NULL REFERENCES public.emission_factor_headers(id) ON DELETE CASCADE,
  unit_input TEXT NOT NULL,
  unit_standard TEXT NOT NULL,
  emission_factor NUMERIC NOT NULL,
  emission_type TEXT NOT NULL CHECK (emission_type IN ('Direct/TTW', 'Indirect/Electricity', 'WTT', 'Lifecycle/LCA')),
  gwp_set TEXT NOT NULL DEFAULT 'AR6' CHECK (gwp_set IN ('AR4', 'AR5', 'AR6')),
  co2_fraction NUMERIC,
  ch4_fraction NUMERIC,
  n2o_fraction NUMERIC,
  uncertainty_percent NUMERIC,
  data_quality TEXT NOT NULL DEFAULT 'Medium' CHECK (data_quality IN ('High', 'Medium', 'Low')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.emission_factor_values ENABLE ROW LEVEL SECURITY;

-- Country overrides
CREATE TABLE public.country_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  grid_factor_location_based NUMERIC,
  grid_factor_market_based NUMERIC,
  notes TEXT,
  valid_year INTEGER NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.country_overrides ENABLE ROW LEVEL SECURITY;

-- Unit conversions
CREATE TABLE public.unit_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_unit TEXT NOT NULL,
  to_unit TEXT NOT NULL,
  conversion_factor NUMERIC NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (from_unit, to_unit)
);
ALTER TABLE public.unit_conversions ENABLE ROW LEVEL SECURITY;

-- Activity entries
CREATE TABLE public.activity_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reporting_period_id UUID REFERENCES public.reporting_periods(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  scope TEXT NOT NULL CHECK (scope IN ('Scope 1', 'Scope 2', 'Scope 3')),
  scope_category TEXT,
  category TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  converted_quantity NUMERIC,
  converted_unit TEXT,
  factor_id UUID REFERENCES public.emission_factor_headers(id),
  factor_value_id UUID REFERENCES public.emission_factor_values(id),
  emission_kgco2e NUMERIC,
  emission_co2 NUMERIC,
  emission_ch4 NUMERIC,
  emission_n2o NUMERIC,
  location_based_emission NUMERIC,
  market_based_emission NUMERIC,
  data_quality TEXT DEFAULT 'Medium' CHECK (data_quality IN ('High', 'Medium', 'Low')),
  is_assumed_factor BOOLEAN DEFAULT false,
  notes TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_entries ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  activity_entry_id UUID REFERENCES public.activity_entries(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  factor_id UUID,
  factor_source TEXT,
  factor_version TEXT,
  gwp_set TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Organizations: all authenticated users can read
CREATE POLICY "Authenticated users can read organizations"
  ON public.organizations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Reporting periods
CREATE POLICY "Authenticated can read reporting periods"
  ON public.reporting_periods FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage reporting periods"
  ON public.reporting_periods FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Emission factor headers: readable by all, editable by admin
CREATE POLICY "All authenticated can read factors"
  ON public.emission_factor_headers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage factors"
  ON public.emission_factor_headers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Emission factor values
CREATE POLICY "All authenticated can read factor values"
  ON public.emission_factor_values FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage factor values"
  ON public.emission_factor_values FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Country overrides
CREATE POLICY "All authenticated can read country overrides"
  ON public.country_overrides FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage country overrides"
  ON public.country_overrides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Unit conversions
CREATE POLICY "All authenticated can read conversions"
  ON public.unit_conversions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage conversions"
  ON public.unit_conversions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Activity entries
CREATE POLICY "Users can read own org entries"
  ON public.activity_entries FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own entries"
  ON public.activity_entries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own entries"
  ON public.activity_entries FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all entries"
  ON public.activity_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Audit logs: append-only for all, readable by admin/auditor
CREATE POLICY "Authenticated can insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and auditors can read audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'auditor'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reporting_periods_updated_at
  BEFORE UPDATE ON public.reporting_periods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_entries_updated_at
  BEFORE UPDATE ON public.activity_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_emission_factor_headers_category ON public.emission_factor_headers(category);
CREATE INDEX idx_emission_factor_headers_region ON public.emission_factor_headers(region);
CREATE INDEX idx_emission_factor_headers_source ON public.emission_factor_headers(source);
CREATE INDEX idx_emission_factor_values_factor_id ON public.emission_factor_values(factor_id);
CREATE INDEX idx_activity_entries_org ON public.activity_entries(organization_id);
CREATE INDEX idx_activity_entries_scope ON public.activity_entries(scope);
CREATE INDEX idx_activity_entries_user ON public.activity_entries(user_id);
CREATE INDEX idx_audit_logs_entry ON public.audit_logs(activity_entry_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_country_overrides_region ON public.country_overrides(region);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
