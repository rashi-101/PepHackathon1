let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let pupp = require("puppeteer");
let {email, pwd} = require("./personal");
let xlsx = require("xlsx");
let {excelWrite} = require("../utils");

console.log("Running your file....");



(async function reachTopicsPage(){
    try{
    let browser = await pupp.launch({
        headless:false,
        defaultViewport:null,
        args:["--start-maximized"]
    });
    let pages = await browser.pages();
    let page = pages[0];
    await page.goto("https://www.pepcoding.com/resources/");
    await page.waitForTimeout(100000);
    await page.waitForSelector(".dashboard-user",{visible:true});
    //await page.click(".dashboard-user");

    //----------log in---------------------------------
    // await page.waitForSelector("#login input[placeholder='email']",{visible:true,timeout:1000});
    // await page.click("#login input[placeholder='email']");
    // // await page.focus("input[placeholder='email']");
    // //await page.evaluate("#login input[placeholder='email']", el => el.value = email);
    // await page.type("#login input[placeholder='email']",email,{delay:100});
    // await page.waitForSelector("#login input[type='password']",{visible:true,timeout:3000});
    // // await page.focus("#login input[type='password']");
    // await page.type("#login input[type='password']",pwd,{delay:100});
    // await page.click("#login button");

    //-----------Reaching topics page----------------------
    await page.waitForSelector(".col.l9.s12.m12.right-section", {visible: true});
    let courses = await page.$$(".col.l9.s12.m12.right-section");
    let lev1 = courses[0];
    await lev1.click();
    await page.waitForNavigation({waitUntil:"networkidle0"});
    await page.waitForSelector(".underline");
    let url = await page.url();

    //-----------extracting questions and links----------------------
    await getQuesns(url);

    }catch(err){
        console.log("There's a little error: ",err);
    }
})();

async function getQuesns(url){
    // let topics = await tab.$$(".no-padding.col.l10.s9.m10.push-s1.no-margin");
    // let TopicsList =[];
    // for(let i=0; i<topics.length; i++){

    // }
    request(url,cb);
    async function cb(err, response, html){
        if(err){
            console.log("error in gQ  cb");

        }else{
            await extractQns(html);
        }
    }
    async function extractQns(html){
        let st = cheerio.load(html);
        let topics = st(".collection-item.row.list-item");
        let linksArr=[];
        let tNameArr =[];
        for(let i=0; i<topics.length; i++){
            let linkEle = st(topics[i]).find("a");
            let link = st(linkEle).attr("href");
            link= "https://www.pepcoding.com"+link;
            linksArr.push(link);

            let name = st(topics[i]).text().trim();
            tNameArr.push(name);
        }
        await getQuesns(linksArr,tNameArr,0);
    }
    async function getQuesns(linksArr, tNameArr,n){
        // console.log(linksArr[n]);
        // console.log(tNameArr[n]);
        if(linksArr.length ==n){
            console.log("Done getting");
        }
        request(linksArr[n],cb2);
        async function cb2(err,res,html){
            if(err){
                console.log("Error in getQns");
            }else{
                //console.log("now we'll do something");
                await extractQns(html, tNameArr[n]);
               // await getQuesns(linksArr,tNameArr,n+1);
            }
        }
        async function extractQns(html , tname){
            
            let st2 = cheerio.load(html);
             let qns = st2(".row.collection-item.no-margin.no-padding.searchRow");
             // console.log(qns.length);
                let finalArr=[];
                for(let i=0; i<qns.length; i++){
                     let qnName = st2(qns[i]).text().trim().split("\n")[0];
                  //  console.log(qn.length)
                  let qnLinks = st2(qns[i]).find("a");
                  let qnLink = st2(qnLinks).attr("href");
                  qnLink = "https://www.pepcoding.com"+qnLink;
                    finalArr.push({
                        qnName,
                        qnLink});
                }
                // console.table(finalArr);
                excelWrite("C:\\Users\\91798\\Desktop\\Hackathon1\\Pep\\TopicsWiseFiles\\"+tname+".xlsx",finalArr,"Sheet1");
        }
    }
}

//login to pep


//free resourses

//extract questions and their links 

// put them to json

//convert to excel