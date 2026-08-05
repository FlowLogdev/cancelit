import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { z } from "zod"

import type { Database } from "@/lib/database.types"
import { createClient as createRouteClient } from "@/lib/supabase/route-client"

export const runtime = "nodejs"

const issueTypes = [
  "Billing Information",
  "Cannot Connect Plaid Account",
  "Cannot add subscription Manually",
  "Delete Account Number",
  "Cancel my Subscription",
  "Other",
] as const

const supportTicketSchema = z.object({
  customerName: z.string().trim().min(2, "Name is required").max(120, "Name is too long"),
  customerEmail: z
    .string()
    .trim()
    .email("A valid email is required")
    .max(254, "Email is too long")
    .transform((value) => value.toLowerCase()),
  issueType: z.enum(issueTypes),
  message: z.string().trim().min(10, "Please add a few details").max(4000, "Details are too long"),
})

type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"]

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createSupabaseAdminClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function getOptionalUserId() {
  try {
    const supabase = await createRouteClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user?.id ?? null
  } catch {
    return null
  }
}

function buildSupportEmail(ticket: SupportTicket) {
  return [
    "New CancelIt support ticket",
    "",
    `Ticket number: ${ticket.ticket_number}`,
    `Submitted at: ${ticket.created_at}`,
    `Customer name: ${ticket.customer_name}`,
    `Customer email: ${ticket.customer_email}`,
    `Issue title: ${ticket.issue_type}`,
    "",
    "Customer details:",
    ticket.message,
  ].join("\n")
}

function buildCustomerEmail(ticket: SupportTicket) {
  return [
    `Hi ${ticket.customer_name},`,
    "",
    "We received your CancelIt support request.",
    "",
    `Ticket number: ${ticket.ticket_number}`,
    `Issue title: ${ticket.issue_type}`,
    "",
    "Your message:",
    ticket.message,
    "",
    "Our support team will review this and reply to the email address you provided.",
    "",
    "CancelIt Support",
  ].join("\n")
}

async function sendTicketEmail({
  to,
  subject,
  text,
  replyTo,
  idempotencyKey,
}: {
  to: string
  subject: string
  text: string
  replyTo?: string
  idempotencyKey: string
}) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    return {
      sent: false,
      warning: "RESEND_API_KEY is not configured.",
    }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: process.env.SUPPORT_EMAIL_FROM || "CancelIt Support <support@flowlog.dev>",
      to,
      subject,
      text,
      reply_to: replyTo,
    }),
  })

  if (!response.ok) {
    const responseText = await response.text()
    throw new Error(`Resend email failed with status ${response.status}: ${responseText.slice(0, 500)}`)
  }

  return { sent: true }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = supportTicketSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid support request" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    if (!supabase) {
      return NextResponse.json(
        { error: "Support ticket database is not configured. Please contact support@flowlog.dev." },
        { status: 503 },
      )
    }

    const userId = await getOptionalUserId()

    const { data: createdTicket, error } = await (supabase as any).rpc("create_support_ticket", {
      p_customer_name: parsed.data.customerName,
      p_customer_email: parsed.data.customerEmail,
      p_issue_type: parsed.data.issueType,
      p_message: parsed.data.message,
      p_user_id: userId,
    })
    const ticket = createdTicket as SupportTicket | null

    if (error || !ticket) {
      const message = error?.message || "Support ticket database is not ready."
      console.error("Error creating support ticket:", message)
      return NextResponse.json({ error: message }, { status: 500 })
    }

    const supportEmailTo = process.env.SUPPORT_EMAIL_TO || "support@flowlog.dev"
    const emailResults = await Promise.allSettled([
      sendTicketEmail({
        to: supportEmailTo,
        subject: `CancelIt support ticket ${ticket.ticket_number}: ${ticket.issue_type}`,
        text: buildSupportEmail(ticket),
        replyTo: ticket.customer_email,
        idempotencyKey: `${ticket.ticket_number}-support`,
      }),
      sendTicketEmail({
        to: ticket.customer_email,
        subject: `CancelIt support ticket ${ticket.ticket_number}`,
        text: buildCustomerEmail(ticket),
        idempotencyKey: `${ticket.ticket_number}-customer`,
      }),
    ])

    const emailFailures = emailResults.filter(
      (result) => result.status === "rejected" || (result.status === "fulfilled" && result.value.sent === false),
    )

    if (emailFailures.length > 0) {
      console.error("Support ticket email delivery warning:", emailFailures)
    }

    return NextResponse.json(
      {
        ticketNumber: ticket.ticket_number,
        emailDelivered: emailFailures.length === 0,
        emailWarning:
          emailFailures.length > 0
            ? "Ticket created, but email delivery is not fully configured. Save the ticket number."
            : null,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Unexpected support ticket error:", error)
    return NextResponse.json({ error: error.message || "Failed to create support ticket" }, { status: 500 })
  }
}
