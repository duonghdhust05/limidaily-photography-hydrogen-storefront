import type {Route} from './+types/account_.authorize';

export async function loader({context}: Route.LoaderArgs) {
  const response = await context.customerAccount.authorize();

  // If the customer already had an active cart before logging in,
  // associate their customerAccessToken with the cart's buyerIdentity
  // to avoid anonymous-to-authenticated checkout session collision.
  try {
    const buyer = await context.customerAccount.getBuyer();
    const cartId = context.cart.getCartId();
    if (cartId && buyer?.customerAccessToken) {
      await context.cart.updateBuyerIdentity({
        customerAccessToken: buyer.customerAccessToken,
      });
    }
  } catch (error) {
    console.warn('Failed to associate cart with customer identity on login:', error);
  }

  return response;
}
