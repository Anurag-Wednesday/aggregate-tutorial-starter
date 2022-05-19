import { insertPurchasedProducts } from '@daos/purchasedProducts';
import { transformSQLError } from '@utils';
import { SUBSCRIPTION_TOPICS } from '@server/utils/constants';
import { pubsub } from '@server/utils/pubsub';

export const publishMessage = async (args, res) => {
  pubsub.publish(SUBSCRIPTION_TOPICS.NEW_PURCHASED_PRODUCT, {
    newPurchasedProduct: {
      productId: res.productId,
      deliveryDate: res.deliveryDate,
      price: res.price,
      storeId: res.storeId
    }
  });
};
export default async (model, args, context) => {
  try {
    const res = await insertPurchasedProducts(args);
    publishMessage(res, args);
    return res;
  } catch (err) {
    throw transformSQLError(err);
  }
};
