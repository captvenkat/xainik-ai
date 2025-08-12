-- Add default data to billing tables
INSERT INTO service_plans (plan_code, plan_name, description, price_cents, currency, duration_days, features) VALUES
    ('basic', 'Basic Plan', 'Essential features for veterans', 0, 'INR', 30, '["pitch_creation", "basic_analytics"]'),
    ('premium', 'Premium Plan', 'Advanced features for better visibility', 99900, 'INR', 30, '["pitch_creation", "advanced_analytics", "priority_support", "featured_listing"]'),
    ('enterprise', 'Enterprise Plan', 'Full platform access for recruiters', 199900, 'INR', 30, '["unlimited_access", "advanced_search", "priority_support", "custom_features"]')
ON CONFLICT (plan_code) DO NOTHING;

INSERT INTO numbering_state (entity_type, current_number, prefix, suffix) VALUES
    ('invoice', 1, 'INV', ''),
    ('receipt', 1, 'RCP', '')
ON CONFLICT (entity_type) DO NOTHING;
