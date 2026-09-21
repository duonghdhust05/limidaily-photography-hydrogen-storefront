import {redirect} from 'react-router';
import type {Route} from './+types/checkout';

export async function loader({context}: Route.LoaderArgs) {
  const {cart, customerAccount} = context;

  // Retrieve current cart
  const cartData = await cart.get();
  if (!cartData?.id || !cartData.totalQuantity) {
    return redirect('/cart');
  }

  let finalCheckoutUrl = cartData.checkoutUrl;

  // Ensure customer access token is linked if customer is logged in
  if (await customerAccount.isLoggedIn()) {
    try {
      const buyer = await customerAccount.getBuyer();
      if (buyer?.customerAccessToken) {
        const updated = await cart.updateBuyerIdentity({
          customerAccessToken: buyer.customerAccessToken,
        });
        if (updated.cart?.checkoutUrl) {
          finalCheckoutUrl = updated.cart.checkoutUrl;
        }
      }
    } catch (e) {
      console.warn('Checkout buyer identity sync warning:', e);
    }
  }

  // If checkoutUrl is still in the unprovisioned cart permalink format (/cart/c/),
  // force Shopify to provision an active checkout session by syncing buyer identity country
  if (finalCheckoutUrl && finalCheckoutUrl.includes('/cart/c/')) {
    try {
      const updated = await cart.updateBuyerIdentity({
        countryCode: context.storefront.i18n.country,
      });
      if (updated.cart?.checkoutUrl) {
        finalCheckoutUrl = updated.cart.checkoutUrl;
      }
    } catch (e) {
      console.warn('Failed to upgrade permalink to checkout URL:', e);
    }
  }

  if (finalCheckoutUrl) {
    return redirect(finalCheckoutUrl);
  }

  return redirect('/cart');
}

export default function Checkout() {
  return null;
}
