# Feature: Choisir sa visibilité sur la cartographie après une rupture de contrat

> Quand la rupture d'un contrat de conseiller numérique est actée, la personne
> disparaît de la cartographie jusqu'à ce qu'elle dise, dans la Coop, si elle
> souhaite y apparaître. Rien dans les données ne permet de trancher à sa place.
> Sa réponse règle sa visibilité et date ce choix : c'est cette date, comparée
> à la dernière rupture, que lit la cartographie. Seuls l'écran et le réglage
> de la visibilité la posent.

## Rule: Une réponse est attendue après une rupture passée, sans contrat actif, tant que la visibilité n'a pas été choisie depuis

### Scenario: L'ex-conseiller dont la rupture est actée doit répondre

* Given un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* And son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Then une réponse sur sa visibilité est attendue

### Scenario: L'ex-conseiller qui s'était déjà retiré de la cartographie doit aussi répondre

* Given un ex-conseiller invisible sur la cartographie, réglé le 15/08/2026
* And son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Then une réponse sur sa visibilité est attendue

### Scenario: L'ex-conseiller qui n'a jamais réglé sa visibilité doit répondre

* Given un ex-conseiller visible sur la cartographie, sans réglage de visibilité
* And son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Then une réponse sur sa visibilité est attendue

### Scenario: La rupture d'un ancien contrat ne concerne pas un conseiller réembauché

* Given un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* And son contrat débuté le 01/01/2024 a été rompu le 01/09/2026
* And un nouveau contrat a débuté le 10/09/2026
* Then aucune réponse n'est attendue

### Scenario: Un contrat qui n'a pas encore commencé ne dispense pas de répondre

* Given un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* And son contrat débuté le 01/01/2024 a été rompu le 01/09/2026
* And un nouveau contrat débutera le 01/12/2099
* Then une réponse sur sa visibilité est attendue

### Scenario: Une rupture à venir n'appelle pas encore de réponse

* Given un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* And son contrat débuté le 01/01/2025 sera rompu le 01/12/2099
* Then aucune réponse n'est attendue

## Rule: La réponse règle la visibilité sur la cartographie

### Scenario: L'ex-conseiller qui souhaite apparaître reste visible

* Given un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* And son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* When il répond qu'il souhaite apparaître
* Then il est visible sur la cartographie
* And son choix de visibilité est daté de sa réponse
* And aucune réponse n'est attendue

### Scenario: L'ex-conseiller qui préfère rester masqué est retiré de la cartographie

* Given un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* And son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* When il répond qu'il préfère rester masqué
* Then il n'est plus visible sur la cartographie
* And son choix de visibilité est daté de sa réponse
* And aucune réponse n'est attendue

### Scenario: Souhaiter apparaître rend visible un ex-conseiller qui s'était retiré

* Given un ex-conseiller invisible sur la cartographie, réglé le 15/08/2026
* And son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* When il répond qu'il souhaite apparaître
* Then il est visible sur la cartographie

## Rule: Sans rupture en attente, il n'y a rien à confirmer

### Scenario: Une seconde réponse est refusée

* Given un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* And son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* And il a répondu qu'il souhaite apparaître
* When il répond qu'il préfère rester masqué
* Then la réponse est refusée car aucune rupture n'est en attente
* And il est visible sur la cartographie
