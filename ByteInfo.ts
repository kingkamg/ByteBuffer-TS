import { Msg } from "./Msg";


const Map1: { [key: string]: number; } = {};

const classPool: Array<Function> = [];



export class Buffer {

    /**
     * 从 buffer 中反射 出 一个 classType 实例
     * @param classType 
     * @param buffer 
     */
    public static ReadObject<T>(classType: any, buffer: ArrayBuffer): T {
        var offSet = 0;
        var object = new classType();
        var dataView = new DataView(buffer);
        for (var propertyKey in object) {
            var byteInfo = <ByteInfo>Reflect.getMetadata("ByteMember", object, propertyKey);
            if (byteInfo === undefined) continue;
            var propertyLength = this.readProperty(dataView, offSet, byteInfo, object, propertyKey);
            offSet += propertyLength;
        }
        return object;
    }


    private static readProperty(dataView: DataView, offSet: number, byteInfo: ByteInfo, object: Object, propertyKey: string): number {
        var type = byteInfo.Type;
        switch (type) {
            case ByteType.Uint8:
                object[propertyKey] = dataView.getUint8(offSet);
                return 1;
            case ByteType.Int8:
                object[propertyKey] = dataView.getInt8(offSet);
                return 1;
            case ByteType.Uint16:
                object[propertyKey] = dataView.getUint16(offSet);
                return 2;
            case ByteType.Int16:
                object[propertyKey] = dataView.getInt16(offSet);
                return 2;
            case ByteType.Int32:
                object[propertyKey] = dataView.getInt32(offSet);
                return 4;
            case ByteType.Float32:
                object[propertyKey] = dataView.getFloat32(offSet);
                return 4;
            case ByteType.Float64:
                object[propertyKey] = dataView.getFloat64(offSet);
                return 8;
            case ByteType.String:
                return Buffer.readString(dataView, offSet, object, propertyKey);
            case ByteType.Object:
                let objectLength = dataView.getUint8(offSet);//得到object 的长度
                offSet++;
                let objectBuffer = dataView.buffer.slice(offSet, objectLength);
                object[propertyKey] = Buffer.ReadObject(byteInfo.Function, objectBuffer);
                return objectLength + 1;

            //array
            case ByteType.UInt8Array:
                return Buffer.readUint8Array(dataView, offSet, object, propertyKey);
            case ByteType.Int8Array:
                return Buffer.readInt8Array(dataView, offSet, object, propertyKey);
            case ByteType.Uint16Array:
                return Buffer.readUint16Array(dataView, offSet, object, propertyKey);
            case ByteType.Int16Array:
                return Buffer.readInt16Array(dataView, offSet, object, propertyKey);
            case ByteType.Int32Array:
                return Buffer.readInt32Array(dataView, offSet, object, propertyKey);
            case ByteType.Float32Array:
                return Buffer.readFloat32Array(dataView, offSet, object, propertyKey);
            case ByteType.Float64Array:
                return Buffer.readFloat64Array(dataView, offSet, object, propertyKey);
            case ByteType.StringArray:
                return Buffer.readString(dataView, offSet, object, propertyKey);
            case ByteType.ObjectArray:
                return Buffer.readString(dataView, offSet, object, propertyKey);
        }

    }

    private static readUint8Array(dataView: DataView, offset: number, object: Object, propertyKey: string): number {
        var length = dataView.getUint8(offset);
        offset += 1;
        var array = [];
        for (var i = 0; i < length; i++ , offset++) {
            array.push(dataView.getUint8(offset));
        }
        object[propertyKey] = array;
        return length + 1;
    }


    /**
      * 从buf 中读取 string
      * @param buf 
      * @param offset 开始
      * @param length 长度
      */
    private static readString(dataView: DataView, offset: number, object: Object, propertyKey: string): number {
        var length = dataView.getUint8(offset);
        offset += 1;
        var chars = [];
        for (var i = 0; i < length / 2; i++ , offset += 2) {
            chars.push(dataView.getUint16(offset));
        }
        var str = String.fromCharCode.apply(null, chars);
        object[propertyKey] = str;
        return length + 1;
    }




    public static WirteObject(obj: Object) {
        var offSet = 0;
        var catheBuffer = new ArrayBuffer(128);
        var dataView = new DataView(catheBuffer);
        for (var key in obj) {
            var byteInfo = <ByteInfo>Reflect.getMetadata("ByteMember", obj, key);
            if (byteInfo === undefined) continue;
            var propertyLength = this.writeProperty(dataView, offSet, byteInfo.Type, obj[key]);
            offSet += propertyLength;
        }
        var buffer = catheBuffer.slice(0, offSet);
        return buffer;
    }


