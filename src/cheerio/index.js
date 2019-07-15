'use strict'
/*
  此项目使用node组件写的一个简单爬虫
   https ：  获取地址内容
   iconv-lite ： 解析获取的内容
   cheerio ： node框架的Jquery,用于提取内容
   fs：把获取的内容写入文件
*/


let cheerio = require('cheerio');
let http = require('https');
let iconv = require('iconv-lite');
const fs =require('fs')
// let url ='https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
let url ='https://www.ygdy8.net/html/gndy/dyzz/index.html';
let urls=[];
http.get(url,(res)=>{
    
    let chunks =[]; //存储获取内容列表
    res.on('data',function(chunk){
        chunks.push(chunk);
        // console.log(chunks);
    });
    //获取页面内容
    res.on('end',function (res) {
        let titles =[];
        // 解析成gb2313格式
        let html = iconv.decode(Buffer.concat(chunks),'gb2312');
        let $ = cheerio.load(html,{decodeEntities:false});
        console.log(chunks);
        //获取页面内容
        $('.co_content8 a').each(function(idx,element){
            // console.log($(element))
            let $ele = $(element);
            titles.push({title:$ele.text(),url:$ele.attr('href')});
            
        })
        console.log('---------titles-------------------'); 
        console.log(titles);  
        getBtLink(titles,0)
    })
})

let btLink=[];
function getBtLink(urls,n){
  console.log("length:"+urls[n].title.length);
  if(urls[n].title.length>4){
    console.log("正在获取第" + n + "个url的内容",'https://www.ygdy8.net'+urls[n].url,urls[n].title);
      http.get('https://www.ygdy8.net'+urls[n].url,function(sres){
        let chunks =[];
        sres.on('data',function (chunk) {
            chunks.push(chunk);
        })

        sres.on('end',function(){

            let html = iconv.decode(Buffer.concat(chunks),'gb2312');
            let $ = cheerio.load(html, { decodeEntities: false });
            try{
              btLink.push({title:urls[n].title,url:$('#Zoom table td a').text()});
              console.log($('#Zoom table td a').text());
            }catch(err){
              console.log("err:"+err);
            }
            
            if(n<urls.length-1){
                getBtLink(urls,++n);
            }else{
                console.log("btlink获取完毕！");
                console.log(btLink);
            }
        })
    })
    }else{
      if(n<urls.length-1){
          getBtLink(urls,++n);
      }else{
          console.log("btlink获取完毕！");
          console.log(btLink);
          fs.open('videoList.json','w',function(err,stats){
            if(err){
              return console.error(err);
            }
            console.log(stats);
            console.log('新建文件完成');
            fs.writeFile('videoList.json',JSON.stringify(btLink),function(err){
              if(err){
                return console.error(err);
              }
              console.log("数据写入成功！");
              fs.close(stats,function(err){
                if(err){
                  console.log("文件关闭！");
                  return console.error(err);
                }
              })

            })
          })
      }
    }
    
}
// getBtLink(urls,0)