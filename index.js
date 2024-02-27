const express=require('express');

const app=express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get('/test',(req,res)=>{
    res.send("Working!");
})

app.post("/imgdownload",(req,res)=>{
    console.log("working");
    res.send("img download!");
});

app.listen('10001',()=>{console.log('server started on port: 10001')})