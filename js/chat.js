
const ZHIPU_API_KEY = "98316861ee314f4cab11e93225033be2.7thgUZzcWRK7pv3o";   
const API_URL = "/api/zhipu/chat/completions";
const MODEL = "glm-4-flash";   
const SYSTEM_PROMPT =
  "你叫“小阆”，是四川阆中古城的虚拟导游，热情、亲切、说话简洁。" +
  "你熟悉阆中古城的中天楼、川北道贡院、汉桓侯祠（张飞庙）、华光楼、锦屏山等景点，" +
  "也了解阆中的三国文化、科举文化、风水格局和本地美食（张飞牛肉、保宁醋、保宁蒸馍、白糖蒸馍、凉面）。" +
  "回答控制在 150 字以内，像导游一样口语化；遇到与阆中无关的问题，礼貌地把话题引回旅游。";
function base64Url(input) {
  var bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  var str = btoa(String.fromCharCode.apply(null, bytes));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function createJwt(apiKey) {
  var dot = apiKey.indexOf(".");
  var id = apiKey.slice(0, dot);
  var secret = apiKey.slice(dot + 1);
  var header = { alg: "HS256", sign_type: "SIGN" };
  var now = Date.now();
  var payload = { api_key: id, timestamp: now, exp: now + 3600 * 1000 };
  var headerPart = base64Url(JSON.stringify(header));
  var payloadPart = base64Url(JSON.stringify(payload));
  var cryptoKey = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  var signature = await crypto.subtle.sign(
    "HMAC", cryptoKey,
    new TextEncoder().encode(headerPart + "." + payloadPart)
  );
  return headerPart + "." + payloadPart + "." + base64Url(signature);
}
async function getReply(history) {
  if (!ZHIPU_API_KEY) throw new Error("NO_KEY");
  var token = await createJwt(ZHIPU_API_KEY);
  var res = await fetch(API_URL, {
    method: "POST",
    headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }].concat(history)
    })
  });
  if (!res.ok) {
    var detail = "";
    try { detail = (await res.json()).error.message || ""; } catch (e) {}
    throw new Error("接口返回 " + res.status + (detail ? "：" + detail : ""));
  }
  var data = await res.json();
  return data.choices[0].message.content;
}
(function () {
  var messagesEl = document.getElementById("chatMessages");
  var input = document.getElementById("chatInput");
  var sendBtn = document.getElementById("chatSend");
  if (!messagesEl) return;
  var history = [];
  function addMessage(text, type) {
    var div = document.createElement("div");
    div.className = "msg msg-" + type;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }
  addMessage("你好呀，我是小阆～\n阆中古城的景点、路线、美食都可以问我。\n比如：“中天楼值得上去吗？”", "bot");
  async function send() {
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMessage(text, "user");
    history.push({ role: "user", content: text });
    sendBtn.disabled = true;
    var loading = addMessage("正在查资料…", "bot");
    try {
      var reply = await getReply(history);
      loading.textContent = reply;
      history.push({ role: "assistant", content: reply });
    } catch (e) {
      loading.remove();
      if (e.message === "NO_KEY") {
        addMessage("还没有配置 API Key 哦～\n请打开 js/chat.js，把智谱 API Key 填到 ZHIPU_API_KEY 的引号里。", "tip");
      } else {
        addMessage("出错了：" + e.message + "\n请检查网络或 API Key 是否正确。", "tip");
      }
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") send();
  });
})();
