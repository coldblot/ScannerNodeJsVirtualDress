const express=require('express');
const AWS = require('aws-sdk');
const fs = require('fs');

const app=express();
const accessKey = "AKIA275RJUHZ7GTGZYHB";
const secretKey = "RCs68E4cPcEfyPsVNqkJ5fUxrfKunrlk1N+Tue42";
const bucketName = "imageqr";
const region = "Asia Pacific (Mumbai) ap-south-1"; // e.g., "us-west-1"
const bodyParser = require('body-parser');
const path=require('path');
AWS.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretKey
});


const s3 = new AWS.S3();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/test',(req,res)=>{
  console.log("test");
});
app.use(bodyParser.raw({ type: 'image/*', limit: '10mb' }));

app.post("/imgdownload",(req,res)=>{
    
     // Get raw image binary data from request body
     const imgbinary = req.body.imgbinary;
     const imageBuffer = Buffer.from(imgbinary, 'base64');
     let imageName=`received_image_${Date.now()}.png`;
     const imagePath = path.join(__dirname, 'uploads',imageName);
 
     fs.writeFile(imagePath, imageBuffer, (err) => {
         if (err) {
             console.error(err);
             res.status(500).send('Error saving image');
         } else {
             console.log('Image received and saved successfully');
             res.send('Image received and saved successfully');
         }
     });

     const params = {
        Bucket: bucketName,
        Key: imageName, // Name of the file in S3
        Body: fs.createReadStream(imagePath) // Path to local file
    };
    s3.upload(params, (err, data) => {
        if (err) {
            console.error('S3 upload error:', err);
        } else {
            console.log('File uploaded successfully:', data.Location);
        }
    });
});

app.listen('10001',()=>{console.log('server started on port: 10001')})