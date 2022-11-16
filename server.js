const express = require('express')
const { append } = require('express/lib/response')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')


app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})



let joinee=[];
function appendroom(room){
  let isroom=false
  for(let i=0; i<joinee.length;i++){
    if(joinee[i].room==room){
      joinee[i].user+=1;
      isroom=true;
    }
  }
  if (isroom==false){
    joinee.push({room:room,user:1});
  }
}
io.on('connection', socket => {
  
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    appendroom(roomId)
    joinee.user+=1;
    io.to(roomId).emit('joinee-detected', joinee)
  

    
    socket.broadcast.to(roomId).emit('user-connected', userId)

    socket.on('message',message=>{
      io.to(roomId).emit('createMessage',message)
    })



    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT || '3000')
