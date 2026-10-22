import { MODULE } from "./module-info.mjs";
const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * @import { AdvancedSystemDataModelMetadata } from "./_types.mjs";
 */

/**
 * Data Model variant with some extra methods to support template mix-ins.
 *
 * In template.json, each Actor or Item type can incorporate several templates which are chunks of data that are
 * common across all the types that use them. One way to represent them in the schema for a given Document type is to
 * duplicate schema definitions for the templates and write them directly into the Data Model for the Document type.
 * This works fine for small templates or systems that do not need many Document types but for more complex systems
 * this boilerplate can become prohibitive.
 *
 * Here we have opted to instead create a separate Data Model for each template available. These define their own
 * schemas which are then mixed-in to the final schema for the Document type's Data Model. A Document type Data Model
 * can define its own schema unique to it, and then add templates in direct correspondence to those in template.json
 * via AdvancedSystemDataModel.mixin.
 *
 * modulize-allow-no-prefixes: this is the base, with no fields of its own (its schema is those of its templates): the templates
 * and the models made from it declare theirs, and `mixin` keeps them all.
 */
export default class AdvancedSystemDataModel extends foundry.abstract.TypeDataModel {

  /**
   * Base templates used for construction.
   * @type {*[]}
   * @private
   */
  static _schemaTemplates = [];

  /* -------------------------------------------- */

  /**
   * A list of properties that should not be mixed-in to the final type.
   * @type {Set<string>}
   * @private
   */
  static _immiscible = new Set(["length", "mixed", "name", "prototype", "cleanData", "_cleanData",
    "validateJoint", "_validateJoint", "migrateData", "_migrateData",
    "shimData", "_shimData", "defineSchema", "resetData", "_resetData", "LOCALIZATION_PREFIXES"]);

  /* -------------------------------------------- */

  /**
   * Metadata that describes this DataModel.
   * @type {SystemDataModelMetadata}
   */
  static metadata = Object.freeze({});

  get metadata() {
    return this.constructor.metadata;
  }

  /* -------------------------------------------- */

  /**
   * Key path to the description used for default embeds.
   * @type {string|null}
   */
  get embeddedDescriptionKeyPath() {
    return null;
  }

  /* -------------------------------------------- */

  /** @concrete */
  static defineSchema() {
    const schema = {};
    for ( const template of this._schemaTemplates ) this.mergeSchema(schema, template.defineSchema());
    return schema;
  }

  /* -------------------------------------------- */

  /**
   * Merge two schema definitions together as well as possible.
   * @param {DataSchema} a  First schema that forms the basis for the merge. *Will be mutated.*
   * @param {DataSchema} b  Second schema that will be merged in, overwriting any non-mergeable properties.
   * @returns {DataSchema}  Fully merged schema.
   */
  static mergeSchema(a, b) {
    Object.assign(a, b);
    return a;
  }

  /* -------------------------------------------- */
  /*  Data Cleaning                               */
  /* -------------------------------------------- */

