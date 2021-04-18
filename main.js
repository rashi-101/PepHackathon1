let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let pupp = require("puppeteer");
let { email, pwd } = require("./personal");
let mail = require("./mailSend");
let xlsx = require("xlsx");
let utils = require("./utils");
let { affirmations } = require("./affirmations");
const topic = process.argv.slice(2)[0].toString();
const mailHuman = process.argv.slice(2)[1].toString();

//let affirm = require("./Affirmation/affirm");
//let newsArticle = require("./iexpress");

let str = "\n----------------------Article------------------------\nArticle link : ";
let toDoArr = [];
async function main(topic,mailHuman) {
    try {
        let browser = await pupp.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"]
        });
        console.log("Reaching towards today's article...");
        let link = await getNewsArticle(browser);
        str += link;

        // read from proj euler
        console.log("Reading Project Euler scrapped data...");
        let projEulerData = utils.excelRead("C:\\Users\\91798\\Desktop\\Hackathon1\\ProjEul\\ExcelFile\\eulQn.xlsx", "Sheet1");
        let randomnum = Math.floor(Math.random() * projEulerData.length);
        toDoArr["Euler"] = projEulerData[randomnum];
        //console.log(toDoArr);
        str += "\n\n\n\n-----------------------Euler-------------------------\n" + "Question:- " + toDoArr["Euler"].qname + "\nLink:- " + toDoArr["Euler"].qLink + "\n";
        

        //get pep questions
        // let pepdata = utils.excelRead("C:\\Users\\91798\\Desktop\\Hackathon1\\Geeting Started.excel.xlsx");
        // let randNumPep = Math.floor(Math.random()*90);
        // toDoArr["Pep"]= 

        //get affirmation
        console.log("Getting one affirmation...");
        let affirmNum = Math.floor(Math.random() * affirmations.length);
        toDoArr["Affirmation"] = affirmations[affirmNum];
        str += "\n\n\n\n--------------------Affirmation-----------------------\n" + "Remember this:- " + toDoArr["Affirmation"] + "\n";
       
       //gfg article lookup
        console.log("Looking up your gfg article...");
        let articlelink = await s(topic, browser);


        console.log("Creating a pdf of that article now.....");
        let nbrowser = await pupp.launch();
        let page = await nbrowser.newPage();
        await page.goto(articlelink.toString(), { waitUntil: 'domcontentloaded', });
        await page.pdf({ path: 'topic.pdf', format: 'a4' });
        await browser.close();


        console.log("Mailing your work for the day..");
        mail.sendMail(str, mailHuman);
    // let leetQns = await leet(browser);

    } catch (err) {
        console.log("error inside main js\n", err);
    }

}

(async function () {
    await main(topic,mailHuman);
})();


async function getNewsArticle(browser) {
    try {
        let pages = await browser.pages();
        let page = pages[0];
        await page.goto("https://indianexpress.com/");
        await page.setDefaultNavigationTimeout(50000);
        await page.setDefaultTimeout(45000);
        // await page.waitForSelector(".close-btn-premium",{visible:true});
        // await page.click(".close-btn-premium");
        //await page.waitForTimeout(3000);
        await page.waitForSelector("#fixednavbar .hamburger-menu", { visible: true });
        await page.click("#fixednavbar .hamburger-menu");
        await page.waitForXPath("//span[contains(text(),'From the Print')]//..//a[contains(text(),'Explained')]");
        let exp = await page.$x("//span[contains(text(),'From the Print')]//..//a[contains(text(),'Explained')]");

        const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
        await exp[0].click();

        const page1 = await newPagePromise;
        await page1.waitForSelector(".ie-searchicon");
        await page1.click(".ie-searchicon");
        await page1.waitForXPath("//input[@type='text']");
        let sb = await page1.$x("//input[@type='text']");
        await sb[0].type("Explained Desk", { delay: 80 });
        await page1.waitForSelector("#searchsubmit", { visible: true });
        await page1.click("#searchsubmit");
        await page1.waitForTimeout(5000);
        //await page1.waitForNavigation({waitUntil:"networkidle0"});
        await page1.waitForXPath("//a[contains(text(),'Explained Desk')]");
        let exdesk = await page1.$x("//a[contains(text(),'Explained Desk')]");
        await exdesk[0].click();
        //await page1.waitForNavigation({waitUntil:"networkidle0"});

        await page1.waitForXPath("//h1");
        let articles = await page1.$x("//div[@class='story']//a");
        await articles[0].click();
        await page1.waitForNavigation({ waitUntil: 'domcontentloaded' });
        let link = await page1.url();
        await page1.close();
        return link;
    } catch (err) {
        console.log("error inside iexpress js: " + err);
    }
}

async function s(topic, browser) {
    // const browser = await puppeteer.launch({
    //     headless:false,
    //     defaultViewport:null,
    //     args:["--start-maximized"]
    // });
    const page = await browser.newPage();
    await page.goto('https://www.geeksforgeeks.org/', {
        waitUntil: 'domcontentloaded',

    });
    await page.waitForSelector(".gfg-icon.gfg-icon_search.header--search__input-icon.gfg-icon_search-gcse.cursor-p");
    await page.click(".gfg-icon.gfg-icon_search.header--search__input-icon.gfg-icon_search-gcse.cursor-p");
    await page.waitForSelector("#gsc-i-id1");
    await page.type("#gsc-i-id1", topic);
    await page.keyboard.press('Enter');
    await page.waitForSelector(".gsc-expansionArea .gsc-webResult.gsc-result .gs-title a");
    let sres = await page.$$(".gsc-expansionArea .gsc-webResult.gsc-result .gs-title a");
    let newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));

    await sres[0].click();
    let page1 = await newPagePromise;
    await page1.waitForNavigation({ waitUntil: 'domcontentloaded' });
    let url = await page1.url();
    return url;
}

async function leet(browser){
     let page = await browser.newPage();
     await page.goto("https://leetcode.com/",{waitUntil:'domcontentloaded'});
     await page.waitForXPath("//span[contains(text(),'Sign in')]");
     let sxpath = await page.$x("//span[contains(text(),'Sign in')]");
     await sxpath[0].click();
     await page.waitForXPath("//span//input");
     let ipxpath = await page.$x("//span//input");
     await ipxpath[0].type("rashichawla2608@gmail.com", {delay:80});
     await ipxpath[1].type("BeingSecure1#", {delay:80});
    // await page.waitForSelector("#signin_btn");
     await page.click("#signin_btn");
     await page.waitForXPath("//a[contains(text(),'Problems')]");
     let probxpath = await page.$x("//a[contains(text(),'Problems')]");
     await probxpath[0].click();



}