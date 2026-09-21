import * as React from 'react';
import {Link} from '~/components/Link';
import {Pagination} from '@shopify/hydrogen';
import {useTranslation} from '~/lib/translations';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
  emptyHeading,
  emptyDescription,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  resourcesClassName?: string;
  emptyHeading?: string;
  emptyDescription?: string;
}) {
  const {t} = useTranslation();

  const finalEmptyHeading = emptyHeading ?? t('pagination_empty_heading');
  const finalEmptyDesc = emptyDescription ?? t('pagination_empty_desc');

  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        if (nodes.length === 0 && !isLoading) {
          return (
            <div className="rounded-sm border border-dashed border-border bg-surface p-8 sm:p-12 text-center shadow-xs my-8">
              <div className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-plate/60 px-3 py-1 text-[10px] font-display font-semibold tracking-widest text-shutter uppercase mb-3 shadow-2xs">
                {t('pagination_empty_badge')}
              </div>
              <h3 className="text-base sm:text-lg font-display font-bold text-text-main mb-2">
                {finalEmptyHeading}
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed font-body mb-6">
                {finalEmptyDesc}
              </p>
              <Link
                to="/collections/all"
                className="inline-flex items-center gap-2 rounded-xs border border-border bg-plate/60 px-6 py-2.5 text-xs font-display font-bold uppercase tracking-wider text-text-main shadow-2xs hover:border-shutter hover:text-shutter active:translate-x-px active:translate-y-px transition-all cursor-pointer tactile-btn"
              >
                <span>{t('pagination_browse_all')}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          );
        }

        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        const btnClass =
          'inline-flex items-center gap-2 rounded-xs border border-border bg-surface px-6 py-2.5 text-xs font-display font-semibold text-text-main hover:border-shutter hover:text-shutter transition-all shadow-[2px_2px_0px_#CBD5E1] active:translate-x-px active:translate-y-px active:shadow-none cursor-pointer';

        return (
          <div className="flex flex-col items-center gap-8 my-8">
            <PreviousLink className={btnClass}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-xs bg-shutter animate-pulse" />
                  {t('pagination_loading')}
                </span>
              ) : (
                <span>
                  <span aria-hidden="true">&uarr;</span> {t('pagination_previous')}
                </span>
              )}
            </PreviousLink>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={`w-full ${resourcesClassName}`}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              <div className="w-full">{resourcesMarkup}</div>
            )}
            <NextLink className={btnClass}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-xs bg-shutter animate-pulse" />
                  {t('pagination_loading')}
                </span>
              ) : (
                <span>
                  {t('pagination_next')} <span aria-hidden="true">&darr;</span>
                </span>
              )}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
