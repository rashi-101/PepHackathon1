let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let pupp = require("puppeteer");

let xlsx = require("xlsx");
let {excelWrite} = require("../utils");

console.log("Running your file....");
let url ="https://projecteuler.net/archives";

(async function(){

    request(url,cb);
    async function cb(err, resp, html){
        if(err){
            console.log("Theres some error: ",err);
        }else{
            await extractQns(html);
        }
    }
    async function extractQns(html){
        let st = cheerio.load(html);
        let qns = st("td a");
        let projEulerArr =[];
        for(let i=0; i<qns.length; i++){
            let qname = st(qns[i]).text().trim();
            
            let qLink = st(qns[i]).attr("href");
            qLink = "https://projecteuler.net/"+qLink;
            projEulerArr.push({
                qname,
                qLink});
        }
        excelWrite("C:\\Users\\91798\\Desktop\\Hackathon1\\ProjEul\\ExcelFile\\eulQn.xlsx",projEulerArr,"Sheet1");
        //console.table(projEulerArr);
    }
})();

