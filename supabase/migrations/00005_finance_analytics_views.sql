-- ─────────────────────────────────────────────────────────────────────────────
-- Finance: Analytics Views for Reporting & Dashboard
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- View: Tax Reserve Calculator (0.5% of revenue)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW finance.tax_reserve_view AS
SELECT 
  DATE_TRUNC('month', transaction_date)::date AS reserve_month,
  business_unit,
  SUM(amount) AS revenue_total,
  ROUND(SUM(amount) * 0.005, 0) AS tax_reserve_amount,
  COUNT(*) AS transaction_count
FROM finance.finance_ledger
WHERE category = 'revenue'
GROUP BY DATE_TRUNC('month', transaction_date), business_unit
ORDER BY reserve_month DESC, business_unit;

COMMENT ON VIEW finance.tax_reserve_view IS 
'Calculates 0.5% tax reserve from revenue transactions, grouped by month and business unit';

-- ─────────────────────────────────────────────────────────────────────────────
-- View: Project Profitability (P&L per project)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW finance.project_profitability_view AS
WITH revenue AS (
  SELECT 
    project_id,
    business_unit,
    SUM(amount) AS revenue_total
  FROM finance.finance_ledger
  WHERE category = 'revenue' AND project_id IS NOT NULL
  GROUP BY project_id, business_unit
),
cogs AS (
  SELECT 
    project_id,
    business_unit,
    SUM(amount) AS cogs_total
  FROM finance.finance_ledger
  WHERE category = 'cogs' AND project_id IS NOT NULL
  GROUP BY project_id, business_unit
),
opex AS (
  SELECT 
    project_id,
    business_unit,
    SUM(amount) AS opex_total
  FROM finance.finance_ledger
  WHERE category = 'opex' AND project_id IS NOT NULL
  GROUP BY project_id, business_unit
)
SELECT 
  p.id AS project_id,
  p.code AS project_code,
  p.name AS project_name,
  p.status AS project_status,
  COALESCE(r.business_unit, 'cctv') AS business_unit,
  COALESCE(r.revenue_total, 0) AS revenue,
  COALESCE(c.cogs_total, 0) AS cogs,
  COALESCE(o.opex_total, 0) AS opex,
  COALESCE(r.revenue_total, 0) - COALESCE(c.cogs_total, 0) AS gross_profit,
  CASE 
    WHEN COALESCE(r.revenue_total, 0) > 0 
    THEN ROUND(((COALESCE(r.revenue_total, 0) - COALESCE(c.cogs_total, 0)) / r.revenue_total * 100), 2)
    ELSE 0 
  END AS gross_margin_percent,
  COALESCE(r.revenue_total, 0) - COALESCE(c.cogs_total, 0) - COALESCE(o.opex_total, 0) AS net_profit,
  CASE 
    WHEN COALESCE(r.revenue_total, 0) > 0 
    THEN ROUND(((COALESCE(r.revenue_total, 0) - COALESCE(c.cogs_total, 0) - COALESCE(o.opex_total, 0)) / r.revenue_total * 100), 2)
    ELSE 0 
  END AS net_margin_percent,
  a.name AS customer_name
FROM core.projects p
LEFT JOIN revenue r ON r.project_id = p.id
LEFT JOIN cogs c ON c.project_id = p.id
LEFT JOIN opex o ON o.project_id = p.id
LEFT JOIN core.accounts a ON a.id = p.account_id
ORDER BY p.created_at DESC;

COMMENT ON VIEW finance.project_profitability_view IS 
'Project-level P&L showing revenue, COGS, OPEX, gross profit, net profit, and margins';

-- ─────────────────────────────────────────────────────────────────────────────
-- View: Daily Cash Flow
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW finance.cash_flow_daily_view AS
SELECT 
  transaction_date,
  business_unit,
  SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END) AS cash_in,
  SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END) AS cash_out,
  SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END) - 
    SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END) AS net_cash_flow,
  COUNT(*) FILTER (WHERE direction = 'in') AS inflow_transactions,
  COUNT(*) FILTER (WHERE direction = 'out') AS outflow_transactions
FROM finance.finance_ledger
GROUP BY transaction_date, business_unit
ORDER BY transaction_date DESC;

COMMENT ON VIEW finance.cash_flow_daily_view IS 
'Daily cash flow summary showing cash in, cash out, and net flow by business unit';

-- ─────────────────────────────────────────────────────────────────────────────
-- View: Monthly P&L Summary
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW finance.monthly_pnl_view AS
SELECT 
  DATE_TRUNC('month', transaction_date)::date AS period_month,
  business_unit,
  SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN category = 'cogs' THEN amount ELSE 0 END) AS cogs,
  SUM(CASE WHEN category = 'opex' THEN amount ELSE 0 END) AS opex,
  SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) - 
    SUM(CASE WHEN category = 'cogs' THEN amount ELSE 0 END) AS gross_profit,
  CASE 
    WHEN SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) > 0 
    THEN ROUND(((SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) - 
                 SUM(CASE WHEN category = 'cogs' THEN amount ELSE 0 END)) / 
                SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) * 100), 2)
    ELSE 0 
  END AS gross_margin_percent,
  SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) - 
    SUM(CASE WHEN category = 'cogs' THEN amount ELSE 0 END) - 
    SUM(CASE WHEN category = 'opex' THEN amount ELSE 0 END) AS net_income,
  CASE 
    WHEN SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) > 0 
    THEN ROUND(((SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) - 
                 SUM(CASE WHEN category = 'cogs' THEN amount ELSE 0 END) - 
                 SUM(CASE WHEN category = 'opex' THEN amount ELSE 0 END)) / 
                SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) * 100), 2)
    ELSE 0 
  END AS net_margin_percent,
  SUM(CASE WHEN category = 'withdrawal' THEN amount ELSE 0 END) AS withdrawals,
  SUM(CASE WHEN category = 'tax_reserve' THEN amount ELSE 0 END) AS tax_reserved
