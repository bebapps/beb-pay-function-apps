import { Context, HttpRequest } from '@azure/functions';
import { getUserIdFromRequest } from '../core/auth/getUserIdFromRequest';
import { getMultipartFormData } from '../core/getMultipartFormData';
import { updateStoreAsUser } from '../core/updateStoreAsUser';
import { uploadStoreLogo } from '../core/resources/uploadStoreLogo';
import { createErrorResponse, createSuccessResponse } from '../core/responses/createResponse';
import { deleteResource } from '../core/resources/deleteRespource';

const STORE_LOGO_UPLOADED = createSuccessResponse(
  'STORE_LOGO_UPLOADED',
  'Successfully uploaded store logo.',
);

const FAILED_TO_UPLOAD_STORE_LOGO = createErrorResponse(
  'STORES_FAILED_TO_UPLOAD_STORE_LOGO',
  'An unknown error occurred while attempting to upload a store logo. Please try again.',
  500,
);

export default async function (context: Context, req: HttpRequest) {
  const { storeId } = req.params;

  const formData = await getMultipartFormData(req);
  const userId = await getUserIdFromRequest(req);

  const logo = formData.get('logo');
  let logoPath: string;

  return await updateStoreAsUser(storeId, userId, async (store) => {
    if (!logoPath) {
      // Upload the new logo (only if the user has permission)
      logoPath = await uploadStoreLogo(logo.value, logo.contentType);
    }

    if (store.logo) {
      // Delete the previous logo
      await deleteResource(store.logo);
    }

    // Update the store's logo path
    store.logo = logoPath;

    return {
      store,
    };
  }, {
    success: STORE_LOGO_UPLOADED,
    failure: FAILED_TO_UPLOAD_STORE_LOGO,
  });
};
