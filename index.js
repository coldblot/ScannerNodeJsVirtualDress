const express=require('express');

const app=express();

app.get('test',(req,res)=>{
    res.send("Working!");
})

app.listen('2001',()=>{console.log('server started on port: 2001')})