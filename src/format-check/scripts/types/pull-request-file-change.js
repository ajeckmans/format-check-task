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
exports.PullRequestFileChanges = exports.PullRequestFileChange = void 0;
/**
 * @class PullRequestFileChange
 * A class to represent individual file changes within a Pull Request.
 */
var PullRequestFileChange = /** @class */ (function () {
    function PullRequestFileChange(FilePath, CommitId, changeType, lineChanges) {
        if (lineChanges === void 0) { lineChanges = []; }
        this.FilePath = FilePath;
        this.CommitId = CommitId;
        this.changeType = changeType;
        this.lineChanges = lineChanges;
    }
    return PullRequestFileChange;
}());
exports.PullRequestFileChange = PullRequestFileChange;
/**
 * @class PullRequestFileChanges
 * An array-like class to hold multiple PullRequestFileChange instances.
 *
 * @extends {Array<PullRequestFileChange>}
 */
var PullRequestFileChanges = /** @class */ (function (_super) {
    __extends(PullRequestFileChanges, _super);
    function PullRequestFileChanges() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PullRequestFileChanges;
}(Array));
exports.PullRequestFileChanges = PullRequestFileChanges;
