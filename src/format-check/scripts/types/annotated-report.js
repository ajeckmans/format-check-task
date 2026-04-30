"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotatedReport = void 0;
var format_report_1 = require("./format-report");
/**
 * @class AnnotatedReport
 * Extends FormatReport to include version control information.
 *
 * @extends {FormatReport}
 */
var AnnotatedReport = /** @class */ (function (_super) {
    __extends(AnnotatedReport, _super);
    function AnnotatedReport(commitId, changeType) {
        var _this = _super.call(this) || this;
        _this.commitId = commitId;
        _this.changeType = changeType;
        return _this;
    }
    return AnnotatedReport;
}(format_report_1.FormatReport));
exports.AnnotatedReport = AnnotatedReport;
