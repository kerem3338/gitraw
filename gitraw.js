#!/usr/bin/env node
import { Command, program } from 'commander';
import packageDetails from "./package.json" with { type: "json" };

class Result {
    status;
    content;

    constructor(status, content) {
        this.status = status;
        this.content = content;
    }

    static success(content) {
        return new Result(true, content);
    }

    static error(content) {
        return new Result(false, content);
    }
}

class Handler {
    name = "unknown";

    constructor(URI) {
        this.URI = URI;
    }

    getRawURL() {
        return this.URI;
    }
}

class GithubHandler extends Handler {
    name = "github";
    allowedProtocols = ["https://", "http://", "git://"];

    patternMatch() {
        try {
            const url = new URL(this.URI);

            return this.allowedProtocols.includes(url.protocol.replace(/:$/, "") + "://")
                && url.hostname === "github.com";
        } catch {
            return false;
        }
    }

    getProtocol() {
        var search = this.URI.split("://");
        if (search.length < 2) return undefined;

        return this.allowedProtocols.find((protocol) =>
            this.URI.startsWith(protocol)
        );
    }

    formatOutputURL(author, repo, branch, filepath) {
        return `https://raw.githubusercontent.com/${author}/${repo}/refs/heads/${branch}/${filepath}`;
    }

    getDetailsFromURL() {
        var details = {
            protocol: undefined,
            author: undefined,
            repo: undefined,
            branch: undefined,
            filepath: undefined
        };

        if (!this.patternMatch()) return details;

        var protocol = this.getProtocol();
        var URI = this.URI.substring(protocol.length);

        var parts = URI.split("/");

        if (parts.length < 5) return details;

        details.protocol = protocol;
        details.author = parts[1];
        details.repo = parts[2];
        details.branch = parts[4];
        details.filepath = parts.slice(5).join("/");

        return details;
    }

    getRawURL() {
        if (!this.patternMatch()) {
            return null;
        }

        var details = this.getDetailsFromURL();

        if (!details.author || !details.repo || !details.branch || !details.filepath) {
            return null;
        }

        return this.formatOutputURL(
            details.author,
            details.repo,
            details.branch,
            details.filepath
        );
    }
}


function getRawURL(URI) {
    const handlers = [
        new GithubHandler(URI)
    ];

    for (const handler of handlers) {
        if (handler.patternMatch()) {
            const result = handler.getRawURL();

            if (!result) {
                return Result.error(`Invalid ${handler.name} URL`);
            }

            return Result.success(result);
        }
    }

    return Result.error("Unsupported URL provider.");
}

function main() {
    program
        .name("gitraw")
        .description("A tool for converting Git repository URLs into direct raw file links.")
        .version(packageDetails.version);

    program
        .argument("<URI>", "GitHub repository file URL")
        .action((URI) => {
            var result = getRawURL(URI);
            if (result.status == false) {
            	console.log(result.content);
            	process.exit(1);
            }

            console.log(result.content);
        });

    program.parse();
}

main();