# Fonctionnalité: Choisir sa visibilité sur la cartographie après une rupture de contrat

> Quand la rupture d'un contrat de conseiller numérique est actée, la personne
> disparaît de la cartographie jusqu'à ce qu'elle dise, dans la Coop, si elle
> souhaite y apparaître. Rien dans les données ne permet de trancher à sa place.
> Sa réponse règle sa visibilité et date ce choix : c'est cette date, comparée
> à la dernière rupture, que lit la cartographie. Seuls l'écran et le réglage
> de la visibilité la posent.

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

## Règle: La réponse règle la visibilité sur la cartographie

### Scénario: L'ex-conseiller qui souhaite apparaître reste visible

* Étant donné un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* Et son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Quand il répond qu'il souhaite apparaître
* Alors il est visible sur la cartographie
* Et son choix de visibilité est daté de sa réponse
* Et aucune réponse n'est attendue

### Scénario: L'ex-conseiller qui préfère rester masqué est retiré de la cartographie

* Étant donné un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* Et son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Quand il répond qu'il préfère rester masqué
* Alors il n'est plus visible sur la cartographie
* Et son choix de visibilité est daté de sa réponse
* Et aucune réponse n'est attendue

### Scénario: Souhaiter apparaître rend visible un ex-conseiller qui s'était retiré

* Étant donné un ex-conseiller invisible sur la cartographie, réglé le 15/08/2026
* Et son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Quand il répond qu'il souhaite apparaître
* Alors il est visible sur la cartographie

## Règle: Sans rupture en attente, il n'y a rien à confirmer

### Scénario: Une seconde réponse est refusée

* Étant donné un ex-conseiller visible sur la cartographie, réglé le 15/08/2026
* Et son contrat débuté le 01/01/2025 a été rompu le 01/09/2026
* Et il a répondu qu'il souhaite apparaître
* Quand il répond qu'il préfère rester masqué
* Alors la réponse est refusée car aucune rupture n'est en attente
* Et il est visible sur la cartographie
