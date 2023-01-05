const app = require("./methods.js");
const redis = require("./redis.js");
const db = require("./db.js")

let cachedData = {};
let emptyData = true;

function loadCache(cb){
    cachedData = {};
    db.query("SELECT * FROM feedback ORDER BY id DESC;", function (err, values, field) {
        if (!err) {
            for (const key in values) {
                if (Object.hasOwnProperty.call(values, key)) {
                    cachedData[values[key].id] = values[key];
                }
            }
        }else {
            cachedData = {};
        }

        emptyData = false;

        if (cb) {
            cb();
        }
    })
}

app.express.get("/suggestions/fetch", function(req, res){
    if (emptyData) {
        loadCache(() => {
            res.json(cachedData).status(200);
        })
    } else {
        res.json(cachedData).status(200);
    }
})

app.express.get("/suggestions/read", function(req, res){
    const id = req.query.id;
    if (id == null) {
        res.status(400).send("[]");
        return;
    }

    var response = {
        comments : [],
        score : 0,
        title : "Missing",
        description : "Missing",
    }

    if (!cachedData[id]) {
        res.status(400).json(response);
        return
    }

    response.title = cachedData[id].title;
    response.description = cachedData[id].description;

    redis.HGETALL("feedback:" + id + ":comments", (err, rep) =>{
        if (err){
            res.status(400).json(response);
            return;
        }
        if (rep){
            for (const key in rep) {
                if (Object.hasOwnProperty.call(rep, key)) {
                    const element = rep[key];
                    response.comments.push({
                        poster : key,
                        comment : element,
                    })
                }
            }
        }

        redis.HLEN("feedback:" + id + ":score", (err, rep) =>{
            console.log(id + " " + rep)
            if (err){
                res.status(400).json(response);
                return;
            }
            if (rep) {
                response.score = rep
            }

            res.json(response).status(200);
        })
    })
})

app.express.post("/suggestions/refresh", function(req, res) {
    loadCache()
})

loadCache()