  /**
   * Clean the data of each template. Foundry calls this hook itself while it cleans the data of a model (after the fields
   * are cleaned), so the model does not override `cleanData` to call it as well: that ran each template's cleaning twice.
   * @param {object} [source]                           The source data
   * @param {object} [options={}]                       Additional options (see DataModel.cleanData)
   * @param {Partial<DataFieldCleaningState>} [_state]  Internal options used during cleaning recursion
   * @inheritDoc
   * @protected
   */
  static _cleanData(source, options, _state) {
    super._cleanData(source, options, _state);
    for ( const template of this._schemaTemplates ) {
      template._cleanData(source, options, _state);
    }
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /**
   * Pre-creation logic for this system data: an item of a type whose metadata says it is a `singleton` is refused on an actor
   * that has one.
   * @param {object} data               The initial data object provided to the document creation request.
   * @param {object} options            Additional options which modify the creation request.
   * @param {User} user                 The User requesting the document creation.
   * @returns {Promise<boolean|void>}   A return value of false indicates the creation operation should be cancelled.
   * @see {Document#_preCreate}
   * @inheritDoc
   * @protected
   */
  async _preCreate(data, options, user) {
    if ( await super._preCreate(data, options, user) === false ) return false;
    const actor = this.parent.actor;
    if ( !actor || !this.metadata?.singleton ) return;
    if ( actor.itemTypes[data.type]?.length ) {
      ui.notifications.error(`${MODULE.loc}.Singleton`, {
        format: {
          itemType: _loc(CONFIG.Item.typeLabels[data.type]),
          actorType: _loc(CONFIG.Actor.typeLabels[actor.type])
        }
      });
      return false;
    }
  }

  /* -------------------------------------------- */
  /*  Data Validation                             */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static validateJoint(data) {
    this._validateJoint(data);
    return super.validateJoint(data);
  }

  /* -------------------------------------------- */

  /**
   * Performs joint validation without calling DataModel.validateJoint.
   * @param {object} data     The source data
   * @throws                  An error if a validation failure is detected
   * @protected
   */
  static _validateJoint(data) {
    for ( const template of this._schemaTemplates ) {
      template._validateJoint(data);
    }
  }

  /* -------------------------------------------- */
  /*  Data Migration                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData(source, options) {
    this._migrateData(source, options);
    return super.migrateData(source, options);
  }

  /* -------------------------------------------- */

  /**
   * Performs migration without calling DataModel.migrateData.
   * @param {object} source     The source data
   * @param {object} [options]  Additional options (see DataModel.migrateData)
   * @protected
   */
  static _migrateData(source, options) {
    for ( const template of this._schemaTemplates ) {
      template._migrateData(source, options);
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static shimData(data, options) {
    this._shimData(data, options);
    return super.shimData(data, options);
  }

  /* -------------------------------------------- */

  /**
   * Performs shimming without calling DataModel.shimData.
   * @param {object} data         The source data
   * @param {object} [options]    Additional options (see DataModel.shimData)
   * @protected
   */
  static _shimData(data, options) {
    for ( const template of this._schemaTemplates ) {
      template._shimData(data, options);
    }
  }

  /* -------------------------------------------- */

  /**
   * Reset user-modified state.
   * @param {object} source  The source data, modified in place.
   * @returns {object}       The cleaned source data.
   */
  static resetData(source) {
    this._resetData(source);
    return source;
  }

  /* -------------------------------------------- */

  /**
   * Reset user-modified state across the type's templates.
   * @param {object} source  The source data, modified in place.
   * @protected
   */
  static _resetData(source) {
    for ( const template of this._schemaTemplates ) {
      template._resetData(source);
    }
  }

  /* -------------------------------------------- */
  /*  Mixins                                      */
  /* -------------------------------------------- */

  /**
   * Mix multiple templates with the base type.
   * @param {...*} templates                    Template classes to mix.
   * @returns {typeof AdvancedSystemDataModel}  Final prepared type.
   */
  static mixin(...templates) {
    for ( const template of templates ) {
      if ( !(template.prototype instanceof AdvancedSystemDataModel) ) {
        throw new Error(`${template.name} is not a subclass of AdvancedSystemDataModel`);
      }
    }

    const Base = class extends this {};
    // Named for what it is made of, since a model that is mixed is the one an error names
    Object.defineProperty(Base, "name", {
      value: `${this.name}.mixin(${templates.map(template => template.name).join(", ")})`,
      configurable: true
    });
    Object.defineProperty(Base, "_schemaTemplates", {
      value: Object.seal([...this._schemaTemplates, ...templates]),
      writable: false,
      configurable: false
    });

    // The prefixes of the templates are all kept, with those of the model this is mixed into: Foundry gives the labels of the
    // fields from the lang keys of each. (A model made from this one that declares its own starts from `super.LOCALIZATION_PREFIXES`.)
    Object.defineProperty(Base, "LOCALIZATION_PREFIXES", {
      value: Object.freeze([...new Set([
        ...(this.LOCALIZATION_PREFIXES ?? []), ...templates.flatMap(template => template.LOCALIZATION_PREFIXES ?? [])
      ])]),
      writable: true,
      configurable: true
    });

    for ( const template of templates ) {
      // Take all static methods and fields from template and mix in to base class
      for ( const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template)) ) {
        if ( this._immiscible.has(key) ) continue;
        Object.defineProperty(Base, key, descriptor);
      }

      // Take all instance methods and fields from template and mix in to base class
      for ( const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template.prototype)) ) {
        if ( ["constructor"].includes(key) ) continue;
        Object.defineProperty(Base.prototype, key, descriptor);
      }
    }

    return Base;
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async toEmbed(config, options={}) {
    const keyPath = this.embeddedDescriptionKeyPath;
    if ( !keyPath || !foundry.utils.hasProperty(this, keyPath) ) return super.toEmbed(config, options);
    const enriched = await TextEditor.enrichHTML(foundry.utils.getProperty(this, keyPath), {
      ...options,
      relativeTo: this.parent
    });
    const container = document.createElement("div");
    container.innerHTML = enriched;
    return container.children;
  }
}
