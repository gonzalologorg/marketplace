const redis = require("redis");
const client = redis.createClient();
client.auth("aiCH3k5NkcNmBx4");
const app = require("./methods.js");

function requestStats(sid, res) {
    if (sid == null) {
        res.send("[]");
    } else {
        client.HGETALL("achi:" + sid + ":int", (err, rep) => {
            if (!rep) {
                res.send("[]").status(200);
                return;
            } else {
                res.send(rep).status(200);
            }
        })
    }
}

app.express.get("/statistics/rank", function(req, res){
    var stat = req.query.kind;
    if (stat == null) {
        res.status(400);
        return;
    };
    client.HGETALL("playerlist", (err, rep) =>{
        if (!rep){
            res.status(400)
            return;
        }
        var data = {};
        var remaining = Object.keys(rep).length;
        for (const sid in rep) {
            client.HGET("achi:" + sid + ":int", stat, (err, rep) =>{
                remaining--;
                if (rep && rep > 0)
                    data["s" + sid.toString()] = rep;
                if (remaining <= 0){
                    res.send(data).status(200);
                }
            });
        }
    })
})

app.express.get("/statistics", function (req, res) {
    var sid = req.query.sid;
    requestStats(sid, res);
})

module.exports = client;