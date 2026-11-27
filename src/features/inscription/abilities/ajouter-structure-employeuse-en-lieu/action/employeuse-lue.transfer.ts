import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { EmployeuseLue } from '../domain'

export const employeuseLue = <
  Employeuse extends Omit<EmployeuseLue, 'denomination'> & {
    readonly denomination: string | null
  },
>(
  consultee: { readonly employeuse: Employeuse } | null,
): { readonly employeuse: EmployeuseLue } | null =>
  consultee === null
    ? null
    : {
        employeuse: {
          ...consultee.employeuse,
          denomination:
            consultee.employeuse.denomination === null
              ? null
              : Nom.safe(consultee.employeuse.denomination),
        },
      }
