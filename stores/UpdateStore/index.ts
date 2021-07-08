import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { updateStoreAsUser } from '../core/updateStoreAsUser';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';
import { mapStore, Store } from '../core/models/Store';
import { getBody } from '../core/getBody';
import { uploadStoreLogo } from '../core/resources/uploadStoreLogo';
import { deleteResource } from '../core/resources/deleteResource';
import { File } from '../core/getMultipartFormData';

const STORE_UPDATED = createSuccessResponse(
  'STORE_UPDATED',
  'Successfully updated store.',
);

const FAILED_TO_UPDATE_STORE = createErrorResponse(
  'STORES_FAILED_TO_UPDATE_STORE',
  'An unknown error occurred while attempting to update store. Please try again.',
  500,
);

type UpdateStore = Partial<Pick<Store, 'name' | 'description' | 'branding' | 'country' | 'currency' | 'status'>>;

export default async function (context: Context, req: HttpRequest) {
  const { storeId } = req.params;

  const [fields, files] = getBody<UpdateStore>(req);
  const userId = await getUserIdFromRequest(req);

  let logoPath: string;

  return await updateStoreAsUser(storeId, userId, async (store) => {
    if (typeof fields.name === 'string') {
      store.name = fields.name;
    }

    if (typeof fields.description === 'string') {
      store.description = fields.description;
    }

    if (typeof fields.branding !== 'undefined') {
      store.branding = {
        ...store.branding,
        ...fields.branding,
      };
    }

    if (files.logo) {
      const logo = files.logo as File;

      if (!logoPath) {
        // Upload the new logo (only if the user has permission)
        logoPath = await uploadStoreLogo(store.id, logo.value, logo.contentType);
      }

      if (store.logo) {
        // Delete the previous logo
        await deleteResource(store.logo);
      }

      // Update the store's logo path
      store.logo = logoPath;
    }

    if (typeof fields.country === 'string') {
      store.country = fields.country;
    }

    if (typeof fields.currency === 'string') {
      store.currency = fields.currency;
    }

    if (typeof fields.status === 'string') {
      switch (fields.status) {
        case 'inactive': {
          store.status = 'inactive';
          break;
        }
        case 'active': {
          if (!store.country || !store.currency) {
            // Not allowed to set the status of the store to "active" if the store doesn't have a country & currency set.
            return false;
          }
          store.status = 'active';
          break;
        }
      }
      store.status = fields.status;
    }

    return {
      store: mapStore(store, 'admin'),
    };
  }, {
    success: STORE_UPDATED,
    failure: FAILED_TO_UPDATE_STORE,
  });
};
