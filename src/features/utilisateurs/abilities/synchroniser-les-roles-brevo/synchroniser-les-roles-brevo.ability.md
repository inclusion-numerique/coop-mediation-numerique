# Fonctionnalité: Synchroniser les rôles Brevo

> L'équipe communication segmente la liste de diffusion par rôle. Chaque
> nuit, chaque inscrit vivant y reçoit les rôles qu'il tient de la coop et du
> dispositif ; un inscrit sans rôle en est retiré. La coop fait foi : ce qui
> n'est plus renseigné chez elle est effacé chez Brevo.

## Règle: Les rôles se lisent dans la coop et dans le dispositif

### Plan du scénario: Un inscrit « <situation> » porte les rôles « <roles> »

* Étant donné un inscrit vivant "<situation>"
* Quand les rôles Brevo sont synchronisés
* Alors son contact est importé avec les rôles "<roles>"

#### Exemples:

  | situation                                              | roles                                         |
  | ------------------------------------------------------ | --------------------------------------------- |
  | médiateur hors dispositif                              | Médiateur                                     |
  | médiateur conseiller numérique                         | Médiateur, Conseiller numérique               |
  | coordinateur de la coop hors dispositif                | Coordinateur                                  |
  | coordinateur du dispositif sans rôle coordinateur coop | Conseiller numérique, Coordinateur            |
  | médiateur et coordinateur conseiller numérique         | Médiateur, Conseiller numérique, Coordinateur |

## Règle: Un inscrit sans rôle est retiré de la liste

### Scénario: Un inscrit sans rôle est retiré

* Étant donné un inscrit vivant "sans rôle"
* Quand les rôles Brevo sont synchronisés
* Alors son contact est retiré de la liste

### Scénario: Un coordinateur déclaré hors dispositif n'a pas de rôle

* Étant donné un inscrit vivant "déclaré coordinateur hors dispositif"
* Quand les rôles Brevo sont synchronisés
* Alors son contact est retiré de la liste

## Règle: Seuls les inscrits vivants sont synchronisés

### Scénario: Un compte supprimé ou une inscription inachevée est ignoré

* Étant donné un médiateur au compte supprimé et un médiateur à l'inscription inachevée
* Quand les rôles Brevo sont synchronisés
* Alors aucun de leurs contacts n'est importé ni retiré

## Règle: L'identité accompagne les rôles

### Scénario: Prénom, nom et téléphone sont transmis

* Étant donné un médiateur vivant avec un prénom, un nom et un téléphone
* Quand les rôles Brevo sont synchronisés
* Alors son contact porte son prénom, son nom, son téléphone et son identifiant

### Scénario: Un téléphone illisible n'est pas transmis

* Étant donné un médiateur vivant dont le téléphone enregistré est illisible
* Quand les rôles Brevo sont synchronisés
* Alors son contact est importé sans téléphone

## Règle: Les dates du contrat le plus récent accompagnent le contact

> L'équipe communication segmente aussi la liste selon les fins de contrat,
> pour adresser des campagnes aux conseillers en fin de contrat ou en rupture.
> Le contact porte donc la date de fin et la date de rupture du contrat le plus
> récent ; une date absente est effacée chez Brevo, la coop faisant foi.

### Plan du scénario: Un conseiller « <situation> » porte la fin « <fin> » et la rupture « <rupture> »

* Étant donné un conseiller numérique vivant "<situation>"
* Quand les rôles Brevo sont synchronisés
* Alors son contact porte la date de fin "<fin>" et la date de rupture "<rupture>"

#### Exemples:

  | situation                                  | fin        | rupture    |
  | ------------------------------------------ | ---------- | ---------- |
  | en CDD                                     | 2026-12-15 | aucune     |
  | en CDI                                     | aucune     | aucune     |
  | dont le CDD a été rompu                    | 2026-12-15 | 2026-07-10 |
  | dont le CDI a été rompu                    | aucune     | 2026-06-30 |
  | réembauché en CDI après une rupture        | aucune     | aucune     |
  | sans contrat connu                         | aucune     | aucune     |

## Règle: Les contacts partent par lots bornés

### Scénario: Aucun lot ne dépasse la taille maximale

* Étant donné trois médiateurs vivants
* Et Brevo accepte au plus deux contacts par lot
* Quand les rôles Brevo sont synchronisés
* Alors aucun lot importé ne dépasse deux contacts
* Et chacun des trois médiateurs figure dans exactement un lot

### Scénario: Un lot refusé n'empêche pas les suivants

* Étant donné trois médiateurs vivants
* Et Brevo accepte au plus deux contacts par lot et refuse celui du premier médiateur
* Quand les rôles Brevo sont synchronisés
* Alors le bilan signale les contacts du lot refusé
* Et les lots suivants sont importés
