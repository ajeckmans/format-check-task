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
exports.FormatReports = exports.FormatReport = void 0;
/**
 * @class FormatReport
 * A class to represent the report of a single file's formatting issues.
 */
var FormatReport = /** @class */ (function () {
    function FormatReport() {
    }
    return FormatReport;
}());
exports.FormatReport = FormatReport;
/**
* @class FormatReports
* An array-like class to hold multiple FormatReport instances.
*
* @extends {Array<FormatReport>}
*/
var FormatReports = /** @class */ (function (_super) {
    __extends(FormatReports, _super);
    function FormatReports() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FormatReports;
}(Array));
exports.FormatReports = FormatReports;
