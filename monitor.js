const fs = require('fs');
const path = require('path');

// request log 紀錄到 monitor.log 中
const logStream = fs.createWriteStream(path.join(__dirname, 'monitor.log'), { flags: 'a' });

// 紀錄 request 流量
const morganStream = {
    write: (message) => {
      logStream.write(message);  // 寫入日誌文件
    }
  };

module.exports = {
    morganStream
};