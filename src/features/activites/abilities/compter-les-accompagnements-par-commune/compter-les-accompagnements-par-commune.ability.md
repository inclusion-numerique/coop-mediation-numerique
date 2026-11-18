# Feature: Compter les accompagnements par commune

> La commune où ont eu lieu les accompagnements : celle du lieu d'activité,
> sinon celle saisie pour l'activité. La plus fréquente en premier.

## Rule: La commune du lieu prime sur celle saisie pour l'activité

### Scenario: Des accompagnements au lieu, à domicile et à distance

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | anonymes | lieu          | typeLieu  | communeDuLieu     |
  | 2026-03-03 | collectif  | 3        | Espace Lumière |           |                   |
  | 2026-03-05 | individuel | 1        |               | Domicile  | Thuir 66300 66210 |
  | 2026-03-07 | individuel | 1        |               | ADistance |                   |
* When je compte les accompagnements de "Ada Lovelace" par commune
* Then les communes comptées sont "Lyon · 69001 3, Thuir · 66300 1, Non communiquée 1"
