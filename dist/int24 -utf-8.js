"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toString = Object.prototype.toString;
let BUFF8 = new Uint8Array(0x8000);
let BUFF16 = new Uint16Array(BUFF8.buffer);
let BUFF32 = new Uint32Array(BUFF8.buffer);
const expandBuffer = (expandWidth) => {
    const n = BUFF8.byteLength + expandWidth;
    let m = BUFF8.byteLength;
    while (m < n)
        m *= 2;
    const bytes = new Uint8Array(m);
    bytes.set(BUFF8);
    BUFF8 = bytes;
    BUFF16 = new Uint16Array(bytes.buffer);
    BUFF32 = new Uint32Array(bytes.buffer);
};
class DataView2 {
    constructor(buffer, byteOffset, byteLength) {
        if (typeof buffer === "number") {
            this.view = new DataView(new ArrayBuffer(buffer));
        }
        else {
            switch (toString.call(buffer)) {
                case "[object ArrayBuffer]":
                    byteOffset = byteOffset || 0;
                    byteLength = byteLength || buffer.byteLength;
                    this.view = new DataView(buffer, byteOffset, byteLength);
                    break;
                case "[object Uint8Array]":
                case "[object Uint8ClampedArray]":
                case "[object CanvasPixelArray]":
                case "[object Int8Array]":
                case "[object Uint16Array]":
                case "[object Int16Array]":
                case "[object Uint32Array]":
                case "[object Int32Array]":
                case "[object Float32Array]":
                case "[object Float64Array]":
                case "[object DataView]":
                    if (byteOffset === undefined && byteLength === undefined) {
                        this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                    }
                    else if (byteOffset !== undefined && byteLength === undefined) {
                        this.view = new DataView(buffer.buffer, buffer.byteOffset + byteOffset);
                    }
                    else if (byteOffset === undefined && byteLength !== undefined) {
                        this.view = new DataView(buffer.buffer, buffer.byteOffset, byteLength);
                    }
                    else {
                        this.view = new DataView(buffer.buffer, byteOffset, byteLength);
                    }
                    break;
                default:
                    throw new TypeError();
            }
        }
        this.buffer = this.view.buffer;
        this.byteOffset = this.view.byteOffset;
        this.byteLength = this.view.byteLength;
    }
    getUint8(byteOffset) {
        return this.view.getUint8(byteOffset);
    }
    setUint8(byteOffset, value) {
        this.view.setUint8(byteOffset, value);
    }
    getInt8(byteOffset) {
        return this.view.getInt8(byteOffset);
    }
    setInt8(byteOffset, value) {
        this.view.setInt8(byteOffset, value);
    }
    getUint16(byteOffset, littleEndian = false) {
        return this.view.getUint16(byteOffset, littleEndian);
    }
    setUint16(byteOffset, value, littleEndian = false) {
        this.view.setUint16(byteOffset, value, littleEndian);
    }
    getInt16(byteOffset, littleEndian = false) {
        return this.view.getInt16(byteOffset, littleEndian);
    }
    setInt16(byteOffset, value, littleEndian = false) {
        this.view.setInt16(byteOffset, value, littleEndian);
    }
    getUint32(byteOffset, littleEndian = false) {
        return this.view.getUint32(byteOffset, littleEndian);
    }
    setUint32(byteOffset, value, littleEndian = false) {
        this.view.setUint32(byteOffset, value, littleEndian);
    }
    getInt32(byteOffset, littleEndian = false) {
        return this.view.getInt32(byteOffset, littleEndian);
    }
    setInt32(byteOffset, value, littleEndian = false) {
        this.view.setInt32(byteOffset, value, littleEndian);
    }
    getFloat32(byteOffset, littleEndian = false) {
        return this.view.getFloat32(byteOffset, littleEndian);
    }
    setFloat32(byteOffset, value, littleEndian = false) {
        this.view.setFloat32(byteOffset, value, littleEndian);
    }
    getFloat64(byteOffset, littleEndian = false) {
        return this.view.getFloat64(byteOffset, littleEndian);
    }
    setFloat64(byteOffset, value, littleEndian = false) {
        this.view.setFloat64(byteOffset, value, littleEndian);
    }
    getString(byteOffset, byteLength) {
        const bytes = new Uint8Array(this.buffer, this.byteOffset + byteOffset, byteLength);
        return String.fromCharCode.apply(null, bytes);
    }
    setString(byteOffset, s) {
        const bytes = new Uint8Array(this.buffer, this.byteOffset + byteOffset);
        let i = s.length;
        while (i)
            bytes[--i] = s.charCodeAt(i);
    }
    getUTF8String(byteOffset, byteLength) {
        const bytes = new Uint8Array(this.buffer, this.byteOffset + byteOffset, this.byteLength);
        return DataView2.UTF8BytesToString(bytes);
    }
    static stringToUTF8Bytes(s) {
        let n = s.length, idx = -1, buff = BUFF8, byteLength = buff.byteLength, i, c;
        for (i = 0; i < n; ++i) {
            c = s.charCodeAt(i);
            if (c <= 0x7f) {
                buff[++idx] = c;
            }
            else if (c <= 0x7ff) {
                buff[++idx] = 0xc0 | (c >>> 6);
                buff[++idx] = 0x80 | (c & 0x3f);
            }
            else if (c <= 0xffff) {
                buff[++idx] = 0xe0 | (c >>> 12);
                buff[++idx] = 0x80 | ((c >>> 6) & 0x3f);
                buff[++idx] = 0x80 | (c & 0x3f);
            }
            else {
                buff[++idx] = 0xf0 | (c >>> 18);
                buff[++idx] = 0x80 | ((c >>> 12) & 0x3f);
                buff[++idx] = 0x80 | ((c >>> 6) & 0x3f);
                buff[++idx] = 0x80 | (c & 0x3f);
            }
            if (byteLength - idx <= 4) {
                expandBuffer(4);
                buff = BUFF8;
            }
        }
        const bytes = new Uint8Array(++idx);
        bytes.set(buff.subarray(0, idx));
        return bytes;
    }
    static UTF8BytesToString(bytes) {
        const n = bytes.byteLength;
        const buff = BUFF32;
        let idx = 0;
        let i = 0;
        let c;
        let ret = "";
        while (i < n) {
            for (idx = 0; idx < 0x1000 && i < n; ++i, ++idx) {
                c = bytes[i];
                if (c < 0x80) {
                    buff[idx] = c;
                }
                else if (c >>> 5 === 0x06) {
                    buff[idx] = (c & 0x1f) << 6;
                    buff[idx] |= bytes[++i] & 0x3f;
                }
                else if (c >>> 4 === 0x0e) {
                    buff[idx] = (c & 0x0f) << 12;
                    buff[idx] |= (bytes[++i] & 0x3f) << 6;
                    buff[idx] |= bytes[++i] & 0x3f;
                }
                else {
                    buff[idx] = (c & 0x07) << 18;
                    buff[idx] |= (bytes[++i] & 0x3f) << 12;
                    buff[idx] |= (bytes[++i] & 0x3f) << 6;
                    buff[idx] |= bytes[++i] & 0x3f;
                }
            }
            ret += String.fromCharCode.apply(null, buff.subarray(0, idx));
        }
        return ret;
    }
    setUTF8String(byteOffset, s) {
        const UTF8Bytes = DataView2.stringToUTF8Bytes(s);
        const bytes = new Uint8Array(this.buffer, this.byteOffset, this.byteLength);
        bytes.set(UTF8Bytes, byteOffset);
        return UTF8Bytes.length;
    }
    getUint24(byteOffset, littleEndian = false) {
        const b = new Uint8Array(this.buffer, this.byteOffset + byteOffset);
        return littleEndian
            ? b[0] | (b[1] << 8) | (b[2] << 16)
            : b[2] | (b[1] << 8) | (b[0] << 16);
    }
    setUint24(byteOffset, value, littleEndian = false) {
        const b = new Uint8Array(this.buffer, this.byteOffset + byteOffset);
        if (littleEndian) {
            b[0] = value & 0xff;
            b[1] = (value & 0xff00) >> 8;
            b[2] = (value & 0xff0000) >> 16;
        }
        else {
            b[2] = value & 0xff;
            b[1] = (value & 0xff00) >> 8;
            b[0] = (value & 0xff0000) >> 16;
        }
    }
    getInt24(byteOffset, littleEndian = false) {
        const v = this.getUint24(byteOffset, littleEndian);
        return v & 0x800000 ? v - 0x1000000 : v;
    }
    setInt24(byteOffset, value, littleEndian = false) {
        this.setUint24(byteOffset, value, littleEndian);
    }
}
exports.DataView2 = DataView2;
//# sourceMappingURL=int24 -utf-8.js.map