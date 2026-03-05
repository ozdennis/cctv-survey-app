"use server";

import { createClient } from "@/utils/supabase/server";

export async function approveVendorInvoiceAndPostCOGS(invoiceId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: invoice, error: fetchErr } = await supabase
    .schema("finance")
    .from("vendor_invoices")
    .select("*, work_orders(project_id)")
    .eq("id", invoiceId)
    .single();

  if (fetchErr) throw fetchErr;
  if (!invoice) throw new Error("Invoice not found");

  const { data: codeData, error: codeErr } = await supabase.rpc(
    "core.generate_transaction_code",
    { p_prefix: "LG", p_date: new Date().toISOString() }
  );

  if (codeErr) throw codeErr;

  const { error: ledgerErr } = await supabase.schema("finance").from("finance_ledger").insert({
    transaction_date: new Date().toISOString().slice(0, 10),
    code: codeData,
    category: "cogs",
    direction: "out",
    amount: invoice.total_amount,
    description: `Vendor invoice: ${invoice.code}`,
    related_code: invoice.code,
    project_id: (invoice.work_orders as any)?.project_id || null,
    vendor_id: invoice.vendor_id,
    created_by: user.id,
  });

  if (ledgerErr) throw ledgerErr;

  const { error: updateErr } = await supabase
    .schema("finance")
    .from("vendor_invoices")
    .update({ status: "approved" })
    .eq("id", invoiceId);

  if (updateErr) throw updateErr;

  return { success: true };
}

