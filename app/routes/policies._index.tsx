import {useLoaderData} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/policies._index';
import {useTranslation} from '~/lib/translations';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Policies & Compliance | LimiPhotography'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY, {
    variables: {
      country: context.storefront.i18n?.country,
      language: context.storefront.i18n?.language,
    },
  });

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <main className="min-h-screen bg-canvas text-text-main pb-24">
      <div className="mx-auto max-w-5xl px-4 md:px-8 pt-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-display text-text-muted mb-8"
        >
          <Link to="/" className="hover:text-text-main transition-colors">
            {t('nav_home')}
          </Link>
          <span>/</span>
          <span className="text-shutter font-bold uppercase">{t('footer_compliance_heading')}</span>
        </nav>

        <header className="relative mb-10 overflow-hidden rounded-sm border border-border bg-surface p-6 md:p-10 shadow-xs flex flex-col items-start gap-3 sm:gap-4">
          <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
            {t('policy_compliance_badge')}
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-bold tracking-tight text-text-main">
            {t('policy_operating_terms')}
          </h1>
          <p className="max-w-2xl text-xs md:text-sm text-text-muted leading-relaxed font-body">
            {t('policy_operating_desc')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((policy) => (
            <Link
              key={policy.id}
              to={`/policies/${policy.handle}`}
              className="group rounded-sm border border-border bg-surface p-6 transition-all duration-150 hover:border-border-strong hover:shadow-[3px_3px_0px_#CBD5E1] text-inherit no-underline flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/60 px-2 py-0.5 text-[9px] font-display font-semibold tracking-wider text-text-muted uppercase mb-3">
                  {t('policy_directive_badge')}
                </div>
                <h2 className="text-base font-display font-bold text-text-main group-hover:text-shutter transition-colors">
                  {policy.title}
                </h2>
              </div>
              <span className="mt-4 text-xs font-display font-bold text-shutter flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {t('policy_read_directive')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
