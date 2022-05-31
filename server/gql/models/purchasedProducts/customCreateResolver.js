import { insertPurchasedProducts } from '@daos/purchasedProducts';
import { transformSQLError } from '@utils';
import { SUBSCRIPTION_TOPICS } from '@server/utils/constants';
import { pubsub } from '@server/utils/pubsub';
import { redis } from '@services/redis';
import moment from 'moment';

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

export const updateRedis = async res => {
  const currentDate = moment().format('YYYY-MM-DD');
  const redisAggregate = JSON.parse(await redis.get(`${currentDate}_total`));
  redis.set(
    `${currentDate}_total`,
    JSON.stringify({
      total: redisAggregate?.total + res.price || res.price,
      count: redisAggregate?.count + 1 || 1
    })
  );
};

export default async (model, args, context) => {
  try {
    const res = await insertPurchasedProducts(args);
    updateRedis(res);
    publishMessage(res, args);
    return res;
  } catch (err) {
    throw transformSQLError(err);
  }
};
