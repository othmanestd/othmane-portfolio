import { useI18n } from '@/i18n'
import { ButtonLink } from '@/components/ui'

export default function NotFound() {
  const { tr } = useI18n()
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden px-4 md:px-8">
      <div className="mesh" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <p className="label mb-6">Error — 404</p>
        <h1 className="display mb-6 text-[clamp(4rem,20vw,16rem)] leading-[0.8]">404</h1>
        <p className="serif-accent mb-3 text-[clamp(1.4rem,3vw,2.2rem)]">{tr('nf.title')}</p>
        <p className="mb-10 max-w-md text-base" style={{ color: 'var(--fg-dim)' }}>
          {tr('nf.sub')}
        </p>
        <ButtonLink to="/" variant="solid">{tr('nf.home')}</ButtonLink>
      </div>
    </section>
  )
}
