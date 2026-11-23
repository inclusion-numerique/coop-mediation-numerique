import { FiltreDeDatesValidation } from '@/features/clients-api/implementation/api-v1'
import { JsonApiCursorPaginationQueryParamsValidation } from '@/libraries/json-api/CursorPagination'

export const ActivitesQueryParamsValidation =
  JsonApiCursorPaginationQueryParamsValidation.extend({
    filter: FiltreDeDatesValidation,
  })
