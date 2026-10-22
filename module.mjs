import { publish, api } from "./api.mjs";
import AdvancedSystemDataModel from "./advanced-system-data-model.mjs";
import AdvancedSparseDataModel from "./advanced-sparse-data-model.mjs";

/**
 * The bases the data models of the other Advanced modules extend, added to `api.data` of the Advanced API.
 *
 * - `AdvancedSystemDataModel`: a type data model that can be built from templates. `Model.mixin(TemplateA, TemplateB)`
 *   gives a class that has the schema, methods and static members of the templates, each of which is itself a data
 *   model; the schema is merged with `mergeSchema`. It also has hooks to clean, validate jointly, migrate, shim and
 *   reset the data of a model and of its templates.
 * - `AdvancedSparseDataModel`: a data model whose `toObject(true)` leaves out the fields that are `undefined`.
 *
 */
api.moduleProvides("data", { AdvancedSystemDataModel, AdvancedSparseDataModel });

publish({ AdvancedSystemDataModel, AdvancedSparseDataModel });
