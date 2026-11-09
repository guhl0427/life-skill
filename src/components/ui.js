const base =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sketch border-2 px-5 py-2 text-sm transition-all duration-200"

export const btnPrimary = `${base} border-primary-hover bg-primary text-white shadow-ink hover:-translate-x-px hover:-translate-y-px hover:bg-primary-hover hover:shadow-ink-hover active:translate-x-px active:translate-y-px active:shadow-none`

export const btnOutline = `${base} border-line bg-card text-ink shadow-[2px_3px_0_var(--line-soft)] hover:-translate-x-px hover:-translate-y-px hover:border-primary hover:text-primary`

export const btnDanger = `${base} border-danger-hover bg-danger text-white shadow-ink hover:-translate-x-px hover:-translate-y-px hover:bg-danger-hover`

export const btnSm = "px-3.5 py-1 text-[13px]"

export const field =
  "w-full rounded-sketch border-2 border-line bg-card px-4 py-2.5 text-[15px] text-ink transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] focus:outline-none max-[480px]:text-sm"

export const label = "mb-2 block font-display text-base text-ink"

export const pageTitle =
  "mb-2 font-display text-[28px] tracking-[2px] text-ink max-[480px]:text-[22px]"

export const pageDesc = "mb-6 text-sm text-ink-soft"

export const backLink = "mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors duration-200 hover:text-primary"
