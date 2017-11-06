import { LocalProject } from "@atomist/automation-client/project/local/LocalProject";
import { ActionResult } from "@atomist/automation-client/action/ActionResult";
import { ChildProcess } from "child_process";

export interface ProgressLog {
    write(what: string): void;
}

export const DevNullProgressLog: ProgressLog = {
    write(what: string) {}
};

export interface Deployment {

    childProcess: ChildProcess;
    url: string;
}

export interface CloudFoundryInfo {

    api: string;
    username: string;
    password: string;
    space: string;
    org: string;

}


/**
 * Info to send up for a cloud foundry deployment
 */
export interface AppInfo {

    name: string;
    version: string;
}

export const PivotalWebServices = { //: Partial<CloudFoundryInfo> = {

    api: "https://api.run.pivotal.io",
};

// TODO maybe don't need this
export interface DeploymentChain {

    build<P extends LocalProject>(p: P): Promise<ActionResult<P>>;

    deploy<P extends LocalProject>(p: P): Promise<Deployment>;

}