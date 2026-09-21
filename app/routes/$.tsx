import {redirect} from 'react-router';
import type {Route} from './+types/$';

export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);

  // Canonical SEO redirection for primary market alias (/vi, /vi/*)
  if (url.pathname === '/vi' || url.pathname.startsWith('/vi/')) {
    const canonicalPath = url.pathname.replace(/^\/vi(\/|$)/, '/') || '/';
    return redirect(`${canonicalPath}${url.search}${url.hash}`, 301);
  }

  throw new Response(`${url.pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return null;
}
