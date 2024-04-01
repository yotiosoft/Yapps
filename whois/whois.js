const whois = require('whois-parsed');

(async () => {
   const results = await whois.lookup('yotiosoft.com');
   console.log(JSON.stringify(results, null, 2));
})()
