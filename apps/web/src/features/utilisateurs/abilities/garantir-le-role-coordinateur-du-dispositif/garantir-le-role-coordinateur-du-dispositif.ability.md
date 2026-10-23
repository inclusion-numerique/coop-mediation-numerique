# Feature: Garantir le rôle coordinateur du dispositif

> Le statut de coordinateur conseiller numérique se lit dans main ; la ligne
> coordinateur de la coop, elle, ne se calcule pas : elle porte l'équipe, les
> invitations, les tags et les activités de coordination. La connexion et
> l'inscription la garantissent ; elles ne la retirent jamais.

## Rule: Un coordinateur du dispositif a son rôle coordinateur dans la coop

### Scenario: Le rôle est créé pour un coordinateur du dispositif

* Given un coordinateur du dispositif sans rôle coordinateur dans la coop
* When le rôle coordinateur du dispositif est garanti
* Then le rôle coordinateur est créé

### Scenario: Le rôle n'est pas créé hors du dispositif

* Given une personne hors dispositif sans rôle coordinateur dans la coop
* When le rôle coordinateur du dispositif est garanti
* Then aucun rôle coordinateur n'est créé
