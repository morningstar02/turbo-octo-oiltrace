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
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var walker = new NoMultiSpacesWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
/**
 * General idea behind this walker. First we locate the indices in the source code where the
 * rule is broken. Once we have them we walk over all the children (and I mean all possible ones)
 * and we keep track of them if their range is within a position where the rule is broken.
 * At the end we should have a map of "targets" (the positions where the rule was broken) to the
 * node that contains it. This node is special because it will have the minimum range containing
 * the target out of the possible nodes that do.
 *
 * To report the failures we simply wait till we reach the last node in our walk and start reporting
 * our findings.
 *
 * Note: This idea took inspiration from eslint:
 *
 *    https://github.com/eslint/eslint/blob/master/lib/rules/no-multi-spaces.js
 */
var NoMultiSpacesWalker = /** @class */ (function (_super) {
    __extends(NoMultiSpacesWalker, _super);
    function NoMultiSpacesWalker(sourceFile, options) {
        var _a;
        var _this = _super.call(this, sourceFile, options) || this;
        _this.EXCEPTION_MAP = (_a = {},
            _a[ts.SyntaxKind.VariableDeclaration] = 'VariableDeclaration',
            _a[ts.SyntaxKind.PropertyAssignment] = 'PropertyAssignment',
            _a[ts.SyntaxKind.BinaryExpression] = 'BinaryExpression',
            _a);
        _this.STRING_TYPES = [
            ts.SyntaxKind.NoSubstitutionTemplateLiteral,
            ts.SyntaxKind.LastTemplateToken,
            ts.SyntaxKind.StringLiteral,
        ];
        _this.exceptions = {};
        _this.targets = [];
        _this.targetNode = {};
        _this.targetIndex = 0;
        var opt = _this.getOptions();
        _this.src = sourceFile.getFullText();
        if (opt.length) {
            _this.exceptions = opt[0].exceptions || {};
        }
        // Some defaults on the exceptions
        if (_this.exceptions.PropertyAssignment === undefined) {
            _this.exceptions.PropertyAssignment = true;
        }
        var pattern = /[^\n\r\u2028\u2029\t ].? {2,}/g;
        while (pattern.test(_this.src)) {
            _this.targets.push(pattern.lastIndex);
            _this.targetNode[pattern.lastIndex] = sourceFile;
        }
        // TODO: How do we know that we do have the last token?
        _this.lastNode = sourceFile.getLastToken();
        return _this;
    }
    NoMultiSpacesWalker.prototype.walkChildren = function (node) {
        var _this = this;
        var range = [node.getStart(), node.getEnd()];
        for (var i = this.targetIndex, len = this.targets.length, target = void 0; i < len; i++) {
            target = this.targets[i];
            if (this.inRange(target, range)) {
                // Store the node with the smallest range containing
                // the target (the index where the multi-space occurs)
                this.targetNode[target] = node;
            }
            if (range[0] > this.targets[this.targetIndex]) {
                // No need to keep checking the low indices since the nodes have passed them.
                this.targetIndex++;
            }
        }
        if (node === this.lastNode) {
            // Time to display the warnings
            this.targets.forEach(function (target) {
                var valid = _this.targetNode[target];
                if (target === valid.getStart()) {
                    _this.warn(valid.getText(), target, valid);
                }
                else if (target === valid.getEnd() - 1 && _this.STRING_TYPES.indexOf(valid.kind) === -1) {
                    var endChar = _this.src.substring(target, valid.getEnd());
                    _this.warn(endChar, target, valid);
                }
                else {
                    if (_this.src.charAt(target) !== '\n' && valid.kind !== ts.SyntaxKind.SourceFile) {
                        // trailing spaces are considered multiple spaces: no-trailing-whitespaces handles it
                        // If the node containing the multispace is the whole document then it must be either
                        // in a comment or a string. Uncomment the next line to see what we may have missed:
                        // console.log(target, ':', [valid.getStart(), valid.getEnd()], [valid.getText(), valid.kind]]);
                    }
                }
            });
        }
        // Somehow super.walkChildren(node) does not visit all the node children, doing manually.
        var children = node.getChildren();
        for (var index in children) {
            if (children) {
                this.visitNode(children[index]);
            }
        }
    };
    NoMultiSpacesWalker.prototype.inRange = function (x, range) {
        return x >= range[0] && x <= range[1];
    };
    NoMultiSpacesWalker.prototype.warn = function (value, pos, node) {
        var msg = "Multiple spaces found before '" + value + "'.";
        var exceptionName = this.EXCEPTION_MAP[node.parent.kind];
        var report = true;
        var start = node.getFullStart() - 1;
        var previousChar = this.src.substring(start, start + 1);
        if (exceptionName && this.exceptions[exceptionName]) {
            // Should only report if it follows a comma
            if (previousChar !== ',') {
                report = false;
            }
        }
        // Sneaky property assignments may have many nested children. Lets check if one of
        // the parents is one of those.
        if (previousChar === ':') {
            var crt = node.parent;
            while (crt.kind !== ts.SyntaxKind.SourceFile) {
                crt = crt.parent;
                if (crt.kind === ts.SyntaxKind.PropertyAssignment) {
                    if (this.exceptions.PropertyAssignment) {
                        report = false;
                    }
                    break;
                }
            }
        }
        if (report) {
            var fix = Lint.Replacement.replaceFromTo(start + 1, pos, ' ');
            this.addFailureAt(pos, value.length, msg, fix);
        }
    };
    return NoMultiSpacesWalker;
}(Lint.RuleWalker));
