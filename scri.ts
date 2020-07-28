import * as fs from "fs";
import * as rimraf from "rimraf";
import { ProcessHelper as ph, scri } from "scriptastic";

scri.task("clean:dist")
    .does(() => {
        rimraf.sync("dist/**/*");
    });

scri.task("clean:build")
    .does(() => {
        rimraf.sync("build/**/*");
    });

scri.task("clean")
    .runs("clean:build")
    .runs("clean:dist");

scri.task("build:background")
    .does(() => {
        ph.executeSync("tsc -p src/background/tsconfig.json");
    });

scri.task("build:content")
    .does(() => {
        ph.executeSync("tsc -p src/content/tsconfig.json");
    });

scri.task("build:manifest")
    .does(() => {
        fs.copyFileSync("src/manifest.json", "build/manifest.json");
    });

scri.task("build:options")
    .does(() => {
        ph.executeSync("tsc -p src/options/tsconfig.json");
        fs.copyFileSync("src/options/options.css", "build/options/options.css");
        fs.copyFileSync("src/options/options.html", "build/options/options.html");
        fs.copyFileSync("src/options/jquery-3.5.1.slim.min.js", "build/options/jquery-3.5.1.slim.min.js");
    });

scri.task("build-only")
    .runs("build:background")
    .runs("build:content")
    .runs("build:options")
    .runs("build:manifest");

scri.task("build")
    .dependsOn("clean")
    .runs("build-only");

scri.task("lint:typescript")
    .does(() => {
        ph.executeSync("eslint src/**/*.ts");
    });

scri.task("lint:extension")
    .does(() => {
        ph.executeSync("web-ext lint");
    });

scri.task("lint-only")
    .runs("lint:typescript")
    .runs("lint:extension");

scri.task("lint")
    .dependsOn("build")
    .runs("lint-only");

scri.task("package:extension")
    .does(() => {
        ph.executeSync("web-ext build");
    });

scri.task("package-only")
    .runs("package:extension");

scri.task("package")
    .dependsOn("clean")
    .dependsOn("build")
    .dependsOn("lint")
    .runs("package-only");
