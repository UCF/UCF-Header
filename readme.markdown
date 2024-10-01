# University Header
**Visit https://universityheader.ucf.edu for usage instructions and guidelines.**  Instructions below are for working with the header's source code.

----------

## Installation
1. Clone this repository and place it in a web-accessible location.
2. If this is a first-time install, copy `config.templ.conf`, update config values as necessary for your environment, and save as `config.conf`.
3. `cd` to the `src/` subdirectory, and run `./compile.sh`
5. Load `index.html` (in repo's root directory) in your browser; make sure all assets are loaded in correctly.
6. Repeat Step 3 after all subsequent deployments.


## Development

### Requirements
- node v16+
- gulp-cli

### Instructions
1. Follow all [installation steps](#installation) outlined above.
2. If you'd like to enable [BrowserSync](https://browsersync.io) for local development, or make other changes to this project's default gulp configuration, copy `gulp-config.template.json`, make any desired changes, and save as `gulp-config.json`.

    To enable BrowserSync, set `sync` to `true` and adjust your `syncTarget` value as necessary for your local host setup.

    The full list of modifiable config values can be viewed in `gulpfile.js` (see `config` variable).
4. Make changes as desired to files in `src/scss/` or to `src/js/bar.js`.  Image assets should be added/adjusted as needed directly in `bar/img/`.

    **Do not make changes to `src/js/university-header.js`, `src/js/university-header-full.js`, or files in `bar/css/` directly.**
3. Run `gulp default` to process assets.  This task will also run `src/compile.sh` for convenience.
4. Run `gulp watch` to continuously watch changes to scss and js files.  If you enabled BrowserSync in `gulp-config.json`, it will also reload your browser when scss or js files change.  `gulp watch` will also run `src/compile.sh` for convenience.
5. Review your changes against `index.html`.

### CI Instructions
1. Set environment variables found in the `config.templ.conf` file. For a GitHub workflow, these can be added as repository variables, and then added to the `env` variable of the workflow.
2. The `prebuild` and `build` scripts need to be run to build the project. These are dependent and can be run in series, `npm run prebuild && npm run build`.
3. The output of the build will write to the `bar/` directory. This is the directory is what can be deployed.

## Contributing
Want to submit a bug report or feature request?  Check out our [contributing guidelines](https://github.com/UCF/UCF-Header/blob/master/CONTRIBUTING.md) for more information.  We'd love to hear from you!
