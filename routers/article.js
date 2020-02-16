
const express = require("express");
const article = require("../model/article");
const comment = require("../model/comment");

let router = express.Router();

//发表文章
router.post("/",(req,res)=>{
    let {title,tags,content} = req.body;

    if(!(title&&tags.length&&content)){
        return res.send({code:0,msg:"格式错误"});
    }

    article.create({
        title
        ,content
        ,tags:tags.join(",")
        ,author: req.session.userInfo._id
        ,readNum:1
        ,commentsNum:0
    }).then((data)=>{
        if ( data ){
            res.send({code:1,msg:"文章发表成功"});
        } else{
            res.send({code:0,msg:"服务器异常~请稍后重试~"});
        }
    }).catch(e=>{
        res.send({code:0,msg:"服务器异常~请稍后重试~"});
    });
});

function readNumAdd(_id){
    //阅读量++
    article.update(
        {_id}
        ,{ $inc: { readNum: 1} }
    ).then(()=>{
        console.log("阅读量++")
    }).catch(e=>{
        console.log("阅读量不变")
    });
}

//访问文章页面
router.get("/:_id",(req,res)=>{
    let _id = req.params._id;
    if ( !_id ) {
        res.render("article",{code:0,msg:"没有对应的文章"});
    }else{
        article.findById(_id).populate("author")
               .then(data=>{
                   if ( data ){
                    let nextArticle = {}
                    ,beforeArticle={}
                    
                    readNumAdd(_id)
                    //按时间排序 下一篇
                    article.find({"date" : {$gt : new Date(data.date)}}).sort({_id:1}).limit(1)
                        .then(nextArt=>{
                            nextArticle = nextArt
                            //console.log(nextArticle,"nextArt")
                        })
                        .catch(err=>{console.log("nextArticle err")})
                    //上一篇
                    article.find({"date" : {$lt : new Date(data.date)}}).sort({_id:-1}).limit(1)
                        .then(beforeArt=>{
                            beforeArticle = beforeArt
                            //console.log(beforeArticle,"beforeArt")
                        })
                        .catch(err=>{console.log("beforeArticle err")})
                        

                    comment.find({article:_id}).populate("author")
                        .then(commentData=>{
                            console.log(data.title,"article",nextArticle[0]&&nextArticle[0].title,beforeArticle[0]&&beforeArticle[0].title)
                            res.render("articleDetail",{code:1,data,commentData,nextArticle,beforeArticle});
                        })
                        .catch(e=>{
                            console.log("无评论",e)
                            res.render("articleDetail",{code:1,data,commentData:[],nextArticle,beforeArticle});
                        });
                   } else{
                       console.log("没有对应的文章")
                       res.render("article",{code:0,msg:"没有对应的文章"});
                   }
               })
               .catch(e=>{
                    console.log(e);
                   res.render("article",{code:0,msg:"服务器异常"});
               });

    }
});

module.exports = router;