# Feature: Consulter l'employeuse d'un utilisateur à une date

Un compte rendu d'activité peut être saisi longtemps après l'intervention : il
doit être rattaché à l'employeuse de l'époque, pas à celle d'aujourd'hui.

## Rule: Le contrat qui couvre la date désigne l'employeuse

### Scenario: Une date couverte par un contrat passé

* Given un utilisateur employé par "Employeuse de 2025" du "2025-01-01" au "2025-12-31"
* And ce même utilisateur employé par "Employeuse de 2026" depuis le "2026-01-01"
* When je consulte son employeuse au "2025-06-01"
* Then l'employeuse à cette date est "Employeuse de 2025"

### Scenario: Deux contrats couvrent la même date

Des contrats simultanés chez des structures différentes existent en production :
le plus récemment commencé l'emporte, pour que le rattachement ne dépende pas de
l'ordre dans lequel la base les rend.

* Given un utilisateur employé par "Employeuse historique" du "2025-01-01" au "2026-12-31"
* And ce même utilisateur employé par "Employeuse récente" du "2026-01-01" au "2026-12-31"
* When je consulte son employeuse au "2026-06-01"
* Then l'employeuse à cette date est "Employeuse récente"

### Scenario: Une date couverte par un contrat toujours ouvert

* Given un utilisateur employé par "Employeuse de 2026" depuis le "2026-01-01"
* When je consulte son employeuse au "2026-06-01"
* Then l'employeuse à cette date est "Employeuse de 2026"

## Rule: Sans contrat couvrant la date, l'employeuse courante fait foi

### Scenario: Un utilisateur sans aucun contrat

* Given un utilisateur avec une affectation active chez "Employeuse déclarée"
* When je consulte son employeuse au "2026-06-01"
* Then l'employeuse à cette date est "Employeuse déclarée"

### Scenario: Une date antérieure à tout contrat connu

* Given un utilisateur avec une affectation active chez "Employeuse déclarée"
* And ce même utilisateur employé par "Employeuse de 2026" depuis le "2026-01-01"
* When je consulte son employeuse au "2020-06-01"
* Then l'employeuse à cette date est "Employeuse déclarée"

### Scenario: Un utilisateur sans employeuse

* Given un utilisateur sans employeuse connue
* When je consulte son employeuse au "2026-06-01"
* Then il n'a pas d'employeuse à cette date
