import crypto from 'node:crypto'

/**
 * RDV Service Public signe chaque notification : l'en-tête `X-Lapin-Signature`
 * porte le HMAC-SHA256 hexadécimal du corps brut, calculé avec le secret partagé
 * déclaré à la pose du webhook.
 *
 * Sans cette vérification, l'URL de notification est un point d'écriture public :
 * une enveloppe forgée suffit à faire supprimer un rendez-vous ou anonymiser un
 * usager. Le corps doit donc être comparé tel qu'il est arrivé — sérialiser à
 * nouveau un objet analysé ne redonne pas les mêmes octets.
 */
export const ENTETE_SIGNATURE_WEBHOOK = 'x-lapin-signature'

export const signatureValide = ({
  corpsBrut,
  signature,
  secret,
}: {
  corpsBrut: string
  signature: string | null
  secret: string
}): boolean => {
  if (signature === null || secret === '') {
    return false
  }

  const attendue = crypto
    .createHmac('sha256', secret)
    .update(corpsBrut, 'utf8')
    .digest('hex')

  const recue = Buffer.from(signature, 'utf8')
  const calculee = Buffer.from(attendue, 'utf8')

  // timingSafeEqual exige des longueurs égales : une signature tronquée la ferait
  // lever plutôt que renvoyer false.
  return (
    recue.length === calculee.length && crypto.timingSafeEqual(recue, calculee)
  )
}
