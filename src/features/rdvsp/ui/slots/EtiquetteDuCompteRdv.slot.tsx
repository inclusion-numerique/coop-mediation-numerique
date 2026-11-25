import type { StatutIntegration } from '../../domain/compte/sante-compte'
import RdvServicePublicStatusTag from '../components/RdvServicePublicStatusTag'

const EtiquetteDuCompteRdv = ({ status }: { status: StatutIntegration }) => (
  <RdvServicePublicStatusTag status={status} />
)

export default EtiquetteDuCompteRdv
