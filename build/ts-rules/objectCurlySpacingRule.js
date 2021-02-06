"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Lint = require("tslint");
var ts = require("typescript");
var OPTION_ALWAYS = 'always';
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var walker = new ObjectCurlySpacingWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    Rule.FAILURE_STRING = {
        always: {
            end: "A space is required before '}'",
            start: "A space is required after '{'"
        },
        never: {
            end: "There should be no space before '}'",
            start: "There should be no space after '{'"
        }
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ObjectCurlySpacingWalker = /** @class */ (function (_super) {
    __extends(ObjectCurlySpacingWalker, _super);
    function ObjectCurlySpacingWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.always = _this.hasOption(OPTION_ALWAYS) || (_this.getOptions() && _this.getOptions().length === 0);
        var opt = _this.getOptions();
        _this.exceptions = opt[1] || {};
        if (_this.exceptions.arraysInObjects === undefined) {
            _this.exceptions.arraysInObjects = _this.always;
        }
        if (_this.exceptions.objectsInObjects === undefined) {
            _this.exceptions.objectsInObjects = _this.always;
        }
        return _this;
    }
    ObjectCurlySpacingWalker.prototype.visitNode = function (node) {
        var bracedKind = [
            ts.SyntaxKind.ObjectLiteralExpression,
            ts.SyntaxKind.ObjectBindingPattern,
            ts.SyntaxKind.NamedImports,
            ts.SyntaxKind.NamedExports,
        ];
        if (bracedKind.indexOf(node.kind) > -1) {
            this.checkSpacingInsideBraces(node);
        }
        _super.prototype.visitNode.call(this, node);
    };
    ObjectCurlySpacingWalker.prototype.checkSpacingInsideBraces = function (node) {
        var text = node.getText();
        if (text.indexOf('\n') !== -1 || /^{\s*}$/.test(text)) {
            // Rule does not apply when the braces span multiple lines
            return;
        }
        // Lookup whether the last value in the object is an object or array literal
        var endsWithObjectLiteral = false;
        var endsWithArrayLiteral = false;
        if (node.getChildren().length === 3) {
            var contents = node.getChildren()[1].getChildren();
            if (contents.length > 0) {
                var lastElement = contents[contents.length - 1];
                if (lastElement.kind === ts.SyntaxKind.PropertyAssignment
                    || lastElement.kind === ts.SyntaxKind.BindingElement) {
                    var value = lastElement.getChildren();
                    if (value.length === 3) {
                        endsWithObjectLiteral =
                            value[2].kind === ts.SyntaxKind.ObjectLiteralExpression
                                || value[2].kind === ts.SyntaxKind.ObjectBindingPattern;
                        endsWithArrayLiteral = value[2].kind === ts.SyntaxKind.ArrayLiteralExpression;
                    }
                }
            }
        }
        // We have matching braces, lets find out number of leading spaces
        var leadingSpace = text.match(/^{(\s{0,2})/)[1].length;
        if (this.always) {
            if (leadingSpace === 0) {
                var fix = Lint.Replacement.appendText(node.getStart() + 1, ' ');
                this.addFailureAt(node.getStart(), 1, Rule.FAILURE_STRING.always.start, fix);
            }
        }
        else {
            if (leadingSpace > 0) {
                var fix = Lint.Replacement.deleteText(node.getStart() + 1, leadingSpace);
                this.addFailureAt(node.getStart(), 1, Rule.FAILURE_STRING.never.start, fix);
            }
        }
        // Finding trailing spaces requires checking if exceptions apply, and adjusting accordingly
        var trailingSpace = text.match(/(\s{0,2})}$/)[1].length;
        var arrayExceptionApplies = this.always !== this.exceptions.arraysInObjects && endsWithArrayLiteral;
        var objectExceptionApplies = this.always !== this.exceptions.objectsInObjects && endsWithObjectLiteral;
        var spaceRequired = arrayExceptionApplies || objectExceptionApplies ? !this.always : this.always;
        if (spaceRequired) {
            if (trailingSpace === 0) {
                var fix = Lint.Replacement.appendText(node.getEnd() - 1, ' ');
                this.addFailureAt(node.getEnd() - 1, 1, Rule.FAILURE_STRING.always.end, fix);
            }
        }
        else {
            if (trailingSpace > 0) {
                var fix = Lint.Replacement.deleteText(node.getEnd() - trailingSpace - 1, trailingSpace);
                this.addFailureAt(node.getEnd() - 1, 1, Rule.FAILURE_STRING.never.end, fix);
            }
        }
    };
    return ObjectCurlySpacingWalker;
}(Lint.RuleWalker));
