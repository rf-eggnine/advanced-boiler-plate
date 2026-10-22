# Advanced Models

The bases the data models of other modules extend. A library module (requires `advanced-core` only), so these
exist before the game system and the ordinary modules load. They are added to `api.data` of the neutral API with
`contribute`, so `api.data.AdvancedSystemDataModel` and `api.data.AdvancedSparseDataModel` are where modules look for
them, as well as `api.modules.require("advanced-models")`.

| Member | Is |
|---|---|
| `AdvancedSystemDataModel` | A type data model that can be built from templates. `Model.mixin(TemplateA, TemplateB)` gives a class with the schema, instance methods and static members of the templates, each of which is itself a model; the schema is merged in order with `mergeSchema`. Hooks reach the templates, each template's own called once: `_cleanData` (Foundry calls it itself while cleaning), `_validateJoint`, `_migrateData`, `_shimData`, `_resetData`. A type with `metadata.singleton` is refused on an actor that already has one (any actor). The fields are initialized in schema order, which is the templates' first, as Foundry 14 asks it at the instance (`_initializationOrder` is not overridden: the static one of Foundry 14 throws). A mixed model is named for what it is made of (`Model.mixin(TemplateA, TemplateB)`), and keeps the `LOCALIZATION_PREFIXES` of every template. `embeddedDescriptionKeyPath` names the text `toEmbed` enriches. |
| `AdvancedSparseDataModel` | A data model whose `toObject(true)` leaves out fields that are `undefined`, at any depth. |

## Using it

```js
const { AdvancedSystemDataModel } = api.data;

class Described extends AdvancedSystemDataModel {
  static defineSchema() { return { description: new HTMLField() }; }
}

class Gadget extends AdvancedSystemDataModel.mixin(Described) {
  static defineSchema() { return this.mergeSchema(super.defineSchema(), { power: new NumberField() }); }
}
```

A module that extends these lists `advanced-models` in its `requires`. Do not rely on the order modules load in: read the
classes when the game initializes (the `init` hook) or later, and build the model classes there.

## The singleton message

`ADVANCED_MODELS.Singleton`, with `{itemType}` and `{actorType}`.
