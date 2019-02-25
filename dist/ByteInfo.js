"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Map1 = {};
const classPool = [];
class Buffer {
    /**
     * 从 buffer 中反射 出 一个 classType 实例
     * @param classType
     * @param buffer
     */
    static ReadObject(classType, buffer) {
        var offSet = 0;
        var object = new classType();
        var dataView = new DataView(buffer);
        for (var propertyKey in object) {
            var byteInfo = Reflect.getMetadata("ByteMember", object, propertyKey);
            if (byteInfo === undefined)
                continue;
            var propertyLength = this.readProperty(dataView, offSet, byteInfo, object, propertyKey);
            offSet += propertyLength;
        }
        return object;
    }
    static readProperty(dataView, offSet, byteInfo, object, propertyKey) {
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
                let objectLength = dataView.getUint8(offSet); //得到object 的长度
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
    static readUint8Array(dataView, offset, object, propertyKey) {
        var length = dataView.getUint8(offset);
        offset += 1;
        var array = [];
        for (var i = 0; i < length; i++, offset++) {
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
    static readString(dataView, offset, object, propertyKey) {
        var length = dataView.getUint8(offset);
        offset += 1;
        var chars = [];
        for (var i = 0; i < length / 2; i++, offset += 2) {
            chars.push(dataView.getUint16(offset));
        }
        var str = String.fromCharCode.apply(null, chars);
        object[propertyKey] = str;
        return length + 1;
    }
    static WirteObject(obj) {
        var offSet = 0;
        var catheBuffer = new ArrayBuffer(128);
        var dataView = new DataView(catheBuffer);
        for (var key in obj) {
            var byteInfo = Reflect.getMetadata("ByteMember", obj, key);
            if (byteInfo === undefined)
                continue;
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
    static writeProperty(dataView, offSet, type, value) {
        switch (type) {
            case ByteType.Uint8:
                dataView.setUint8(offSet, value);
                return 1;
            case ByteType.Int8:
                dataView.setInt8(offSet, value);
                return 1;
            case ByteType.Uint16:
                dataView.setUint16(offSet, value);
                return 2;
            case ByteType.Int16:
                dataView.setInt16(offSet, value);
                return 2;
            case ByteType.Int32:
                dataView.setInt32(offSet, value);
                return 4;
            case ByteType.Float32:
                dataView.setFloat32(offSet, value);
                return 4;
            case ByteType.Float64:
                dataView.setFloat64(offSet, value);
                return 8;
            case ByteType.Object:
                return Buffer.GetObjectLength(value);
            case ByteType.String:
                return Buffer.writeString(dataView, offSet, value);
            //数组
            case ByteType.UInt8Array:
                return 1 * value.length;
            case ByteType.Int8Array:
                return 1 * value.length;
            case ByteType.Uint16Array:
                return 2 * value.length;
            case ByteType.Int16Array:
                return 2 * value.length;
            case ByteType.Int32Array:
                return 4 * value.length;
            case ByteType.Float32Array:
                return 4 * value.length;
            case ByteType.Float64Array:
                return 8 * value.length;
            case ByteType.ObjectArray:
                return Buffer.getObjectArrayLength(value);
            case ByteType.StringArray:
                return Buffer.getStringArrayLength(value);
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
    static writeString(dataView, offset, str) {
        var length = str.length * 2; // 2个字节
        dataView.setUint8(offset, length); // 1 字节写入长度
        offset++;
        for (var i = 0; i < str.length; i++, offset += 2) {
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
    static GetObjectLength(obj) {
        var objectLength = 0;
        if (obj === null || obj === undefined) {
            return objectLength;
        }
        for (var key in obj) {
            var byteInfo = Reflect.getMetadata("ByteMember", obj, key);
            if (byteInfo === undefined)
                continue;
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
    static getPropertyLength(type, value) {
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
                return Buffer.GetObjectLength(value);
            case ByteType.String:
                return Buffer.getStringLength(value);
            //数组
            case ByteType.UInt8Array:
                return 1 * value.length;
            case ByteType.Int8Array:
                return 1 * value.length;
            case ByteType.Uint16Array:
                return 2 * value.length;
            case ByteType.Int16Array:
                return 2 * value.length;
            case ByteType.Int32Array:
                return 4 * value.length;
            case ByteType.Float32Array:
                return 4 * value.length;
            case ByteType.Float64Array:
                return 8 * value.length;
            case ByteType.ObjectArray:
                return Buffer.getObjectArrayLength(value);
            case ByteType.StringArray:
                return Buffer.getStringArrayLength(value);
        }
    }
    static getStringLength(str) {
        return str.length * 2 + 1; // 长度的 2 倍 ， 并用一位标识 长度
    }
    static getStringArrayLength(strArray) {
        var length = 0;
        for (var i = 0; i < strArray.length; i++) {
            length += this.getStringLength(strArray[i]);
        }
        return length;
    }
    static getObjectArrayLength(objArray) {
        var length = 0;
        for (var i = 0; i < objArray.length; i++) {
            length += this.GetObjectLength(objArray[i]);
        }
        return length;
    }
}
exports.Buffer = Buffer;
/**
 * ByteMember 属性修饰
 * @param order
 * @param type
 */
function ByteMember(order, type, fun = null) {
    return Reflect.metadata("ByteMember", new ByteInfo(order, type, fun));
}
exports.ByteMember = ByteMember;
/**类修饰
 *
 */
function BtyeContract(target) {
}
exports.BtyeContract = BtyeContract;
/**
 * 要写入的 byte 类型
 */
class ByteInfo {
    constructor(order, type, fun = null) {
        this.Order = order;
        this.Type = type;
        this.Function = fun;
    }
}
exports.ByteInfo = ByteInfo;
/**
 *Byte Type 枚举类型
 */
var ByteType;
(function (ByteType) {
    ByteType[ByteType["Int8"] = 1] = "Int8";
    ByteType[ByteType["Uint8"] = 2] = "Uint8";
    ByteType[ByteType["Int16"] = 3] = "Int16";
    ByteType[ByteType["Uint16"] = 4] = "Uint16";
    ByteType[ByteType["Int32"] = 5] = "Int32";
    ByteType[ByteType["Uint32"] = 6] = "Uint32";
    ByteType[ByteType["Float32"] = 7] = "Float32";
    ByteType[ByteType["Float64"] = 8] = "Float64";
    ByteType[ByteType["String"] = 9] = "String";
    ByteType[ByteType["Object"] = 10] = "Object";
    //数组
    ByteType[ByteType["Int8Array"] = 10] = "Int8Array";
    ByteType[ByteType["UInt8Array"] = 11] = "UInt8Array";
    ByteType[ByteType["Int16Array"] = 13] = "Int16Array";
    ByteType[ByteType["Uint16Array"] = 14] = "Uint16Array";
    ByteType[ByteType["Int32Array"] = 15] = "Int32Array";
    ByteType[ByteType["Uint32Array"] = 16] = "Uint32Array";
    ByteType[ByteType["Float32Array"] = 17] = "Float32Array";
    ByteType[ByteType["Float64Array"] = 18] = "Float64Array";
    ByteType[ByteType["StringArray"] = 19] = "StringArray";
    ByteType[ByteType["ObjectArray"] = 20] = "ObjectArray";
})(ByteType = exports.ByteType || (exports.ByteType = {}));
//反射对象 https://zhuanlan.zhihu.com/p/22962797
function Instance(_constructor) {
    return new _constructor;
}
exports.Instance = Instance;
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
//# sourceMappingURL=ByteInfo.js.map