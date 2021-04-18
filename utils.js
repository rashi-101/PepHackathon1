let xlsx = require("xlsx");
let fs = require('fs');

module.exports = {
    excelWrite: writeFile,
    excelRead: readFile,
}

function writeFile(filepath, content, name) {
    let newWb = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(content);
    xlsx.utils.book_append_sheet(newWb, newWS, name);
    xlsx.writeFile(newWb, filepath);
}

function readFile(filePath,sheetName){
    let wb = xlsx.readFile(filePath);
    let sheetData = wb.Sheets[sheetName];
    let jsonData = xlsx.utils.sheet_to_json(sheetData);
    return jsonData;
}