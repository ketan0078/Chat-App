
const socket=io()

const $messageform=document.querySelector('#messageform')
const $messageforminput=$messageform.querySelector('input')
const $messageformbutton=$messageform.querySelector('button')
const $sendlocationbutton=document.querySelector('#send-location')
const $message=document.querySelector('#message')



const messagetemplate=document.querySelector('#messagetemplate').innerHTML
const locationmessagetemplate=document.querySelector('#locationmessagetemplate').innerHTML
const sidebartemplate=document.querySelector('#sidebartemplate').innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const scrolldown=()=>{
    const $newmessage=$message.lastElementChild
    
    const newmessagestyles=getComputedStyle($newmessage)
    const newmessagemargin=parseInt(newmessagestyles.marginBottom)
    const newmessageheight=$newmessage.offsetHeight+newmessagemargin

    const visibleheight=$message.offsetHeight

    const containerheight=$message.scrollHeight

    const scrolloffset=$message.scrollTop+visibleheight
    if(containerheight-newmessageheight<=scrolloffset){
      $message.scrollTop=$message.scrollHeight
    }

}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messagetemplate,{
       username:message.username,
       message:message.text,
       createdAt:moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    scrolldown()
})
socket.on('locationmessage',(msg)=>{
console.log(msg)
const html=Mustache.render(locationmessagetemplate,{
    username:msg.username,
    URL:msg.texturl,
    createdAt:moment(msg.createdAt).format('h:mm a')
})
$message.insertAdjacentHTML('beforeend',html)
scrolldown()
})

socket.on('roomdata',({room,users})=>{
   const html=Mustache.render(sidebartemplate,{
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML=html
})


$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageformbutton.setAttribute('disabled','disabled')


    const message=e.target.elements.message.value
    // const message=document.querySelector('input').value
socket.emit('sendmessage',message,(error)=>{

    $messageformbutton.removeAttribute('disabled')
    $messageforminput.value=''
    $messageforminput.focus()
if(error){
    return console.log(error)
}
console.log('message delivered!')
})
})
$sendlocationbutton.addEventListener('click',()=>{
 if(!navigator.geolocation){
     return alert('geolocation not supported on your browser')
 }

 $sendlocationbutton.setAttribute('disabled','disabled')
 navigator.geolocation.getCurrentPosition((position)=>{
     
     socket.emit('sendlocation',{
         latitude:position.coords.latitude,
         longitude:position.coords.longitude
     },()=>{
         $sendlocationbutton.removeAttribute('disabled')
         console.log('location shared!')
     })
 })

})
socket.emit('join',{username,room},(error)=>{
if(error){
    alert(error)
    location.href='/'
}
})