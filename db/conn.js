const mongoose = require('mongoose');

function dbConnection(){
mongoose.connect(process.env.DB)
.then(()=>
{
    console.log("connection successful");
}).catch((e)=>
{
    console.log("No connection");
})
}
module.exports=dbConnection
