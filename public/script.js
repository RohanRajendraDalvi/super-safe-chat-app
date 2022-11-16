const socket = io('/');
// var CryptoJS = require("crypto-js");
let disptext = document.getElementById('user-info');
let msg = document.getElementById('message');
let yourName = document.getElementById('name');
let downloadLink=document.getElementById('downloadchat');
let chat = "";

function generateRandomNumber() {
  var minm = 100000;
  var maxm = 999999;
  let t=Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  let m=`${t}`;
  return m
}

const myPeer = new Peer(undefined, {
debug:2
})


function t1Decrypt(text) {


  let entry = text;
  let half = Math.ceil(entry.length / 2);

  let str1 = entry.substr(0, half);
  let str2 = entry.substr(half);

  let t1_Decrypted = "";
  for (let i = 0; i < half; i++) {


    t1_Decrypted += str1[i];
    if (str2[i] != undefined) {
      t1_Decrypted += str2[i];
    }
    

  }
  return t1_Decrypted;
}

  function t1Encrypt(text) {


    let entry =text;
    let str1 = '';
    let str2 = '';

    for (let i = 0; i < entry.length; i++) {
      let t = entry[i];
      if (i % 2 == 0) {
        str1 += String(t);
      }
      if (i % 2 == 1) {
        str2 += String(t);
      }
    }

    let t1_encrypted = str1 + str2;


    return t1_encrypted;

  }

  function t2Decrypt(text) {
    let entry = text;
  
    text_length = entry.length;
    sideln = Math.ceil(Math.sqrt(text_length));
    sqrlen= sideln*sideln;
    nulentries=sqrlen-text_length;
     
    matrix = [];
    let p = 0;
    for (let i = 0; i < sideln; i++) {
      let col = [];
      for (let j = 0; j < sideln; j++) {
        if (p >= text_length) {
          col.push(null);
          p++;
        }
        else {
          col.push(0);
          p++;
        }

      }
      matrix.push(col);
    }

    p=0;

    for (let i = 0; i < sideln; i++) {
      for (let j = 0; j < sideln; j++) {
        if(matrix[j][i]==null){
          continue
        }
        else{
          matrix[j][i]=entry[p];
          p++;
        }
    
      }
    }
    let newtext = '';
    for (let i = 0; i < sideln; i++) {
      for (let j = 0; j < sideln; j++) {
        if (matrix[i][j] == null) {
          continue
        }
        else {
          newtext += String(matrix[i][j]);
        }
      }
    }

    return newtext;

  }
  function t2Encrypt(text) {
    let entry =text;
    text_length = entry.length;
    sideln = Math.ceil(Math.sqrt(text_length));


    matrix = [];
    let p = 0;
    for (let i = 0; i < sideln; i++) {
      let col = [];
      for (let j = 0; j < sideln; j++) {
        if (p >= text_length) {
          col.push(null);
          p++;
        }
        else {
          col.push(entry[p]);
          p++;
        }

      }
      matrix.push(col);
    }


    let newtext = '';
    for (let i = 0; i < sideln; i++) {
      for (let j = 0; j < sideln; j++) {
        if (matrix[j][i] == null) {
          continue
        }
        else {
          newtext += String(matrix[j][i]);
        }
      }
    }


    return newtext;

  }









let displaytext = '';
const peers = {}

function start() {

  socket.on('user-connected', userId => {
    console.log(userId);
    connectToNewUser(userId);
    chat+=`<div class="border rounded m-1 " style="background-image: linear-gradient(to right, #8360c3, #2ebf91); align-self: end; text-align: center;"> user joined : uid:${userId}</div>`
    disptext.innerHTML = chat;

  })
}
start();

let switch1 =false;
let selfatt
function myentry(a){
  if(switch1==false){
    selfatt=a;
    switch1=true;
  }
}
let nextotp='1000';
let checkifotpin=false;


socket.on('joinee-detected',joinee=>{
  // if (joinee.user===1){
    console.log(joinee)

    for(let i=0; i<joinee.length;i++){
      if(joinee[i].room==ROOM_ID){
        attendees=joinee[i].user;
        myentry(attendees);
      }
    }
    nextotp=(attendees*777)%7777;  
    document.getElementById("nextotp").innerText=nextotp;
    document.getElementById("nexotp").innerText=((attendees+1)*777)%7777;  ;
    if (selfatt==1){
      document.getElementById("otpbox").style.visibility = "hidden";
    }
    if (selfatt>1&&checkifotpin==false){
      document.getElementById("chatplace").style.visibility = "hidden";
    }

  // }
})



function otpEnter(){
  console.log(document.getElementById("otp").value);
  console.log(nextotp)
  if(nextotp==document.getElementById("otp").value){
    checkifotpin=true;
    document.getElementById("chatplace").style.visibility = "";
    document.getElementById("otpbox").style.visibility = "hidden";
  };
}


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  myUserId=id;
  socket.emit('join-room', ROOM_ID, id)
})



function connectToNewUser(userId) {
  const call = myPeer.call(userId)
  peers[userId] = call
}


function sendmessage() {
  if(yourName.value=="") {
    alert('enter name')
  }
  if (msg.value.length !== 0) {

    let key=generateRandomNumber();

    var ciphertext = CryptoJS.AES.encrypt(msg.value, key).toString();
    console.log(`encrypted message:${ciphertext}`);
    ciphertext+=key;

    eTXT=t2Encrypt(t1Encrypt(ciphertext))
    content = {
      message: eTXT,
      Name: yourName.value
    }
;
    socket.emit('message', content);
    msg.value = '';
  }
}

let savingChat='';

socket.on('createMessage', content => {
  console.log(`encrypted & transposed message:${content.message}`);
  let combined=t1Decrypt(t2Decrypt(content.message));
  console.log(`combined message:${combined}`);
 let key=combined.slice(-6); 
 console.log(`seperated key:${key}`);
 let originalText = combined.slice(0,combined.length-6)
 var bytes  = CryptoJS.AES.decrypt(originalText, key);
 var dTXT = bytes.toString(CryptoJS.enc.Utf8);


  const date = new Date();
  if (content.Name==yourName.value){
  chat += `<div class="border rounded p-3" style=" background-image: linear-gradient(to right, #DECBA4, #3E5151); align-self: start; text-align: right;">${content.Name} <h5> ${dTXT}</h5>  <p style="font-size:x-small">${date.toDateString().toString()}\n${date.getHours().toString()}:${date.getMinutes().toString()}</p></div>`;
  }
  else{
    chat += `<div class="border rounded p-3" style="background-image: linear-gradient(to right, #8360c3, #2ebf91); align-self: end; text-align: left;">${content.Name} <h5> ${dTXT}</h5>  <p style="font-size:x-small">${date.toDateString().toString()}\n${date.getHours().toString()}:${date.getMinutes().toString()}</p></div>`;
  }
  disptext.innerHTML = chat;
  chat += '<br>';
  savingChat+=`${content.Name}:${dTXT}\n${date.toDateString().toString()}-${date.getHours().toString()}:${date.getMinutes().toString()} \n\n`

  var saveChat =new Blob(
    [savingChat],
    {type:"text/plain;charset=utf8"}
  );
  var url = window.URL.createObjectURL(saveChat);
  downloadLink.href =url;
  downloadLink.download='chat.txt'
  console.log(content.message)



})

var saveChat =new File(
  ["Hello World"],
  'demo.txt',
  {type:"text/plain;charset=utf8"}
);
