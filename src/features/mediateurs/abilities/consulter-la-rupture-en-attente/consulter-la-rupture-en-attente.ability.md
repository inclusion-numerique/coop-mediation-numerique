# Fonctionnalité: Savoir si une réponse sur la visibilité est attendue après une rupture de contrat

> Quand la rupture d'un contrat de conseiller numérique est actée, la Coop
> demande à la personne si elle souhaite apparaître sur la cartographie. La
> question n'est posée qu'après une rupture passée, quand aucun contrat
> n'est actif et que la visibilité n'a pas été choisie depuis cette rupture.

## Règle: Une réponse est attendue après une rupture passée, sans contrat actif, tant que la visibilité n'a pas été choisie depuis

### Scénario: L'ex-conseiller dont la rupture est actée doit répondre

* Étant donné un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* Et son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Alors une réponse sur sa visibilité est attendue

### Scénario: L'ex-conseiller qui s'était déjà retiré de la cartographie doit aussi répondre

* Étant donné un ex-conseiller invisible sur la cartographie, réglé le 15/08/2026
* Et son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Alors une réponse sur sa visibilité est attendue

### Scénario: L'ex-conseiller qui n'a jamais réglé sa visibilité doit répondre

* Étant donné un ex-conseiller visible sur la cartographie, sans réglage de visibilité
* Et son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Alors une réponse sur sa visibilité est attendue

### Scénario: La rupture d'un ancien contrat ne concerne pas un conseiller réembauché

* Étant donné un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* Et son contrat débuté le 01/01/2024 a été rompu le 01/09/2026
* Et un nouveau contrat a débuté le 10/09/2026
* Alors aucune réponse n'est attendue

### Scénario: Un contrat qui n'a pas encore commencé ne dispense pas de répondre

* Étant donné un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* Et son contrat débuté le 01/01/2024 a été rompu le 01/09/2026
* Et un nouveau contrat débutera le 01/12/2099
* Alors une réponse sur sa visibilité est attendue

### Scénario: Une rupture à venir n'appelle pas encore de réponse

* Étant donné un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* Et son contrat débuté le 01/01/2025 sera rompu le 01/12/2099
* Alors aucune réponse n'est attendue
