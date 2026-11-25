# Fonctionnalité: Consulter l'employeuse d'un utilisateur à une date

Un compte rendu d'activité peut être saisi longtemps après l'intervention : il
doit être rattaché à l'employeuse de l'époque, pas à celle d'aujourd'hui.

## Règle: Le contrat qui couvre la date désigne l'employeuse

### Scénario: Une date couverte par un contrat passé

* Étant donné un utilisateur employé par "Employeuse de 2025" du "2025-01-01" au "2025-12-31"
* Et ce même utilisateur employé par "Employeuse de 2026" depuis le "2026-01-01"
* Quand je consulte son employeuse au "2025-06-01"
* Alors l'employeuse à cette date est "Employeuse de 2025"

### Scénario: Deux contrats couvrent la même date

Des contrats simultanés chez des structures différentes existent en production :
le plus récemment commencé l'emporte, pour que le rattachement ne dépende pas de
l'ordre dans lequel la base les rend.

* Étant donné un utilisateur employé par "Employeuse historique" du "2025-01-01" au "2026-12-31"
* Et ce même utilisateur employé par "Employeuse récente" du "2026-01-01" au "2026-12-31"
* Quand je consulte son employeuse au "2026-06-01"
* Alors l'employeuse à cette date est "Employeuse récente"

### Scénario: Une date couverte par un contrat toujours ouvert

* Étant donné un utilisateur employé par "Employeuse de 2026" depuis le "2026-01-01"
* Quand je consulte son employeuse au "2026-06-01"
* Alors l'employeuse à cette date est "Employeuse de 2026"

## Règle: Sans contrat couvrant la date, l'employeuse courante fait foi

### Scénario: Un utilisateur sans aucun contrat

* Étant donné un utilisateur avec une affectation active chez "Employeuse déclarée"
* Quand je consulte son employeuse au "2026-06-01"
* Alors l'employeuse à cette date est "Employeuse déclarée"

### Scénario: Une date antérieure à tout contrat connu

* Étant donné un utilisateur avec une affectation active chez "Employeuse déclarée"
* Et ce même utilisateur employé par "Employeuse de 2026" depuis le "2026-01-01"
* Quand je consulte son employeuse au "2020-06-01"
* Alors l'employeuse à cette date est "Employeuse déclarée"

### Scénario: Un utilisateur sans employeuse

* Étant donné un utilisateur sans employeuse connue
* Quand je consulte son employeuse au "2026-06-01"
* Alors il n'a pas d'employeuse à cette date
