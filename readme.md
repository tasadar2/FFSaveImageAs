# FFSaveImageAs

## Prerequisites

The following applications will need to be installed on the system:
* [Node.js](https://nodejs.org)

After checking out the code, the following steps will need to be run in order to build or package the extension:
* Install node packages
    ```
    npm install
    ```

## Build Extension

Run the build npm script to build the extension. This will prepare the `build/` directory with everything needed to pakage the extension.
```
npm run build
```

## Package Extension

Run the package npm script to pacakge the extension in the `dist/` directory.
```
npm run package
```