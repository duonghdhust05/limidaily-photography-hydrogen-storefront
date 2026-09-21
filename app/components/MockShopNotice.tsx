import {useTranslation} from '~/lib/translations';

export function MockShopNotice() {
  const {t} = useTranslation();

  return (
    <section
      className="mock-shop-notice"
      aria-labelledby="mock-shop-notice-heading"
    >
      <div className="inner">
        <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-2.5 py-0.5 text-[9px] font-display font-semibold tracking-widest text-shutter uppercase mb-2">
          {t('mock_bench_badge')}
        </div>
        <h2 id="mock-shop-notice-heading">{t('mock_bench_title')}</h2>
        <p>
          {t('mock_bench_desc')}
        </p>
      </div>
    </section>
  );
}
