import type {LinkProps, NavLinkProps, NavigateOptions, To} from 'react-router';
import {Link as ReactLink, NavLink as ReactNavLink, useNavigate as useRRNavigate} from 'react-router';
import {useLocalizedPath, useSelectedLocale} from '~/lib/i18n';
import type {Locale} from '~/lib/i18n';

type BaseProps = {
  locale?: Locale;
  preservePath?: boolean;
};

type LinkVariantProps = BaseProps &
  LinkProps & {
    variant?: 'link';
  };

type NavLinkVariantProps = BaseProps &
  NavLinkProps & {
    variant: 'nav';
  };

export type ExtendedLinkProps = LinkVariantProps | NavLinkVariantProps;

/**
 * Locale-aware Link component that automatically prepends the market prefix
 * while maintaining active styling and navigation mechanics.
 */
export function Link(props: ExtendedLinkProps) {
  const {locale, preservePath = false, variant = 'link', to, ...restProps} = props;

  const targetPath = typeof to === 'string' ? to : (to?.pathname ?? '');
  const localizedTo = useLocalizedPath(targetPath, locale, preservePath);

  if (variant === 'nav') {
    return <ReactNavLink {...(restProps as NavLinkProps)} to={localizedTo} />;
  }

  return <ReactLink {...(restProps as LinkProps)} to={localizedTo} />;
}

export type ExtendedNavLinkProps = BaseProps & NavLinkProps;

export function NavLink(props: ExtendedNavLinkProps) {
  const {locale, preservePath = false, to, ...restProps} = props;
  const targetPath = typeof to === 'string' ? to : (to?.pathname ?? '');
  const localizedTo = useLocalizedPath(targetPath, locale, preservePath);

  return <ReactNavLink {...restProps} to={localizedTo} />;
}

/**
 * Locale-aware navigation hook that wraps React Router's useNavigate.
 * Ensures programmatic navigations (e.g. search submit, redirects) retain the active market prefix.
 */
export function useNavigateLocale() {
  const navigate = useRRNavigate();
  const selectedLocale = useSelectedLocale();

  return (to: To | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      return navigate(to);
    }
    const path = typeof to === 'string' ? to : (to.pathname ?? '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const rawPrefix = selectedLocale.pathPrefix || '';
    const prefix = rawPrefix ? (rawPrefix.startsWith('/') ? rawPrefix : `/${rawPrefix}`) : '';

    // If already has prefix or external link, don't duplicate
    const isExternal = cleanPath.startsWith('http://') || cleanPath.startsWith('https://');
    let target = cleanPath;
    if (!isExternal && prefix) {
      if (!cleanPath.startsWith(prefix)) {
        target = `${prefix}${cleanPath === '/' ? '' : cleanPath}`;
      }
    }

    if (typeof to === 'string') {
      return navigate(target, options);
    }
    return navigate({...to, pathname: target}, options);
  };
}

