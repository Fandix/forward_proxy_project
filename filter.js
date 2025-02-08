const blacklistedUrls = ['/forbidden', '/blocked'];
const blacklistedUserAgents = [/curl/i];

module.exports = {
  shouldBlockRequest(req) {
    const urlBlocked = blacklistedUrls.includes(req.url);
    const userAgentBlocked = blacklistedUserAgents.some((regex) => regex.test(req.headers['user-agent'] || ''));
    let message = '';

    if (urlBlocked) {
        message = `Blocked URL: ${req.url}`;
    }

    if (userAgentBlocked) {
        message = `Blocked User-Agent: ${req.headers['user-agent']}`;
    }

    return { shouldBlock: urlBlocked || userAgentBlocked, message };
  }
};