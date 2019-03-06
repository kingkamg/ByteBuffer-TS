
import { Msg, User, Role, MessageType } from './Massage';
import { Buffer } from './ByteInfo';

var user2=new User();
var msg = new Msg();//sss
msg.MessageType = MessageType.join;
msg.Address = "深圳";
msg.Bool = false;
msg.Name = "eric";
msg.Id = 1000;
var user=new User();
user.Id=1;
user.Name="user"
user.IdList=[1,2,3,4,5];
msg.User=user;

user2.Id=2;
user2.Name="use1";
msg.UserList=[];
msg.UserList.push(user2);
msg.UserList.push(user);

msg.IdList=[1,2,3,4];
msg.IdList2=[1,2,3,4];

var buffer = Buffer.WirteObject(msg);
console.info(buffer.byteLength);

console.info(JSON.stringify(msg).length) ;
var msg1 = Buffer.ReadObject(Msg, buffer);
console.info(msg1);

var date1_1=new Date().getTime();
for(let i=0;i<100000;i++){
   let jsonStr= JSON.stringify(msg);
   let obj= JSON.parse(jsonStr);
}
var date1_2=new Date().getTime();
console.info("json 耗时间："+ (date1_2-date1_1));

var time2_1=new Date().getTime();
for(let i=0;i<100000;i++){
    let bytes = Buffer.WirteObject(msg);
    let obj= Buffer.ReadObject(Msg,bytes);
}
var time2_2=new Date().getTime();
console.info("byte 耗时间："+ (time2_2-time2_1));

console.info("******* ***")