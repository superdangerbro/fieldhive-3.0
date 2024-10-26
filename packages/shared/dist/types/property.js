"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPriority = exports.JobType = exports.JobStatus = exports.PropertyAccountRole = exports.PropertyType = exports.PropertyStatus = void 0;
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
var PropertyAccountRole;
(function (PropertyAccountRole) {
    PropertyAccountRole["OWNER"] = "owner";
    PropertyAccountRole["MANAGER"] = "manager";
    PropertyAccountRole["TENANT"] = "tenant";
    PropertyAccountRole["CONTRACTOR"] = "contractor";
})(PropertyAccountRole || (exports.PropertyAccountRole = PropertyAccountRole = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["DRAFT"] = "draft";
    JobStatus["SCHEDULED"] = "scheduled";
    JobStatus["IN_PROGRESS"] = "in_progress";
    JobStatus["ON_HOLD"] = "on_hold";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["CANCELLED"] = "cancelled";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var JobType;
(function (JobType) {
    JobType["INSPECTION"] = "inspection";
    JobType["MAINTENANCE"] = "maintenance";
    JobType["INSTALLATION"] = "installation";
    JobType["REPAIR"] = "repair";
    JobType["SURVEY"] = "survey";
    JobType["OTHER"] = "other";
})(JobType || (exports.JobType = JobType = {}));
var JobPriority;
(function (JobPriority) {
    JobPriority["LOW"] = "low";
    JobPriority["MEDIUM"] = "medium";
    JobPriority["HIGH"] = "high";
    JobPriority["URGENT"] = "urgent";
})(JobPriority || (exports.JobPriority = JobPriority = {}));