    /**
    * 把属性 Property 写入 二进制，并返回写入了的长度
    * @param type 
    * @param value 
    */
    private static writeProperty(dataView: DataView, offSet: number, type: ByteType, value: any): number {
        switch (type) {
            case ByteType.Uint8:
                dataView.setUint8(offSet, value as number)
                return 1;
            case ByteType.Int8:
                dataView.setInt8(offSet, value as number)
                return 1;
            case ByteType.Uint16:
                dataView.setUint16(offSet, value as number)
                return 2;
            case ByteType.Int16:
                dataView.setInt16(offSet, value as number)
                return 2;
            case ByteType.Int32:
                dataView.setInt32(offSet, value as number)
                return 4;
            case ByteType.Float32:
                dataView.setFloat32(offSet, value as number)
                return 4;
            case ByteType.Float64:
                dataView.setFloat64(offSet, value as number)
                return 8;
            case ByteType.Object:
                return Buffer.GetObjectLength(value as object)
            case ByteType.String:
                return Buffer.writeString(dataView, offSet, value as string);

            //数组
            case ByteType.UInt8Array:
                return 1 * (value as Array<number>).length;
            case ByteType.Int8Array:
                return 1 * (value as Array<number>).length;
            case ByteType.Uint16Array:
                return 2 * (value as Array<number>).length;
            case ByteType.Int16Array:
                return 2 * (value as Array<number>).length;
            case ByteType.Int32Array:
                return 4 * (value as Array<number>).length;
            case ByteType.Float32Array:
                return 4 * (value as Array<number>).length;
            case ByteType.Float64Array:
                return 8 * (value as Array<number>).length;

            case ByteType.ObjectArray:
                return Buffer.getObjectArrayLength(value as Array<object>)
            case ByteType.StringArray:
                return Buffer.getStringArrayLength(value as Array<string>)
        }

    }

    /**
     * 把一个字符串 写入到 dv 中，并返回 长度 【2*length+1】
     * 每个字符占用2个字节
     * 第一个位 写入 字符串的长度
     * @param dataView 
     * @param offset 
     * @param str 
     */
    private static writeString(dataView: DataView, offset: number, str: string): number {
        var length = str.length * 2;      // 2个字节
        dataView.setUint8(offset, length);// 1 字节写入长度
        offset++;
        for (var i = 0; i < str.length; i++ , offset += 2) {
            dataView.setUint16(offset, str.charCodeAt(i));
        }
        return length + 1;
    }


    //#endregion


    //#region  长度  计算
    /**
     * 得到 object 对象 二进制 长度
     * @param obj 
     */
    public static GetObjectLength(obj: Object) {

        var objectLength = 0;
        if (obj === null || obj === undefined) {
            return objectLength;
        }
        for (var key in obj) {
            var byteInfo = <ByteInfo>Reflect.getMetadata("ByteMember", obj, key);
            if (byteInfo === undefined) continue;
            var propertyLength = this.getPropertyLength(byteInfo.Type, obj[key]);
            objectLength += propertyLength;
        }
        return objectLength;
    }



    /**
     * 得到 属性 二进制 长度
     * @param type 
     * @param value 
     */
    private static getPropertyLength(type: ByteType, value: string | object | []): number {
        switch (type) {
            case ByteType.Uint8:
                return 1;
            case ByteType.Int8:
                return 1;
            case ByteType.Uint16:
                return 2;
            case ByteType.Int16:
                return 2;
            case ByteType.Int32:
                return 4;
            case ByteType.Float32:
                return 4;
            case ByteType.Float64:
                return 8;
            case ByteType.Object:
                return Buffer.GetObjectLength(value as object)
            case ByteType.String:
                return Buffer.getStringLength(value as string);

            //数组
            case ByteType.UInt8Array:
                return 1 * (value as Array<number>).length;
            case ByteType.Int8Array:
                return 1 * (value as Array<number>).length;
            case ByteType.Uint16Array:
                return 2 * (value as Array<number>).length;
            case ByteType.Int16Array:
                return 2 * (value as Array<number>).length;
            case ByteType.Int32Array:
                return 4 * (value as Array<number>).length;
            case ByteType.Float32Array:
                return 4 * (value as Array<number>).length;
            case ByteType.Float64Array:
                return 8 * (value as Array<number>).length;

            case ByteType.ObjectArray:
                return Buffer.getObjectArrayLength(value as Array<object>)
            case ByteType.StringArray:
                return Buffer.getStringArrayLength(value as Array<string>)
        }

    }

