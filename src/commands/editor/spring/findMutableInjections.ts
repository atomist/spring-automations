import { JavaFileParser } from "@atomist/antlr/tree/ast/antlr/java/JavaFileParser";
import { findMatches } from "@atomist/automation-client/tree/ast/astUtils";
import { JavaSourceFiles } from "../../generator/java/javaProjectUtils";

import { SourceLocation } from "@atomist/automation-client/operations/common/SourceLocation";
import { ReviewComment, Severity } from "@atomist/automation-client/operations/review/ReviewResult";
import { Project } from "@atomist/automation-client/project/Project";

export class MutableInjection implements ReviewComment {

    public severity: Severity = "warn";

    constructor(public name: string, public type: "field" | "setter",
                public sourceLocation: SourceLocation) {
    }

    get comment() {
        return `Improper Spring injection: ${this.type} $ this.name} is injected ` +
            `in file ${this.sourceLocation.path}:${this.sourceLocation.lineFrom1}:${this.sourceLocation.columnFrom1}`;
    }

}

// TODO will eventually use OR predicates - for @Inject
const InjectedFields = `//classBodyDeclaration[//annotation[@value='@Autowired']]
                            //fieldDeclaration//variableDeclaratorId |
                         //classBodyDeclaration[//annotation[@value='@Inject']]
                            //fieldDeclaration//variableDeclaratorId |
                         //classBodyDeclaration[//annotation[@value='@Autowired']]
                            //methodDeclaration//Identifier[1] |
                         //classBodyDeclaration[//annotation[@value='@Inject']]
                            //methodDeclaration//Identifier[1]`;

/**
 * Find all fields or setters annotated with @Autowired or @Inject in the codebase.
 * This is an undesirable usage pattern in application code, although
 * acceptable in tests.
 * @param {Project} p project to search
 * @param {string} globPattern glob pattern, defaults to standard Maven
 * location of source tree.
 */
export function findMutableInjections(p: Project,
                                      globPattern: string = JavaSourceFiles): Promise<MutableInjection[]> {
    return findMatches(p, JavaFileParser, globPattern, InjectedFields)
        .then(fileHits =>
            fileHits.map(m => new MutableInjection(
                m.$value,
                m.$value.startsWith("set") ? "setter" : "field",
                m.sourceLocation)));
}
