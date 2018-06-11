import { MatchingLogic } from "@atomist/microgrammar/Matchers";
import { PatternMatch } from "@atomist/microgrammar/PatternMatch";
import { PathAwareXmlMatchingMachine } from "../../support/xml/PathAwareXmlMatchingMachine";
import { XML_TAG_WITH_SIMPLE_VALUE, XmlTag } from "../../support/xml/xmlGrammars";
import { VersionedArtifactMatch } from "./VersionedArtifactMatch";

/**
 * Single use matching machine that looks for dependencies,
 * avoid dependency management section.
 */
export class DependencyFinder extends PathAwareXmlMatchingMachine {

    public dependencies: VersionedArtifactMatch[] = [];
    public offset: number;

    // Dependency we are building
    private group: PatternMatch & XmlTag;
    private artifact: PatternMatch & XmlTag;
    private version: PatternMatch & XmlTag;

    private dependenciesStartOffset;

    constructor() {
        super(XML_TAG_WITH_SIMPLE_VALUE);
    }

    protected onMatch(pm: PatternMatch & XmlTag): MatchingLogic {
        // We matched our designed matcher
        if (this.pathElements().indexOf("dependencies") > -1 &&
            this.isPureDependencies()) {
            // We're building a dependency
            switch (pm.name) {
                case "groupId":
                    this.group = pm;
                    break;
                case "artifactId":
                    this.artifact = pm;
                    break;
                case "version":
                    this.version = pm;
                    break;
                default:
            }
        }
        return this.matcher;
    }

    protected onOpenTag(tag: { name: string } & PatternMatch): void {
        switch (tag.name) {
            case "dependency" :
                this.dependenciesStartOffset = tag.$offset;
                break;
        }
    }

    protected onCloseTag(tag: { name: string } & PatternMatch): void {
        switch (tag.name) {
            case "dependency" :
                if (this.group && this.artifact) {
                    const va = new VersionedArtifactMatch(
                        this.group,
                        this.artifact,
                        this.version,
                        this.dependenciesStartOffset,
                        tag.$offset + tag.$matched.length);
                    this.dependencies.push(va);
                }
                this.group = this.artifact = this.version = this.dependenciesStartOffset = undefined;
                break;
            case "dependencies" :
                if (this.isPureDependencies() && this.offset === undefined) {
                    this.offset = tag.$offset;
                }
                break;
        }
    }

    /**
     * Are we in the dependencies block, not the dependencies block of something else
     * @return {boolean}
     */
    private isPureDependencies(): boolean {
        return !this.underOneOf("dependencyManagement", "plugin", "pluginManagement", "exclusions");
    }
}