"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldStatus = exports.FieldType = void 0;
var FieldType;
(function (FieldType) {
    FieldType["AGRICULTURAL"] = "agricultural";
    FieldType["INDUSTRIAL"] = "industrial";
    FieldType["COMMERCIAL"] = "commercial";
    FieldType["RESIDENTIAL"] = "residential";
    FieldType["CONSERVATION"] = "conservation";
})(FieldType || (exports.FieldType = FieldType = {}));
var FieldStatus;
(function (FieldStatus) {
    FieldStatus["ACTIVE"] = "active";
    FieldStatus["INACTIVE"] = "inactive";
    FieldStatus["MAINTENANCE"] = "maintenance";
    FieldStatus["MONITORING"] = "monitoring";
})(FieldStatus || (exports.FieldStatus = FieldStatus = {}));
//# sourceMappingURL=field.js.map