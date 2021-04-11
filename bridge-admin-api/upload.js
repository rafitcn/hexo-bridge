const fs = require("hexo-fs");
const path = require("path");
const formidable = require("formidable");
const assets = require('./asset')
const http = require("http");
const Buffer = require("buffer")
let hexo = null;
let SOURCE_DIR = null;
let UPLOAD_DIR = null;
let UPLOAD_TMP_DIR = null;

function setup(hexoInstance) {
    hexo = hexoInstance;

    SOURCE_DIR = hexo.source_dir;
    UPLOAD_DIR = path.join(SOURCE_DIR, "upload");
    UPLOAD_TMP_DIR = path.join(UPLOAD_DIR, "tmp");

    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirsSync(UPLOAD_DIR);
    }
    if (!fs.existsSync(UPLOAD_TMP_DIR)) {
        fs.mkdirsSync(UPLOAD_TMP_DIR);
    }
}

function editor(req, res) {
    const form = formidable({ multiples: true, uploadDir: UPLOAD_DIR, keepExtensions: true });
    form.on("fileBegin", function (name, file) {
        let originalFileNamePath = path.join(UPLOAD_DIR, "tmp", file.name);
        if (!fs.existsSync(originalFileNamePath)) {
            file.path = originalFileNamePath;
        }
    });
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err)
            res.sendError("Sorry, something went wrong.")
            return
        }
        let succMap = {}
        let date = new Date()
        let dir = ''+date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()
        const destinationDirectory = path.join(UPLOAD_DIR, dir);
        for (let currentFile in files) {
            const oldPath = files[currentFile].path;
            const fileName = path.basename(oldPath);
            const oriName = files[currentFile].name
            let newPath = path.join(destinationDirectory, fileName);
            assets.moveAsset(oldPath, newPath);
            succMap[oriName] = newPath.replace(SOURCE_DIR, "/")
        }
        res.sendSuccess({
            "msg": "success",
            "code": 0,
            "data": {
                "errFiles": [],
                "succMap": succMap
            }
        })
    });
}

function fetch(url, resp){
    if (!url) {
        return resp.sendError("url is empty")
    }
    let date = new Date()
    let dir = ''+date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()
    const destinationDirectory = path.join(UPLOAD_DIR, dir);

    http.get(url, res => {
        let img = []
        let size = 0
        const _arr = url.split('.')
        const format = _arr[_arr.length - 1]
        const _name = name ? name : (new Date).getTime()
        res.on('data', chunk => {
            img.push(chunk)
            size += chunk.length
        })
        res.on('end', () => {
            // 合并 Buffer
            const buffer = Buffer.concat(img, size)
            let filename = _name+"."+format
            let dest = path.join(destinationDirectory, _name+"."+format)
            let succMap = {}
            fs.writeFileSync(dest, buffer, (err) => {
                if (err) {
                    console.log(err)
                    resp.sendError("Sorry, something went wrong.")
                } else {
                    succMap[filename]=dest.replace(SOURCE_DIR, "/")
                    resp.sendSuccess({
                        "msg": "success",
                        "code": 0,
                        "data": {
                            "errFiles": [],
                            "succMap": succMap
                        }
                    })
                }
            })
        })
    })
}

module.exports = {
    setup: setup,
    editor: editor,
    fetch: fetch,
};
