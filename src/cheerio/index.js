'use strict'
let cheerio = require('cheerio');
let http = require('https');
let iconv = require('iconv-lite');
const fs =require('fs')
// let url ='https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
let url ='https://www.ygdy8.net/html/gndy/dyzz/index.html';
let urls=[];
http.get(url,(res)=>{
    
    let chunks =[];
    res.on('data',function(chunk){
        chunks.push(chunk);
        // console.log(chunks);
    });
    
    res.on('end',function (res) {
        // const { statusCode } = res;
        // const contentType = res.headers['content-type'];
        // console.log('end:'+statusCode,contentType);
        let titles =[];
        let html = iconv.decode(Buffer.concat(chunks),'gb2312');
        let $ = cheerio.load(html,{decodeEntities:false});
        console.log(chunks);
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