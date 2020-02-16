
const express = require("express");
const article = require("../model/article");
const comment = require("../model/comment");

let router = express.Router();

//文章的评论数量改变
function changeArtCom(type,articleId){
    article.update(
        {_id:articleId}
        ,{ $inc: { commentsNum: type} }
    ).then(()=>{
        console.log(`评论量（${type}）`)
    }).catch(e=>{
        console.log("评论量不变");
    });
}

//评论提交
router.post("/",(req,res)=>{
    if ( !req.session.userInfo ){
        return res.send({code:0,msg:"请先登录。"});
    }

    let userId = req.session.userInfo._id;
    let articleId = req.body.articleId;
    let content = req.body.desc;

    if ( userId && articleId && content ) {
        comment.create({
            content
            ,article:articleId
            ,author:userId
        }).then(data=>{
            changeArtCom(1,articleId)
            return res.send({code:1,msg:"评论成功"});
        }).catch(e=>{
            return res.send({code:0,msg:"服务器异常，请稍后重试。"})
        });
    }else{
        return res.send({code:0,msg:"评论信息有错误。"})
    }

});

//评论删除
router.post("/delete",(req,res)=>{
    if ( !req.session.userInfo ){
        return res.send({code:0,msg:"请先登录！"});
    }

    let authorId = req.session.userInfo._id;
    let commentId = req.body.commentId;
    let articleId = req.body.articleId;

    if ( authorId && articleId && commentId ) {

        //判断用户是否是文章作着
        article.findById(articleId)
            .then(data=>{
                if ( data.author == authorId  ) {
                    comment.deleteOne({_id : commentId})
                           .then(data=>{
                            changeArtCom(-1,articleId)
                               res.send({code:1,msg:"删除成功"});
                           }).catch(e=>{
                                res.send({code:0,msg:"删除失败"});
                           });
                }else{
                    find();
                }
            }).catch(e=>{
            res.send({code:0,msg:"删除失败"});
            });

        function find(){
            comment.findById(commentId)
                .then(data=>{

                    if ( data.author == authorId ) {
                        comment.deleteOne({_id : commentId})
                               .then(data=>{
                                    //changeArtCom(-1,articleId)
                                   res.send({code:1,msg:"删除成功"});
                               }).catch(e=>{
                                    res.send({code:0,msg:"删除失败"});
                                });
                    }else{
                        res.send({code:0,msg:"删除失败"})
                    }
                }).catch(e=>{
                    res.send({code:0,msg:"删除失败"})
                });
        }

    }else{
       res.send({code:0,msg:"删除失败。"})
    }
});

module.exports = router;