const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

mongoose
    .connect("mongodb+srv://howardty52:fcB1YOLUuSu0qilj@242assignments.vl2gcsf.mongodb.net/")
    .then(()=> {
        console.log("connected to mongodb");
    })
    .catch((error) => {
        console.log("couldn't connect to mongodb", error);
    });

const craftSchema = new mongoose.Schema({
    name: String,
    description: String,
    supplies: [String],
    img: String
});

const Craft = mongoose.model("Craft", craftSchema);

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/crafts", async (req, res)=>{
    const crafts = await Craft.find();
    res.send(crafts);
});

app.get("/api/crafts/:id", async (req, res) => {
    const id = req.params.id;
    const craft = await Craft.findOne({_id:id});
    res.send(craft);
});

app.post("/api/crafts", upload.single("img"), async (req, res) => {
  const result = validateCraft(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const craft = new Craft ({
    name: req.body.name,
    description: req.body.description,
    supplies: req.body.supplies.split(","),
  });

  if (req.file) {
    craft.img = req.file.filename;
  }

  const saveResult = await craft.save();
  res.send(craft);
});

app.put("/api/crafts/:id", upload.single("img"), async (req, res) => {
    const result = validateCraft(req.body);

    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }

    let toUpdate = {
        name: req.body.name,
        description: req.body.description,
        supplies: req.body.supplies.split(",")
    };

    if(req.file){
        toUpdate.img = req.file.filename;
    }

    const id = req. params.id;

    const updateResult = await Craft.updateOne({_id:id},toUpdate);
    res.send(updateResult);
});

app.delete("/api/crafts/:id", async (req,res) => {
    const craft = await Craft.findByIdAndDelete(req.params.id);
    res.send(craft);
});

const validateCraft = (craft) => {
  const schema = Joi.object({
    _id:Joi.allow(""),
    supplies:Joi.allow(""),
    name:Joi.string().min(3).required(),
    description:Joi.string().min(3).required()
  });

  return schema.validate(craft);
};

app.listen(3000, ()=> {
    console.log("Server is Running");
});