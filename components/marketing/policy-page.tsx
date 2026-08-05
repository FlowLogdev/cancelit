import { CancelItLogo } from "@/components/brand/cancelit-logo"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteNav } from "@/components/marketing/site-nav"

export type PolicySection = {
  title: string
  body?: string[]
  bullets?: string[]
}

type PolicyPageProps = {
  title: string
  description: string
  updatedAt?: string
  sections: PolicySection[]
  contactEmail?: string
}

export function PolicyPage({
  title,
  description,
  updatedAt = "August 5, 2026",
  sections,
  contactEmail = "support@flowlog.dev",
}: PolicyPageProps) {
  return (
    <main className="min-h-screen bg-[#060607] text-white">
      <SiteNav />
      <section className="relative overflow-hidden border-b border-white/[0.07] px-4 py-16 sm:px-6 lg:py-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3 text-sm font-medium text-white/58">
            <CancelItLogo href="/" showText={false} imageClassName="h-10 w-10 rounded-lg" />
            <span>CancelIt customer policy center</span>
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-red-400">{updatedAt}</p>
          <h1 className="text-4xl font-bold tracking-normal text-white sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">{description}</p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-4xl gap-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="mt-4 leading-7 text-white/67">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 space-y-3 text-white/67">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 leading-7">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}

          <article className="rounded-lg border border-red-500/25 bg-red-500/[0.08] p-6">
            <h2 className="text-xl font-semibold text-white">Questions</h2>
            <p className="mt-3 leading-7 text-white/70">
              Contact CancelIt at{" "}
              <a className="font-semibold text-white underline decoration-red-400 underline-offset-4" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
              . Include the email address on your account so we can find the right record quickly.
            </p>
          </article>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
