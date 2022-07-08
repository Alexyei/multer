import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config()
const app = express();
app.use(express.urlencoded({extended: true}))
app.use(express.json());

// const upload = multer({ dest: 'uploads/' })
function checkFileType(file: Express.Multer.File, cb:any){
    function getExtension(filename:string) {
        return filename.split('.').pop() || "";
    }

    // Allowed ext
    // const filetypes = /jpeg|jpg|png|gif/;
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(getExtension(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        // cb(new multer.MulterError())
        cb(new Error('Доступны только следуюшие типы файлов: '+filetypes.source));
    }
}
function getUploadFileMiddleware(upload = multer({dest: 'uploads/', limits: {
        //максимальная длина нзвания файла в байтах
        fieldNameSize: 10,
        //3MB максимальный размер одного файла
        fileSize: 3*1024*1024,
    },
    fileFilter: function(_req, file, cb){
        checkFileType(file, cb);
    }}).fields([{name: 'avatar', maxCount: 2}])) {
    return function uploadFileMiddleware(req: any, res: any, next: any) {
        upload(req, res, function (err) {
            //файлы не появились в uploads
            if (err instanceof multer.MulterError) {
                switch (err.code){
                    case "LIMIT_UNEXPECTED_FILE":
                        res.send("Превышено максимальное количество файлов для загрузки")
                        break;
                    case "LIMIT_FILE_SIZE":
                        res.send("Превышен максимальный размер файла")
                        break;
                    case "LIMIT_FIELD_KEY":
                        res.send("Название файла слишком длинное")
                        break;
                    default:
                        res.send(err)
                }
              //  if (err.code === 'LIMIT_UNEXPECTED_FILE')


            } else if (err) {
                next(err.message)
            }
            else
            // Everything went fine.
            next()
        })
    }
}

app.get("/:id?", async (req: any, res: any, next: any) => {


    res.sendFile("views/index.html", {root: __dirname})
})

app.post("/form", getUploadFileMiddleware(), async (req: any, res: any, next: any) => {
    // res.send(req.files['avatar'] ? req.files['avatar'][0].originalname : 'Error');
//можно сохранить эти данные в бд

    res.send(req.files['avatar'] ? {name: req.files['avatar'][0].originalname, path: req.files['avatar'][0].filename} : 'Файл не был отправлен');
    // if (req.files['avatar'] ){
    //     const file = `${__dirname}/${req.files['avatar'][0].path}`;
    //     res.download(file);
    // }
})

app.get("/download/:filename", async (req: any, res: any, next: any) => {
    const fileName = req.params.filename;
    if (fileName){
        const file = `${__dirname}/uploads/${fileName}`;
        if (fs.existsSync(file))
            res.download(file, "name.docx");
        else{
            res.send("notexists")
        }
    }
    // res.redirect("/")
})

app.listen(process.env.PORT, async () => {
    console.log("Server start at " + process.env.PORT)
})