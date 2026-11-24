import { FiltreDeDatesValidation } from '@/features/clients-api/implementations/api-v1'
import { JsonApiCursorPaginationQueryParamsValidation } from '@/libraries/json-api/cursor-pagination'

export const ActivitesQueryParamsValidation =
  JsonApiCursorPaginationQueryParamsValidation.extend({
    filter: FiltreDeDatesValidation,
  })
