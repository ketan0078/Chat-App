const generatemessage=(username,text)=>{
   return {  
       username,
       text,
    createdAt:new Date().getTime()}}
const generatelocationmessage=(username,texturl)=>{
    return{
        username,
        texturl,
        createdAt:new Date().getTime()
    }
}    
module.exports={generatemessage,generatelocationmessage}    