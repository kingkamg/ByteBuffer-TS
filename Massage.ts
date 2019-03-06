import { ByteMember, ByteType, BtyeContract } from './ByteInfo';


export enum MessageType {
    join = 1,
    move = 2,
}

@BtyeContract
export class User {
    @ByteMember(1, ByteType.Uint16)
    public Id: number ;
    @ByteMember(2, ByteType.String)
    public Name: String ;
    @ByteMember(3, ByteType.Int32Array)
    public IdList: number[];
}

/**测试 */
@BtyeContract
export class Role {
    @ByteMember(1, ByteType.Uint16)
    public Id: number;
    @ByteMember(2, ByteType.String)
    public Name: string;
}

/**
 * 实体需要一个初始值，反射使用
 */
@BtyeContract
export class Msg {

    @ByteMember(1, ByteType.Uint8)
    public MessageType: MessageType = MessageType.join;

    @ByteMember(2, ByteType.Uint16)
    public Id: number = 0;

    @ByteMember(3, ByteType.Uint8)
    public Bool: boolean;

    @ByteMember(4, ByteType.String)
    public Name: string;

    @ByteMember(5, ByteType.String)
    public Address: string ;

    @ByteMember(6, ByteType.Object, User)
    public User: User ;

    @ByteMember(7, ByteType.UInt8Array)
    public IdList: number[];
   
    @ByteMember(8, ByteType.Int32Array)
    public IdList2: number[];

    @ByteMember(9, ByteType.ObjectArray, User)
    public UserList:Array<User>;
}

