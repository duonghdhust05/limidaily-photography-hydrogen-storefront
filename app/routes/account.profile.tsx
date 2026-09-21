import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from './+types/account.profile';
import {useTranslation, getTranslationDictionary} from '~/lib/translations';
import {getLocaleFromRequest} from '~/lib/i18n';
import {
  getClientIp,
  checkRateLimit,
  createRateLimitHeaders,
} from '~/lib/rateLimiter';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  // Rate Limiting: Max 5 profile updates per 5 minutes per client IP
  const clientIp = getClientIp(request);
  const rateLimitKey = `account-profile:${clientIp}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    maxRequests: 5,
    windowMs: 300_000,
  });

  if (!rateLimitResult.allowed) {
    const selectedLocale = getLocaleFromRequest(request);
    const dict = getTranslationDictionary(selectedLocale.language);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
    return data(
      {error: dict.account_profile_rate_limited, customer: null},
      {status: 429, headers: rateLimitHeaders},
    );
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;
  const {t} = useTranslation();

  return (
    <div className="account-profile">
      <h2>{t('account_my_profile')}</h2>
      <br />
      <Form method="PUT">
        <legend>{t('account_personal_info')}</legend>
        <fieldset>
          <label htmlFor="firstName">{t('account_first_name')}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder={t('account_first_name')}
            aria-label={t('account_first_name')}
            defaultValue={customer.firstName ?? ''}
            minLength={2}
          />
          <label htmlFor="lastName">{t('account_last_name')}</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder={t('account_last_name')}
            aria-label={t('account_last_name')}
            defaultValue={customer.lastName ?? ''}
            minLength={2}
          />
        </fieldset>
        {action?.error ? (
          <p>
            <mark>
              <small>{action.error}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        <button type="submit" disabled={state !== 'idle'}>
          {state !== 'idle' ? t('account_updating') : t('account_update')}
        </button>
      </Form>
    </div>
  );
}
