const path = require('path');
const fs = require('fs');

// Defines a Yul ignore file to optimize the process and ignore the unnecessary folders
const contents = fs.readFileSync('.yulignore', 'utf-8');
const ignoringFiles = contents.split(/\r?\n/);


/**
 * input :  contracts, pure_yul_constructor.yul
 * output: ['pure_yul_constructor','contracts\\exercises\\Calls\\5\\pure_yul_constructor.yul']
 *
 * Given a location to start, search all the files matching the filer and return the name and the relative path
 *
 **/
function getAllYulFiles(startPath, filter) {
    const found = [];
    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory() && (!ignoringFiles.includes(filename))) {
            found.push(...getAllYulFiles(filename, filter));
        } else if (filename.endsWith(filter)) {
            if (files[i].split(".")[0]) {
                found.push([files[i].split(".")[0], filename]);
            }
        }
    }

    return found;
}

/**
 * Given a path and a name, the compiled output of the global yul object will be written to the
 * %arg1%\..\artifact\%arg2%\%arg2%.yaml
 * arg1 - path (convention used here)
 * arg2 - name of the file (convention used here)
 *
 * */
function compileToBinaryCode(name, path) {
    require('child_process').exec('cmd /c C:\\addToPath\\yul_pure_compile.bat .\\' + path + ' ' + name,
        (error) => {
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
}

/**
 * return the file metadata which will be helpful for yul compilation
 * */
function findAFile(name, extension) {
    return getAllYulFiles("contracts", name + "." + extension)

}

/**
 * Given the root compile all the .yul files
 * */
function compileAll() {
    const file2 = getAllYulFiles(".", ".yul");
    // console.log(file2)

    for (let i = 0; i < file2.length; i++) {
        compileToBinaryCode(file2[i][0], file2[i][1]);
    }
}


/**
 * given a file name and an extension a file is compiled
 *
 * */
function compileSelected(filename, extension) {
    const file2 = findAFile(filename, extension)
    console.log(file2)
    if (file2.length > 0) {
        compileToBinaryCode(file2[0][0], file2[0][1]);
    }
}

function getFilteredByteCode(filePath) {
    const ignoringFiles = fs.readFileSync(filePath, 'utf-8')
    console.log(ignoringFiles)
}

/**
 * TEST COMPILATION
 * */
compileSelected("yulERC20", "yul");
getFilteredByteCode("contracts\\yulERC20.yul");
// compileAll()

// @tovarishfin/hardhat-yul
// todo - need to filterout the binary output from the output file ignoring the comments
// todo - need to feed the binary the libarary along with a interface


