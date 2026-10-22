# Advanced Boiler Plate

The bases the data models of other modules extend. A library module (requires `aaaadvanced-core` only), so these
exist before the game system and the ordinary modules load. They are added to `api.data` of the neutral API with
`moduleProvides`, so `api.data.AdvancedSystemDataModel` and `api.data.AdvancedSparseDataModel` are where modules look for
them, as well as `api.modules.require("advanced-boiler-plate")`.

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

A module that extends these lists `advanced-boiler-plate` in its `requires`. Do not rely on the order modules load in: read the
classes when the game initializes (the `init` hook) or later, and build the model classes there.

## The singleton message

`ADVANCED_BOILER_PLATE.Singleton`, with `{itemType}` and `{actorType}`.

## Derived from the dnd5e system

`advanced-system-data-model.mjs` and `advanced-sparse-data-model.mjs` are derived from
[`module/data/abstract/system-data-model.mjs`](https://github.com/foundryvtt/dnd5e/blob/3100ca51e89fc8d7ed341d8981083556a9e4d4bf/module/data/abstract/system-data-model.mjs)
and [`module/data/abstract/sparse-data-model.mjs`](https://github.com/foundryvtt/dnd5e/blob/3100ca51e89fc8d7ed341d8981083556a9e4d4bf/module/data/abstract/sparse-data-model.mjs)
of the [dnd5e system](https://github.com/foundryvtt/dnd5e) for Foundry Virtual Tabletop, at commit
`3100ca51e89fc8d7ed341d8981083556a9e4d4bf`. dnd5e is copyright 2021 Andrew Clayton and dnd5e contributors, under the MIT
license. They are modified here to be used from a module without conflicting with the class names of the dnd5e system.

The history of the two files is kept, with its authors. It was filtered to those files, so the commit hashes are not
dnd5e's. This is not an official dnd5e package and is not endorsed by its authors.

## License and authors

MIT, see `LICENSE`. The copyright is dnd5e's (Andrew Clayton and dnd5e contributors) for what is derived from it, and RF's for
the rest. Licenses and copyright for each file are recorded for [REUSE](https://reuse.software) in `REUSE.toml` and
`LICENSES/`.

Written by RF, with Volta Fourteen (Claude Sonnet, AI).
