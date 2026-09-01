# Feature: Effacer l'empreinte RDV Service Public d'un compte

## Rule: Les rendez-vous partent avec le compte agent

> Ils ne peuvent pas rester : la base interdit de supprimer un compte agent dont
> des rendez-vous dépendent. Et les conserver garderait leurs participations,
> donc aucun usager ne serait jamais orphelin — l'effacement se viderait de sa
> substance. Les comptes rendus qui référençaient ces rendez-vous survivent, la
> base mettant leur lien à nul d'elle-même.

### Scenario: Le compte agent et ses rendez-vous sont effacés

* Given un compte RDV avec un rendez-vous et un usager
* When j'efface l'empreinte RDV de ce compte
* Then le compte RDV est délié
* And l'effacement RDV porte sur 1 rendez-vous
* And le compte RDV n'est plus en base
* And le rendez-vous n'est plus en base

## Rule: Un usager n'est supprimé que s'il ne sert plus à personne

> 565 usagers servent de deux à quatre médiateurs. Supprimer parce qu'un seul
> s'en va dépouillerait ses collègues.

### Scenario: Un usager que plus rien ne rattache est supprimé

* Given un compte RDV avec un rendez-vous et un usager
* When j'efface l'empreinte RDV de ce compte
* Then l'effacement RDV supprime 1 usager

### Scenario: Un usager encore rattaché à un bénéficiaire est conservé

* Given un compte RDV avec un rendez-vous et un usager
* And cet usager est rattaché au bénéficiaire d'un autre médiateur
* When j'efface l'empreinte RDV de ce compte
* Then l'effacement RDV supprime 0 usager
* And l'usager RDV est toujours en base

## Rule: Rejouer l'effacement ne fait rien de plus

### Scenario: Un second effacement ne trouve plus de compte

* Given un compte RDV avec un rendez-vous et un usager
* When j'efface l'empreinte RDV de ce compte
* And j'efface à nouveau l'empreinte RDV de ce compte
* Then le compte RDV n'est pas délié