FROM finance.finance_ledger
GROUP BY DATE_TRUNC('month', transaction_date), business_unit
ORDER BY period_month DESC, business_unit;

COMMENT ON VIEW finance.monthly_pnl_view IS 
'Monthly P&L statement with revenue, COGS, OPEX, gross/net profit, and margins by business unit';

-- ─────────────────────────────────────────────────────────────────────────────
-- View: Accounts Receivable (Outstanding Invoices)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW finance.accounts_receivable_view AS
SELECT 
  ci.id AS invoice_id,
  ci.code AS invoice_code,
  ci.invoice_type,
  ci.business_unit,
  ci.account_id,
  a.name AS customer_name,
  ci.total_amount,
  COALESCE(paid.paid_amount, 0) AS paid_amount,
  ci.total_amount - COALESCE(paid.paid_amount, 0) AS outstanding_amount,
  ci.status,
  ci.issue_date,
  ci.due_date,
  CASE 
    WHEN ci.due_date < CURRENT_DATE AND ci.status != 'paid' THEN TRUE 
    ELSE FALSE 
  END AS is_overdue,
  CASE 
    WHEN ci.due_date < CURRENT_DATE AND ci.status != 'paid' 
    THEN CURRENT_DATE - ci.due_date 
    ELSE 0 
  END AS days_overdue
FROM finance.customer_invoices ci
LEFT JOIN core.accounts a ON a.id = ci.account_id
LEFT JOIN (
  SELECT invoice_id, SUM(amount) AS paid_amount
  FROM finance.payments_in
  GROUP BY invoice_id
) paid ON paid.invoice_id = ci.id
WHERE ci.status != 'cancelled'
ORDER BY ci.due_date ASC;

COMMENT ON VIEW finance.accounts_receivable_view IS 
'Outstanding customer invoices with payment status and overdue tracking';

-- ─────────────────────────────────────────────────────────────────────────────
-- View: Accounts Payable (Unpaid Vendor Invoices)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW finance.accounts_payable_view AS
SELECT 
  vi.id AS invoice_id,
  vi.code AS invoice_code,
  vi.business_unit,
  vi.vendor_id,
  v.name AS vendor_name,
  vi.total_amount AS amount_due,
  vi.status,
  vi.created_at AS invoice_date,
  wo.code AS work_order_code,
  p.code AS project_code
FROM finance.vendor_invoices vi
LEFT JOIN core.vendors v ON v.id = vi.vendor_id
LEFT JOIN project.work_orders wo ON wo.id = vi.work_order_id
LEFT JOIN core.projects p ON p.id = wo.project_id
WHERE vi.status IN ('pending', 'approved')
ORDER BY vi.created_at ASC;

COMMENT ON VIEW finance.accounts_payable_view IS 
'Pending and approved vendor invoices awaiting payment';

-- ─────────────────────────────────────────────────────────────────────────────
-- View: Business Unit Summary
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW finance.business_unit_summary_view AS
SELECT 
  business_unit,
  SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN category = 'cogs' THEN amount ELSE 0 END) AS total_cogs,
  SUM(CASE WHEN category = 'opex' THEN amount ELSE 0 END) AS total_opex,
  SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) - 
    SUM(CASE WHEN category = 'cogs' THEN amount ELSE 0 END) AS gross_profit,
  CASE 
    WHEN SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) > 0 
    THEN ROUND(((SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) - 
                 SUM(CASE WHEN category = 'cogs' THEN amount ELSE 0 END)) / 
                SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) * 100), 2)
    ELSE 0 
  END AS gross_margin_percent,
  SUM(CASE WHEN category = 'revenue' THEN amount ELSE 0 END) - 
    SUM(CASE WHEN category = 'cogs' THEN amount ELSE 0 END) - 
    SUM(CASE WHEN category = 'opex' THEN amount ELSE 0 END) AS net_profit,
  COUNT(*) FILTER (WHERE category = 'revenue') AS revenue_transactions,
  COUNT(*) FILTER (WHERE category = 'cogs') AS cogs_transactions,
  COUNT(*) FILTER (WHERE category = 'opex') AS opex_transactions
FROM finance.finance_ledger
GROUP BY business_unit
ORDER BY total_revenue DESC;

COMMENT ON VIEW finance.business_unit_summary_view IS 
'Aggregated financial performance by business unit (cctv, web, maintenance)';

</contents>