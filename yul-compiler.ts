const path = require('path');
const fs = require('fs');
const YAML = require('yaml');


// =================== READ CONFIGS ========================================


export function readYamlConfig(path: string) {
    const loadedConfig = fs.readFileSync(path, 'utf8');
    return YAML.parse(loadedConfig)
    // console.log(COMPILER_CONFIG)
}

/**
 * Defines a Yul ignore file to optimize the process and ignore the unnecessary folders
 * */

export function loadYulIgnore(path: string) {
    const contents = fs.readFileSync(path, 'utf-8');
    return contents.split(/\r?\n/);

}

// ================= READ FILE METADATA =================================================

/**
 * input :  contracts, pure_yul_constructor.yul
 * output: ['pure_yul_constructor','contracts\\exercises\\Calls\\5\\pure_yul_constructor.yul']
 *
 * Given a location to start, search all the files matching the filer and return the name and the relative path
 *
 **/
export function getAllYulFiles(startPath: string, filter: string, COMPILER_CONFIG: any, YUL_IGNORE_FILES: any): any {
    const found = [];
    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory() && (!YUL_IGNORE_FILES || YUL_IGNORE_FILES && !YUL_IGNORE_FILES?.includes(filename))) {
            found.push(...getAllYulFiles(filename, filter, COMPILER_CONFIG, YUL_IGNORE_FILES));
        } else if (filename.endsWith(filter)) {
            if (files[i].split(".")[0]) {
                found.push([files[i].split(".")[0], filename]);
            }
        }
    }

    return found;
}

/**
 * return the file metadata which will be helpful for yul compilation
 * */
export function findAFile(startPath: string, name: string, extension: string, COMPILER_CONFIG: any, YUL_IGNORE_FILES: any) {
    return getAllYulFiles(startPath, name + "." + extension, COMPILER_CONFIG, YUL_IGNORE_FILES)

}

// ===========================================================================================
/**
 * Given a path and a name, the compiled output of the global yul object will be written to the
 * %arg1%\..\artifact\%arg2%\%arg2%.yaml
 * arg1 - path (convention used here)
 * arg2 - name of the file (convention used here)
 *
 * */
export function compileASingleFileToBinaryCode(name: string, path: string, savePath: string) {
    // console.log('cmd /c C:\\addToPath\\yul_pure_compile.bat ' + path + ' ' + name + ' ' + savePath + '\\' + name);
    require('child_process').exec('cmd /c C:\\addToPath\\yul_pure_compile.bat ' + path + ' ' + name + ' ' + savePath + '\\' + name,
        (error: any) => {

            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
}


/**
 * Given the root compile all the .yul files
 * */
export function compileAll(startPath: any, extension: any, COMPILER_CONFIG: any, YUL_IGNORE_FILES: any) {
    const outputFiles = getAllYulFiles(startPath, extension, COMPILER_CONFIG, YUL_IGNORE_FILES);
    // console.log(outputFiles)

    for (let i = 0; i < outputFiles.length; i++) {
        compileASingleFileToBinaryCode(outputFiles[i][0], outputFiles[i][1], COMPILER_CONFIG?.savePath);
    }
}


/**
 * given a file name and an extension a file is compiled
 *
 * */
export function compileSelected(startPath: string, filename: string, extension: string, COMPILER_CONFIG: any, YUL_IGNORE_FILES: any) {
    const outputFile = findAFile(startPath, filename, extension, COMPILER_CONFIG, YUL_IGNORE_FILES)
     // console.log(outputFile)
    if (outputFile.length > 0) {
        compileASingleFileToBinaryCode(outputFile[0][0], outputFile[0][1], COMPILER_CONFIG?.savePath);
    }
}

export function getFilteredByteCode(filePath: any) {
    const readByteCode = fs.readFileSync(filePath, 'utf-8')
    const lowerBound = readByteCode.indexOf(':',
        (readByteCode.indexOf('Binary representation:'))) + 1;

    const upperBoundSearch = readByteCode.indexOf('Text representation:')
    return (upperBoundSearch > -1) ?
        (YAML.parse(readByteCode.substring(lowerBound, upperBoundSearch))).toString() :
        (YAML.parse(readByteCode.substring(lowerBound))).toString();

}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// let COMPILER_CONFIG = readYamlConfig();
// let YUL_IGNORE_FILES =loadYulIgnore();
// compileSelected("yulERC20", "yul", COMPILER_CONFIG , YUL_IGNORE_FILES);
// getFilteredByteCode("contracts\\yulERC20.yul");
// compileAll()

// @tovarishfin/hardhat-yul
// todo - need to filterout the binary output from the output file ignoring the comments
// todo - need to feed the binary the libarary along with a interface


