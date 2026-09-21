import {
  useFetcher,
  type FormProps,
  type Fetcher,
} from 'react-router';
import React, {useRef, useEffect} from 'react';
import type {PredictiveSearchReturn} from '~/lib/search';
import {useAside} from './Aside';
import {useNavigateLocale} from '~/components/Link';
import {useSelectedLocale} from '~/lib/i18n';

type SearchFormPredictiveChildren = (args: {
  fetchResults: (event: React.ChangeEvent<HTMLInputElement>) => void;
  goToSearch: () => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  fetcher: Fetcher<PredictiveSearchReturn>;
}) => React.ReactNode;

type SearchFormPredictiveProps = Omit<FormProps, 'children'> & {
  children: SearchFormPredictiveChildren | null;
};

/**
 *  Search form component that sends search requests to the `/search` route
 **/
export function SearchFormPredictive({
  children,
  className = 'predictive-search-form',
  ...props
}: SearchFormPredictiveProps) {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigateLocale();
  const aside = useAside();
  const locale = useSelectedLocale();
  const searchEndpoint = `${locale.pathPrefix}/search`;

  /** Reset the input value and blur the input */
  function resetInput(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (inputRef?.current?.value) {
      inputRef.current.blur();
    }
  }

  /** Navigate to the search page with the current input value */
  function goToSearch() {
    const term = inputRef?.current?.value;
    void navigate(`/search${term ? `?q=${term}` : ''}`);
    aside.close();
  }

  /** Fetch search results based on the input value */
  function fetchResults(event: React.ChangeEvent<HTMLInputElement>) {
    void fetcher.submit(
      {q: event.target.value || '', limit: 5, predictive: true},
      {method: 'GET', action: searchEndpoint},
    );
  }

  // ensure the passed input has a type of search, because SearchResults
  // will select the element based on the input
  useEffect(() => {
    inputRef?.current?.setAttribute('type', 'search');
  }, []);

  if (typeof children !== 'function') {
    return null;
  }

  return (
    <fetcher.Form {...props} className={className} onSubmit={resetInput}>
      {children({inputRef, fetcher, fetchResults, goToSearch})}
    </fetcher.Form>
  );
}
