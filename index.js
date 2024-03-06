const express=require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const qrcode=require("qr-image");
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

let imageName;
app.post("/imgdownload",(req,res)=>{
    
     // Get raw image binary data from request body
     const imgbinary = req.body.imgbinary;
     const imageBuffer = Buffer.from(imgbinary, 'base64');
     imageName=`received_image_${Date.now()}.png`;
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

// Creation of qr with link
app.get("/createqr",(req,res)=>{
  const qrImage=qrcode.image(`3.236.165.100:10001/downloadS3BucketImage`,{type:"png"});
  qrImage.pipe(fs.createWriteStream("qr_code.png"));

  qrImage.on('end', () => {
    fs.readFile("qr_code.png", (err, data) => {
      if (err) {
        console.error("Error reading QR code file:", err);
        res.status(500).send("Error generating QR code");
      } else {
        const base64QR = Buffer.from(data).toString('base64');
        res.send(base64QR);
      }
    });
  });

  qrImage.on('error', (err) => {
    console.error("Error generating QR code:", err);
    res.status(500).send("Error generating QR code");
  });
});


app.get("/downloadS3BucketImage",async (req,res)=>{
    try {
        // Define S3 parameters
        const params = {
            Bucket: bucketName,
            Key: imageName // Key is the filename of the image you want to download
        };

        // Download image from S3 bucket
        const data = await s3.getObject(params).promise();

        // Save image to local file system
        const imagePath = path.join(__dirname, 'downloads', imageName); // Define path to save the image
        fs.writeFileSync(imagePath, data.Body);
        console.log(`File Download from s3 ${imageName}`)
        // Send the downloaded image as a response
        res.sendFile(imagePath);
    } catch (err) {
        console.error('Error downloading image:', err);
        res.status(500).send('Error downloading image');
    }
})

app.listen('10001',()=>{console.log('server started on port: 10001')})