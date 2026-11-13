# Feature: Décrire les activités du périmètre

> La barre des statistiques propose les employeuses des activités du
> périmètre et borne le choix des dates à la période qu'elles couvrent.

## Rule: Les employeuses proposées sont celles des activités du périmètre

### Scenario: L'employeuse d'un autre médiateur n'est pas proposée

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | employeuse     |
  | 2026-03-03 | individuel | Mairie de Lyon |
  | 2026-05-09 | individuel |                |
* And la médiatrice "Grace Hopper"
* And les activités de "Grace Hopper" :
  | date       | type       | employeuse            |
  | 2026-03-07 | individuel | Conseil départemental |
* When je décris les activités du périmètre de "Ada Lovelace"
* Then les employeuses du périmètre sont "Mairie de Lyon"
* And les activités couvrent du "2026-03-03" au "2026-05-09"

## Rule: Un périmètre sans activité ne propose rien

### Scenario: Un coordinateur sans équipe

* Given le coordinateur "Alan Turing"
* When je décris les activités du périmètre de "Alan Turing"
* Then le périmètre n'a aucune employeuse
