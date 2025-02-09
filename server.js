const express = require('express');
const httpProxy = require('http-proxy');
const morgan = require('morgan');
const cache = require('./cache');
const { shouldBlockRequest } = require('./filter');
const { morganStream } = require('./monitor');
const mime = require('mime');


const app = express();
const proxy = httpProxy.createProxyServer({});
const PORT = 3000;

// 使用 morgan 紀錄 log
app.use(morgan('combined', { stream: morganStream }));

app.use(async (req, res) => {
  const cacheKey = req.url;

  try {
    // 檢查 request 來源是否要應該要被拒絕
    const {  shouldBlock, message } = shouldBlockRequest(req);
    if (shouldBlock) {
      return res.status(403).send(message);
    }

    // 檢查 cache
    const cachedResponse = await cache.get(req.url);
    if (cachedResponse) {
      const originalUserAgent = req.headers['user-agent'] || 'Unknown User-Agent';
      console.log(`[Proxy Server] Request from: ${originalUserAgent}`);
      console.log(`[Cache Hit] ${req.url}`);
      res.setHeader('Content-Type', cachedResponse.contentType);

      if (cachedResponse.contentType === 'text/html') {
        res.setHeader('Content-Disposition', 'inline');
      }

      res.end(cachedResponse.data);
      return;
    }

    const targetUrl = 'http://localhost:3001';
    // 取得 client 的 request 資訊
    const originalUserAgent = req.headers['user-agent'] || 'Unknown User-Agent';
    console.log(`[Proxy Server] Request from: ${originalUserAgent}`);
    proxy.web(req, res, { 
        target: targetUrl,
        secure: false,
        selfHandleResponse: true,
        headers: {
            'User-Agent': 'ProxyServer/1.0'
        }
    }, (err) => {
      console.error(`[Proxy Error] ${err.message}`);
      res.status(500).send('Proxy Error');
    });


    // 將 response 存入 cache
    proxy.once('proxyRes', (proxyRes) => {
      const dataBuffer = [];

      proxyRes.on('data', (chunk) => {
        dataBuffer.push(chunk);
      });

      proxyRes.on('end', async () => {
        const completeBuffer = Buffer.concat(dataBuffer);
        let contentType = proxyRes.headers['content-type'];

        if (!contentType) {
          contentType = mime.getType(req.url) || 'application/octet-stream';
        }

        console.log(`[Cache Store] Caching response for: ${req.url}`);
        await cache.set(cacheKey, { data: completeBuffer, contentType });
        res.setHeader('Content-Type', contentType);

        if (contentType === 'text/html') {
          res.setHeader('Content-Disposition', 'inline');
        }
        
        res.end(completeBuffer);
      });
    });

    proxy.once('error', (err) => {
      console.error(`[Proxy Error] ${err.message}`);
      if (!res.headersSent) {
        res.status(500).send('Proxy Error');
      }
    });
  } catch (err) {
    console.error(`[Error] ${err.message}`);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Forward Proxy Server running at http://localhost:${PORT}`);
});