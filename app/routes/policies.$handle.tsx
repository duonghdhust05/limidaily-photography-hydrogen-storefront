import {useLoaderData} from 'react-router';
import {Link} from '~/components/Link';
import type {Route} from './+types/policies.$handle';
import {useTranslation} from '~/lib/translations';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';

import {cleanHtmlContent} from '~/lib/htmlSanitizer';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.policy.title ?? 'Policy'} | LimiPhotography`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
      country: context.storefront.i18n?.country,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  return (
    <main className="min-h-screen bg-canvas text-text-main pb-24">
      <div className="mx-auto max-w-4xl px-4 md:px-8 pt-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-display text-text-muted mb-8"
        >
          <Link to="/" className="hover:text-text-main transition-colors">
            {t('nav_home')}
          </Link>
          <span>/</span>
          <Link to="/policies" className="hover:text-text-main transition-colors">
            {t('footer_compliance_heading')}
          </Link>
          <span>/</span>
          <span className="text-shutter font-bold uppercase truncate">
            {policy.title}
          </span>
        </nav>

        <article className="rounded-sm border border-border bg-surface p-6 md:p-12 shadow-xs">
          <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs mb-4">
            {t('policy_official_badge')}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-main mb-8 border-b border-border pb-4">
            {policy.title}
          </h1>
          <div
            dangerouslySetInnerHTML={{__html: cleanHtmlContent(policy.body)}}
            className="prose max-w-none text-xs md:text-sm text-text-muted leading-relaxed space-y-4 font-body"
          />
        </article>
      </div>
    </main>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
