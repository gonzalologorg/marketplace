var app = require("./methods.js");
const fs = require('fs');

var dir = './bases';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

var collection = {}

app.express.post("/gangs/upload", function(req, res){
    const id = req.body.id;
    const data = req.body.data;
    const key = req.body.key;
    if (key != "gonzo_made_it") return;
    collection[id] = JSON.parse(data);
    fs.writeFileSync("./bases/" + id + ".json", data);
    res.send("1").status(200);
})

app.express.post("/gangs/saveshafts", function(req, res){
    const data = req.body.shafts;
    const key = req.body.key;
    if (key != "gonzo_made_it") return;
    fs.writeFileSync("./bases/shafts.json", data);
    res.send("1").status(200);
})

app.express.get("/gangs/shafts", function(req, res){
    if (fs.existsSync("./bases/shafts.json")){
        res.send(fs.readFileSync("./bases/shafts.json")).status(200);
    }else{
        res.send("[]").status(400)
    }
})

app.express.get("/gangs/get", function(req, res){
    const id = req.query.id;
    if (collection[id]) {
        res.json(collection[id])
    }else{
        const file = "./bases/" + id + ".json"
        if (fs.existsSync(file)){
            collection[id] = JSON.parse(fs.readFileSync(file));
        }else{
            collection[id] = {}
        }
        res.json(collection[id]);
    }
})

app.express.post("/gangs/removezone", function(req, res){
    const id = req.body.id;
    const key = req.body.key;
    if (key != "gonzo_made_it") return;
    fs.unlink("./bases/" + id + ".json", function(err){
        if (err) {
            res.status(400);
            throw err;
        }
        collection[id] = null;
        res.status(200);
    });
    
})