    private static getStringLength(str: string): number {
        return str.length * 2 + 1;// 长度的 2 倍 ， 并用一位标识 长度
    }

    private static getStringArrayLength(strArray: Array<string>): number {
        var length = 0
        for (var i = 0; i < strArray.length; i++) {
            length += this.getStringLength(strArray[i]);
        }
        return length;
    }

    private static getObjectArrayLength(objArray: Array<object>) {
        var length = 0;
        for (var i = 0; i < objArray.length; i++) {
            length += this.GetObjectLength(objArray[i]);
        }
        return length;
    }
    //#endregion
}

/**
 * ByteMember 属性修饰
 * @param order 
 * @param type 
 */
export function ByteMember(order: number, type: ByteType, fun: Function = null) {
    return Reflect.metadata("ByteMember", new ByteInfo(order, type, fun));
}

/**类修饰
 * 
 */
export function BtyeContract(target: any) {

}

/**
 * 要写入的 byte 类型
 */
export class ByteInfo {
    public Order: number;
    public Type: ByteType;
    public Function: Function;
    constructor(order: number, type: ByteType, fun: Function = null) {
        this.Order = order;
        this.Type = type;
        this.Function = fun;
    }
}

/**
 *Byte Type 枚举类型
 */
export enum ByteType {
    Int8 = 1,
    Uint8 = 2,
    Int16 = 3,
    Uint16 = 4,
    Int32 = 5,
    Uint32 = 6,
    Float32 = 7,
    Float64 = 8,
    String = 9,
    Object = 10,

    //数组
    Int8Array = 10,
    UInt8Array = 11,
    Int16Array = 13,
    Uint16Array = 14,
    Int32Array = 15,
    Uint32Array = 16,
    Float32Array = 17,
    Float64Array = 18,
    StringArray = 19,
    ObjectArray = 20,
}

//反射对象 https://zhuanlan.zhihu.com/p/22962797
export function Instance<T>(_constructor: { new(...args: Array<any>): T }): T {
    return new _constructor
}


// export interface IByteOptions {
//     Order: number;
//     Type: ByteType;
// }
// export class ByteWrite {

//     public static Valid(object: Object) {
//         for (var key in object) {
//             if (typeof key == "string" || typeof key == "number" || typeof key == "boolean") {
//                 var validate = <Validation>Reflect.getMetadata("ByteMember", object, key);
//                 if (validate !== undefined) {
//                     if (validate.Validate(object[key]) == false)
//                         return false;
//                 }
//             }
//         }
//         return true;
//     }
// }

// export interface IByteOptions {
//     Order: number;
//     Type: ByteType;
//     Number?: INumberOptions;
//     String?: IStringOptions;
// }
// export interface IStringOptions {
//     MinLength?: number;
//     MaxLength?: number;
// }

// export interface INumberOptions {
//     Min?: number;
//     Max?: number;
// }

// export interface ITimeValidationOptions {
//     Format: string;
//     Locale?: string;
// }

// export class Validation {

//     private static _validationRules: any = {
//         Number: (value: number, options: INumberOptions) => {
//             if (typeof value !== "number")
//                 return false;

//             if (options.Max !== undefined && options.Min !== undefined)
//                 return value < options.Max && value > options.Min;

//             return (options.Max !== undefined && value < options.Max) ||
//                 (options.Min !== undefined && value > options.Min);
//         },
//         String: (value: string, options: IStringOptions) => {
//             if (typeof value !== "string")
//                 return false;

//             if (options.MaxLength !== undefined && options.MinLength !== undefined)
//                 return value.length < options.MaxLength && value.length > options.MinLength;

//             return (options.MaxLength !== undefined && value.length < options.MaxLength) ||
//                 (options.MinLength !== undefined && value.length > options.MinLength);
//         },
//     };

//     constructor(private _options: IByteOptions) {
//     }

//     Validate(value: any): boolean {
//         for (var key in this._options) {
//             if (Validation._validationRules[key](value, this._options[key]) === false) {
//                 return false;
//             }
//         }
//         return true;
//     }
// }