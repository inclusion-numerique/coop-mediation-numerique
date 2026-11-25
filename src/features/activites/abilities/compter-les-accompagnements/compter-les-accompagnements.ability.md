# Fonctionnalité: Compter les accompagnements

> Les chiffres clés des statistiques : activités, accompagnements et
> personnes accompagnées, dans le périmètre du demandeur.

## Règle: Seules les activités vivantes du périmètre comptent

### Scénario: Une activité supprimée et celle d'un autre médiateur sont écartées

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | anonymes | suivis | supprimee |
  | 2026-03-03 | individuel | 1        |        |           |
  | 2026-03-05 | collectif  | 2        | 1      |           |
  | 2026-03-09 | individuel | 1        |        | oui       |
* Et la médiatrice "Grace Hopper"
* Et les activités de "Grace Hopper" :
  | date       | type       |
  | 2026-03-07 | individuel |
* Quand je compte les accompagnements de "Ada Lovelace"
* Alors les activités comptées sont 2 dont 1 individuelle et 1 collective
* Et les accompagnements comptés sont 4 dont 3 collectifs
* Et les personnes comptées sont 4 dont 1 suivie et 3 anonymes

## Règle: Le coordinateur compte son équipe pendant l'appartenance de chacun

### Scénario: Les activités d'un ancien membre après son départ sont écartées

* Étant donné le coordinateur "Alan Turing"
* Et la médiatrice "Ada Lovelace"
* Et "Ada Lovelace" est membre de l’équipe de "Alan Turing"
* Et la médiatrice "Grace Hopper"
* Et "Grace Hopper" a quitté l’équipe de "Alan Turing" le "2026-03-06"
* Et les activités de "Ada Lovelace" :
  | date       | type       |
  | 2026-03-03 | individuel |
* Et les activités de "Grace Hopper" :
  | date       | type       |
  | 2026-03-05 | individuel |
  | 2026-03-09 | individuel |
* Quand je compte les accompagnements de "Alan Turing"
* Alors les activités comptées sont 2 dont 2 individuelles et 0 collective

## Règle: Les nouvelles personnes ne se comptent que sur une période bornée des deux côtés

### Scénario: Une période ouverte ne compte aucune nouvelle personne

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | nouveaux |
  | 2026-03-03 | individuel | oui      |
  | 2026-03-05 | individuel | non      |
* Quand je compte les accompagnements de "Ada Lovelace" avec :
  | du | 2026-03-01 |
  | au | 2026-03-31 |
* Alors les nouvelles personnes comptées sont 1
* Quand je compte les accompagnements de "Ada Lovelace" avec :
  | du | 2026-03-01 |
* Alors les nouvelles personnes comptées sont 0

## Règle: Les critères de la barre restreignent le compte

### Scénario: Filtrer sur les activités issues d'un rendez-vous honoré

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | rendezVous |
  | 2026-03-03 | individuel | seen       |
  | 2026-03-05 | individuel | noshow     |
  | 2026-03-07 | individuel |            |
* Quand je compte les accompagnements de "Ada Lovelace" avec :
  | rdvs | seen |
* Alors les activités comptées sont 1 dont 1 individuelle et 0 collective
* Quand je compte les accompagnements de "Ada Lovelace" avec :
  | rdv | 1 |
* Alors les activités comptées sont 2 dont 2 individuelles et 0 collective
