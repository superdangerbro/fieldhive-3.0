"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyType = exports.PropertyStatus = void 0;
var PropertyStatus;
(function (PropertyStatus) {
    PropertyStatus["ACTIVE"] = "active";
    PropertyStatus["INACTIVE"] = "inactive";
    PropertyStatus["ARCHIVED"] = "archived";
})(PropertyStatus || (exports.PropertyStatus = PropertyStatus = {}));
var PropertyType;
(function (PropertyType) {
    PropertyType["RESIDENTIAL"] = "residential";
    PropertyType["COMMERCIAL"] = "commercial";
    PropertyType["INDUSTRIAL"] = "industrial";
    PropertyType["AGRICULTURAL"] = "agricultural";
    PropertyType["MIXED_USE"] = "mixed_use";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
//# sourceMappingURL=property.js.map