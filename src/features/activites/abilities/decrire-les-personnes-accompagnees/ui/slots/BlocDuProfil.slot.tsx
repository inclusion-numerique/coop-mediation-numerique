import { ProfilDesPersonnesAccompagnees } from '../components/ProfilDesPersonnesAccompagnees'
import type { ProfilPresente } from '../presenters/profil.presenter'

export const BlocDuProfil = async ({
  profil,
}: {
  profil: ProfilPresente | Promise<ProfilPresente>
}) => <ProfilDesPersonnesAccompagnees beneficiaires={await profil} />
