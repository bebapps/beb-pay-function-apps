import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getDatabase } from '../core/getDatabase';
import { withoutResource } from '../core/models/withoutResource';
import { doesUserBelongToStore } from '../core/auth/doesUserBelongToStore';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';
import { getPermissionToStore } from '../core/auth/getPermissionToStore';
import { Resource, SqlParameter } from '@azure/cosmos';
import { mapStoreProduct, StoreProduct } from '../core/models/StoreProduct';

const PRODUCTS = createSuccessResponse(
  'PRODUCTS',
  'Performed product search.',
);

const STORE_NOT_ACTIVE = createErrorResponse(
  'STORES_STORE_NOT_ACTIVE',
  'Store is not currently active. Searching products as a guest user is disabled. Please try again later.',
  403,
);

const MISSING_SEARCH_FILTERS = createErrorResponse(
  'STORES_MISSING_SEARCH_FILTERS',
  'One or more search filter is required to perform a search. Try "name" or "barcode.format" and "barcode.code".',
  400,
);

export default async function (context: Context, req: HttpRequest) {
  const storeId = req.params.storeId;
  const userId = await getUserIdFromRequest(req, false);
  const permission = await getPermissionToStore(storeId, userId);

  if (!permission) {
    return STORE_NOT_ACTIVE();
  }

  const { storeProducts } = await getDatabase();

  const filterClauses: string[] = [];
  const filterParameters: SqlParameter[] = [];

  //

  const {
    name,
    'barcode.format': barcodeFormat,
    'barcode.code': barcodeCode,
  } = req.query;

  if (name) {
    filterClauses.push('CONTAINS(c.name, @searchName, true)');
    filterParameters.push({ name: '@searchName', value: name });
  }

  if (barcodeFormat && barcodeCode) {
    filterClauses.push('c.barcode.format = @barcodeFormat AND c.barcode.code = @barcodeCode');
    filterParameters.push({ name: '@barcodeFormat', value: barcodeFormat });
    filterParameters.push({ name: '@barcodeCode', value: barcodeCode });
  }

  //

  if (!filterClauses.length) {
    return MISSING_SEARCH_FILTERS();
  }

  const { resources } = await storeProducts.items.query({
    query: 'SELECT * FROM c WHERE c.storeId = @storeId AND (' + filterClauses.join(' AND ') + ')',
    parameters: [
      { name: '@storeId', value: storeId },
      ...filterParameters,
    ],
  }).fetchAll();

  const products = resources.map((storeProductResources: StoreProduct & Resource) => {
    return mapStoreProduct(storeProductResources);
  });

  return PRODUCTS({ products });
};
