# Feature: Compter les accompagnements

> Les chiffres clés des statistiques : activités, accompagnements et
> personnes accompagnées, dans le périmètre du demandeur.

## Rule: Seules les activités vivantes du périmètre comptent

### Scenario: Une activité supprimée et celle d'un autre médiateur sont écartées

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | anonymes | suivis | supprimee |
  | 2026-03-03 | individuel | 1        |        |           |
  | 2026-03-05 | collectif  | 2        | 1      |           |
  | 2026-03-09 | individuel | 1        |        | oui       |
* And la médiatrice "Grace Hopper"
* And les activités de "Grace Hopper" :
  | date       | type       |
  | 2026-03-07 | individuel |
* When je compte les accompagnements de "Ada Lovelace"
* Then les activités comptées sont 2 dont 1 individuelle et 1 collective
* And les accompagnements comptés sont 4 dont 3 collectifs
* And les personnes comptées sont 4 dont 1 suivie et 3 anonymes

## Rule: Le coordinateur compte son équipe pendant l'appartenance de chacun

### Scenario: Les activités d'un ancien membre après son départ sont écartées

* Given le coordinateur "Alan Turing"
* And la médiatrice "Ada Lovelace"
* And "Ada Lovelace" est membre de l’équipe de "Alan Turing"
* And la médiatrice "Grace Hopper"
* And "Grace Hopper" a quitté l’équipe de "Alan Turing" le "2026-03-06"
* And les activités de "Ada Lovelace" :
  | date       | type       |
  | 2026-03-03 | individuel |
* And les activités de "Grace Hopper" :
  | date       | type       |
  | 2026-03-05 | individuel |
  | 2026-03-09 | individuel |
* When je compte les accompagnements de "Alan Turing"
* Then les activités comptées sont 2 dont 2 individuelles et 0 collective

## Rule: Les nouvelles personnes ne se comptent que sur une période bornée des deux côtés

### Scenario: Une période ouverte ne compte aucune nouvelle personne

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | nouveaux |
  | 2026-03-03 | individuel | oui      |
  | 2026-03-05 | individuel | non      |
* When je compte les accompagnements de "Ada Lovelace" avec :
  | du | 2026-03-01 |
  | au | 2026-03-31 |
* Then les nouvelles personnes comptées sont 1
* When je compte les accompagnements de "Ada Lovelace" avec :
  | du | 2026-03-01 |
* Then les nouvelles personnes comptées sont 0

## Rule: Les critères de la barre restreignent le compte

### Scenario: Filtrer sur les activités issues d'un rendez-vous honoré

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | rendezVous |
  | 2026-03-03 | individuel | seen       |
  | 2026-03-05 | individuel | noshow     |
  | 2026-03-07 | individuel |            |
* When je compte les accompagnements de "Ada Lovelace" avec :
  | rdvs | seen |
* Then les activités comptées sont 1 dont 1 individuelle et 0 collective
* When je compte les accompagnements de "Ada Lovelace" avec :
  | rdv | 1 |
* Then les activités comptées sont 2 dont 2 individuelles et 0 collective
