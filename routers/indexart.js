
const express = require("express");
const article = require("../model/article");
const comment = require("../model/comment");

let router = express.Router();

//访问文章页面
module.exports = function(req,res){
    article.find()
    .then(data=>{
        if ( data ){
            //console.log(data)
            res.render("index",{code:1,data});
        } else{
            res.render("index",{code:0,msg:"没有对应的文章",data:[]});
        }
    })
    .catch(e=>{
        console.log(e,333)
        res.render("index",{code:0,msg:"服务器异常"});
    });

};