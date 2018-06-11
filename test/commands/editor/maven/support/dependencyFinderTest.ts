import { Microgrammar } from "@atomist/microgrammar/Microgrammar";
import * as assert from "power-assert";
import { DependencyFinder } from "../../../../../src/commands/editor/maven/support/DependencyFinder";
import { XmlTag } from "../../../../../src/commands/editor/support/xml/xmlGrammars";
import { springBootPom } from "../../../reviewer/maven/Poms";

describe("DependencyFinder", () => {

    it("should find no dependencies in invalid pom", () => {
        const invalidPom = "this ain't no pom";
        const df = new DependencyFinder();
        df.consume(invalidPom);
        assert(df.dependencies.length === 0);
    });

    it("should find dependencies in valid pom", () => {
        const df = new DependencyFinder();
        df.consume(springBootPom("1.5.9.RELEASE"));
        assert(df.dependencies.length > 0);
    });

    it("should keep offset of group in valid pom", () => {
        const df = new DependencyFinder();
        df.consume(springBootPom("1.5.9.RELEASE"));
        assert(df.dependencies.length > 0);
        assert(df.offset > 0);
    });

    it("should find and change group", () => {
        const oldGroup = "com.krakow";
        const newGroup = "com.moscow";
        const df = new DependencyFinder();
        df.consume(springBootPom("1.5.9.RELEASE"));
        const its = df.dependencies.filter(d => d.group === oldGroup);
        assert(its.length === 1);
        const it = Microgrammar.updatableMatch<XmlTag>(its[0].groupMatch, springBootPom("1.5.9.RELEASE"));
        it.value = newGroup;
        const updatedPom = it.newContent();
        assert(updatedPom.indexOf(newGroup) !== -1);
    });
});