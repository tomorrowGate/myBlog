const express = require("express");
const article = require("../model/article");
let router = express.Router();
let conditions = {};

router.get("/:itemId", (req, res) => {
    let itemId = req.params.itemId;
    let reg = new RegExp(req.params.itemId);
    if (!itemId) {
        res.render("article", {
            code: 0,
            msg: "没有对应的文章"
        });
    } else {
        conditions = {
            tags: reg
        }

        //开始查找
        article.find(conditions)
            .then(data => {
                if (data.length) {
                    data.forEach(v=>{
                        v.date = v.date.valueOf()
                        console.log(v.date,'date')
                    })
                    res.render("articleList", {
                        code: 1,
                        data
                    });
                } else {
                    console.log(data, "else")
                    res.render("articleList", {
                        code: 0,
                        msg: "没有超找到相关数据"
                    })
                }
            })
            .catch(e => {
                console.log(e, "e")
                res.send({
                    code: 0,
                    msg: "服务器异常~请稍后再试~"
                })
            });

    }
})
module.exports = router