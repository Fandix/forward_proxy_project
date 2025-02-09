# What is Forward Proxy?
Forward Proxy 是充當 client side 跟 server side 之間的橋樑，所有來自 client side 的 request 都會先進到 Forward Proxy 之後才會投過他將 request 傳遞給 server side。

## 使用 Forward Proxy 的好處：
今天教室裡有多個學生跟一位班長還有一位老師，老師是作為 server side 的存在，負責回答學生們問的問題，班長則是 Forward Proxy 讓多個學生 (client) 有問題可以透過班長向老師(server) 詢問。

1. **匿名和私有性**
對 server side 來說，所有的 request 都是由 Forward Proxy 而來，所以並不會知道該筆 request 是來自於哪一個 client，這樣可以有效地增加使用者的隱蔽性。
    
    <aside>

    > 對老師來說，老師並不能夠知道班長帶來的每一個問題都是哪一位同學問的，因為老師面對的只有班長一人。
    
    </aside>
    
2. **繞過訪問限制**
因為對 server side 來說，他並不知道 request 是來自於哪一個 client，所以 client 可以透過先將自己的 request 發給 Forward Proxy 後再由 Forward Proxy 發送 request 給 server，對於 server side 來說，如果 Forward Proxy 的 IP 是在訪問權限內的話，任何 client 只要透過他就可以訪問 server side。
    
    <aside>
    
    > 雖然這個班級的老師理論上只能回應自己班上學生的問題，但今天有一個別班的學生想問這個老師問題，直接問一定是會被打槍的，那麼他可以透過這個班的班長(Forward Proxy) 把這個問題帶給老師，老師就不會知道這個問題是來自別班的學生了
    
    </aside>
    
3. **內容過濾與緩存**
在 Forward Proxy 向 server side 訪問過一個比較大的 response 時可以將他 cache 住，當其他 client side 也要訪問同一個 response 時，可以直接從 Forward Proxy 的 Cache 中獲得，不用在跟 server side 取得一次，可以大大地減少消耗跟提高訪問效率。
    
    <aside>
    
    > 今天可能老師忘了佈置作業所以有很多學生(client)都想問老師(server)今天有沒有作業(同一個 response)，如果每一個同學都跑去問老師同一個問題，老師的壓力就會很大…，但今天班長(Forward Proxy)已經去問過老師一次了，其他同學如果也想問同樣的問題班長就可以直接回答而不用再去問老師，大大減少老師的壓力且增加回答問題的效率。
    > 
    </aside>
    
4. **監控和過濾流量提高 server side 的安全**
由於所有 client 的 request 都需要先經過 Forward Proxy 所以可以在這個階段紀錄並監控 request 的來源並對其做些限制，以保障 server side 的安全。
    
    <aside>

    > 所有同學(client)的問題(request)都會先經過班長(Forward Proxy)，所以班長可以在這麼多個問題中篩選一些比較值得問老師(server)的問題，限制問題的數量以減少老師的壓力。
    
    </aside>
    
5. **協議轉換**
今天如果 server side 是使用 HTTPS 的協議，但並非所有的 client side 都支援 HTTPS(有些還是使用 HTTP)，如果這種 client 直接訪問 server 就會失敗，但 client 可以透過 Forward Proxy 把 HTTP 轉成 HTTPS 這樣就可以和 server side 溝通了。
    
    <aside>
    
    > 今天如果是個雙語學校，老師是外國來的只聽得懂英文(HTTPS)，但班上有些同學還不會說英文只會說中文(HTTP)，他們需要問老師問題就需要透過班長。
    
    </aside>

---

# Installation
```
npm install
cd web-server
npm install
```

# Running
```
npm run start
cd web-server
npm run start
```
# Architecture
![architecture](https://ithelp.ithome.com.tw/upload/images/20250209/20124767y9w9ZHSNp7.jpg)

# Project Description
這是一個由 nodeJS 開發的簡單 Forward Proxy Server，可以將訪問 Proxy Server 的 request 轉發到 target server (Web server)，實現 Forward Proxy 的以下功能。

## 匿名與私有性
透過在 Proxy Server 和 Web server 中 console 出 request 的來源，可以發現 Web server 收到的 request 的來源都是 Proxy Server，而非直接來自於 client，而 Proxy Server 端收到的來源則可能是 Website 或是 Postman。

![client private](https://ithelp.ithome.com.tw/upload/images/20250209/20124767hn7SBuidkD.png)

可以從 log 中看出，Proxy Server (左邊) 紀錄了由不同來源發出的 request，而 Web server (右邊) 無論 client 是來自於哪一個來源，都只會收到來自於 Proxy Server 的 request。

## 緩存
利用 `node-cache` 實作 Proxy Server 的緩存功能，當某一個 client 第一次透過 proxy server 訪問一個較大的 response 時，Proxy Server 會將這個 response 暫存起來，當有相同的 request 時，可以直接從 Proxy Server 中取得 response，減少 Web server 的負擔。

![proxy cache](https://ithelp.ithome.com.tw/upload/images/20250209/20124767SXpaltGoVl.png)

可以從 log 中看出，第一次由 website 發出 request 時，Proxy server 將 response 暫存起來 `([Cache Store] Caching response for: /img)`，之後在由 Postman 發出相同的 request 時，可以看到 Proxy server 是由 Cache 中暫存的 response 回傳給 Postman 而沒有再向 Web server 發出 request，所以在 Web server (右邊) 的 log 中只會看到一次由 Proxy server 發出的 request。

## 監控與過濾
由於所有 client 的 request 都需要先經過 Proxy server 所以可以在這個階段紀錄並監控 request 的來源並對其做些限制，以保障 server side 的安全。

在 Proxy server 中添加了過濾功能，當 request 的來源是 `curl` 時，會將這個 request 拒絕，並回傳 `Blocked User-Agent: curl` 的訊息。
```javascript
// filter.js

const blacklistedUserAgents = [/curl/i];

module.exports = {
    const userAgentBlocked = blacklistedUserAgents.some((regex) => regex.test(req.headers['user-agent'] || ''));
    let message = '';

    if (userAgentBlocked) {
        message = `Blocked User-Agent: ${req.headers['user-agent']}`;
    }

    return { shouldBlock: userAgentBlocked, message };
}
```

```javascript
// server.js
const { shouldBlockRequest } = require('./filter');

app.use(async (req, res) => {
    // 檢查 request 來源是否要應該要被拒絕
    const {  shouldBlock, message } = shouldBlockRequest(req);
    if (shouldBlock) {
      return res.status(403).send(message);
    }
}
```

![filter](https://ithelp.ithome.com.tw/upload/images/20250209/20124767gyBeiWUsn7.png)

可以從 log 中看出，當 request 的來源是 `curl` 時，Proxy server 會將這個 request 拒絕，並回傳 `Blocked User-Agent: curl` 的訊息。

