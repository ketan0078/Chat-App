const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const{ generatemessage,generatelocationmessage}=require('./utils/messages')
const{  addUser,removeuser,getuser,getusersinroom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)


const port=process.env.PORT||3000
const publicdirectorypath=path.join(__dirname,'../public')

app.use(express.static(publicdirectorypath))



io.on('connection',(socket)=>{
    console.log('new connection')

   socket.on('join',({username,room},callback)=>{
    const {error,user}=addUser({id:socket.id,username,room})

    if(error){
        return callback(error)
    }
    
    
      socket.join(user.room)

      socket.emit('message',generatemessage('ADMIN','welcome'))
      socket.broadcast.to(user.room).emit('message',generatemessage('ADMIN',`${user.username} has joined!!`))
      io.to(user.room).emit('roomdata',{
          room:user.room,
          users:getusersinroom(user.room)
      })

       callback()
   })
    socket.on('sendmessage',(message,callback)=>{
    const user=getuser(socket.id)
    
    const filter=new Filter()

    if(filter.isProfane(message)){
        return callback('profinity is not allowed')
    }

    io.to(user.room).emit('message',generatemessage(user.username,message))
    callback()

    })
    socket.on('sendlocation',(coords,callback)=>{
    const user=getuser(socket.id)
    io.to(user.room).emit('locationmessage',generatelocationmessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
    })

    socket.on('disconnect',()=>{
        const user=removeuser(socket.id)
        if(user){
            io.to(user.room).emit('message',generatemessage('ADMIN',`${user.username} has left`))
            io.to(user.room).emit('roomdata',{
                room:user.room,
                users:user.getusersinroom
            })
        }
    })
})
server.listen(port,()=>{
    console.log('app is up on port '+port)

})

