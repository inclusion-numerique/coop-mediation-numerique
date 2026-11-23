import { EmployeuseId } from '../../../../domain'
import { employeuseAffichage } from '../../../../ui/employeuse.presenter'
import { consulterEmployeuse } from './consulter-employeuse.query'

export const nomDeLEmployeuse = async (id: number): Promise<string | null> => {
  const consultee = await consulterEmployeuse({
    employeuseId: EmployeuseId(id),
  })

  return consultee === null
    ? null
    : (employeuseAffichage(consultee.employeuse).nom ?? '')
}
