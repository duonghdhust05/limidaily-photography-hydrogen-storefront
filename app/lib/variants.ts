import {useLocation} from 'react-router';
import type {SelectedOption} from '@shopify/hydrogen/storefront-api-types';
import {useMemo} from 'react';
import {getLocaleFromPathname} from '~/lib/i18n';

export function useVariantUrl(
  handle: string,
  selectedOptions?: SelectedOption[],
) {
  const {pathname} = useLocation();

  return useMemo(() => {
    return getVariantUrl({
      handle,
      pathname,
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions, pathname]);
}

export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}: {
  handle: string;
  pathname: string;
  searchParams: URLSearchParams;
  selectedOptions?: SelectedOption[];
}) {
  const currentLocale = getLocaleFromPathname(pathname);
  const prefix = currentLocale.pathPrefix ? currentLocale.pathPrefix.replace(/\/+$/, '') : '';
  const path = `${prefix}/products/${handle}`;

  selectedOptions?.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}
