import {flatRoutes} from '@react-router/fs-routes';
import {type RouteConfig} from '@react-router/dev/routes';
import {hydrogenRoutes} from '@shopify/hydrogen';
import {SUPPORTED_LOCALES} from './lib/i18n';

const baseRoutes = await flatRoutes();

function prefixRoutes(prefixPath: string, list: any[], isChild = false): any[] {
  return list.map((r) => {
    const newId = r.id ? `${prefixPath}-${r.id}` : `${prefixPath}-${r.file}`;
    let newPath = r.path;
    if (!isChild) {
      newPath = r.path ? `${prefixPath}/${r.path}` : prefixPath;
    }
    return {
      ...r,
      id: newId,
      index: isChild ? r.index : false,
      path: newPath,
      children: r.children ? prefixRoutes(prefixPath, r.children, true) : undefined,
    };
  });
}

// Dynamically generate prefixed routes for all configured international markets in SSOT
const internationalPrefixes = SUPPORTED_LOCALES
  .filter((l) => Boolean(l.pathPrefix))
  .map((l) => l.pathPrefix.replace(/^\/+/, ''));

const dynamicPrefixedRoutes = internationalPrefixes.flatMap((prefix) =>
  prefixRoutes(prefix, baseRoutes),
);

export default hydrogenRoutes([
  ...baseRoutes,
  ...dynamicPrefixedRoutes,
]) satisfies RouteConfig;
