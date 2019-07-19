"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UInt24 {
    /**
     * 读一个 int24
     * @param buffer
     * @param offset
     * @param littleEndian
     */
    static read(dataView, offset, littleEndian = false) {
        let buffer = dataView.buffer;
        if (littleEndian) {
            var number = buffer[0 + offset] | (buffer[1 + offset] << 8) | (buffer[2 + offset] << 16);
            return number;
        }
        return buffer[2 + offset] | (buffer[1 + offset] << 8) | (buffer[0 + offset] << 16);
    }
    /**
     * 写入 int24
     * @param buffer buffer
     * @param value 写入的数字
     * @param offset 写入偏移量
     * @param littleEndian 默认大端
     */
    static write(dataView, offset, value, littleEndian = false) {
        let buffer = dataView.buffer;
        if (littleEndian) {
            buffer[0 + offset] = value & 0xff;
            buffer[1 + offset] = (value & 0xff00) >> 8;
            buffer[2 + offset] = (value & 0xff0000) >> 16;
        }
        else {
            buffer[2 + offset] = value & 0xff;
            buffer[1 + offset] = (value & 0xff00) >> 8;
            buffer[0 + offset] = (value & 0xff0000) >> 16;
        }
    }
}
/**
 *16777215
 */
UInt24.MaxVlaue = 0xFFFFFF;
UInt24.MiniValue = 0;
exports.UInt24 = UInt24;
//# sourceMappingURL=UInt24.js.map