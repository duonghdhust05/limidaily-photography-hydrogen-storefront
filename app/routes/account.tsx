import {
  data as remixData,
  Form,
  Outlet,
  useLoaderData,
} from 'react-router';
import {Link, NavLink} from '~/components/Link';
import type {Route} from './+types/account';
import {useTranslation} from '~/lib/translations';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();
  const {t} = useTranslation();

  const heading = customer
    ? customer.firstName
      ? `${t('account_welcome')} ${customer.firstName}`
      : t('nav_client_console')
    : t('account_overview');

  return (
    <main
      className="min-h-screen bg-canvas text-text-main pb-24"
      aria-labelledby="account-console-title"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-display text-text-muted mb-8"
        >
          <NavLink to="/" className="hover:text-text-main transition-colors">
            {t('nav_home')}
          </NavLink>
          <span>/</span>
          <span className="text-shutter font-bold uppercase">{t('nav_client_console')}</span>
        </nav>

        {/* Header Console */}
        <header className="relative mb-8 overflow-hidden rounded-sm border border-border bg-surface p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col items-start gap-2">
              <div className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase shadow-2xs">
                {t('account_badge')}
              </div>
              <h1
                id="account-console-title"
                className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-main"
              >
                {heading}
              </h1>
              {(customer?.firstName || customer?.lastName) && (
                <p className="text-xs font-display text-text-muted">
                  {t('account_client_id')}{' '}
                  <span className="text-text-main font-semibold">
                    {[customer.firstName, customer.lastName].filter(Boolean).join(' ')}
                  </span>
                </p>
              )}
            </div>

            <AccountMenu />
          </div>
        </header>

        {/* Child Views */}
        <div className="rounded-sm border border-border bg-surface p-6 md:p-8 shadow-xs">
          <Outlet context={{customer}} />
        </div>
      </div>
    </main>
  );
}

function AccountMenu() {
  const {t} = useTranslation();
  return (
    <nav role="navigation" className="flex flex-wrap items-center gap-2" aria-label="Account Navigation">
      <NavLink
        to="/account/orders"
        className={({isActive}) =>
          `rounded-xs border px-4 py-2 text-xs font-display font-bold uppercase tracking-wider transition-all duration-120 ${
            isActive
              ? 'border-shutter bg-shutter text-white shadow-2xs'
              : 'border-border bg-plate/40 text-text-muted hover:border-border-strong hover:text-text-main'
          }`
        }
      >
        {t('nav_orders')}
      </NavLink>
      <NavLink
        to="/account/profile"
        className={({isActive}) =>
          `rounded-xs border px-4 py-2 text-xs font-display font-bold uppercase tracking-wider transition-all duration-120 ${
            isActive
              ? 'border-shutter bg-shutter text-white shadow-2xs'
              : 'border-border bg-plate/40 text-text-muted hover:border-border-strong hover:text-text-main'
          }`
        }
      >
        {t('nav_profile')}
      </NavLink>
      <NavLink
        to="/account/addresses"
        className={({isActive}) =>
          `rounded-xs border px-4 py-2 text-xs font-display font-bold uppercase tracking-wider transition-all duration-120 ${
            isActive
              ? 'border-shutter bg-shutter text-white shadow-2xs'
              : 'border-border bg-plate/40 text-text-muted hover:border-border-strong hover:text-text-main'
          }`
        }
      >
        {t('nav_addresses')}
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  const {t} = useTranslation();
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      <button
        type="submit"
        className="rounded-xs border border-border bg-surface px-4 py-2 text-xs font-display font-bold uppercase tracking-wider text-text-subtle hover:border-red-400 hover:text-red-600 transition-colors cursor-pointer tactile-btn"
      >
        {t('nav_sign_out')}
      </button>
    </Form>
  );
}
