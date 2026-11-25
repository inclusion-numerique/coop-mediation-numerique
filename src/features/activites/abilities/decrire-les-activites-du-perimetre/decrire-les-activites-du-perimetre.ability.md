# Fonctionnalité: Décrire les activités du périmètre

> La barre des statistiques propose les employeuses des activités du
> périmètre et borne le choix des dates à la période qu'elles couvrent.

## Règle: Les employeuses proposées sont celles des activités du périmètre

### Scénario: L'employeuse d'un autre médiateur n'est pas proposée

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | employeuse     |
  | 2026-03-03 | individuel | Mairie de Lyon |
  | 2026-05-09 | individuel |                |
* Et la médiatrice "Grace Hopper"
* Et les activités de "Grace Hopper" :
  | date       | type       | employeuse            |
  | 2026-03-07 | individuel | Conseil départemental |
* Quand je décris les activités du périmètre de "Ada Lovelace"
* Alors les employeuses du périmètre sont "Mairie de Lyon"
* Et les activités couvrent du "2026-03-03" au "2026-05-09"

## Règle: Un périmètre sans activité ne propose rien

### Scénario: Un coordinateur sans équipe

* Étant donné le coordinateur "Alan Turing"
* Quand je décris les activités du périmètre de "Alan Turing"
* Alors le périmètre n'a aucune employeuse
