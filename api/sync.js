export const config = {
  runtime: "edge"
};

// 账号密码
const USERNAME = "1437053376";
const PASSWORD = "oy111111213";

// 跨域头
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
};

// 内存存储（重启部署数据清空，个人使用完全足够）
let lxData = {};

// 鉴权
function checkAuth(req) {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const base64Str = auth.replace("Basic ", "");
  const decodeStr = atob(base64Str);
  const [user, pass] = decodeStr.split(":");
  return user === USERNAME && pass === PASSWORD;
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const url = new URL(req.url);
  const path = url.pathname;

  // 获取歌单
  if (path === "/sync/get" && req.method === "GET") {
    if (!checkAuth(req)) {
      return Response.json({ code: 401, msg: "账号密码错误" }, { status: 401, headers: corsHeaders });
    }
    return Response.json({ code: 0, data: lxData }, { headers: corsHeaders });
  }

  // 保存歌单
  if (path === "/sync/save" && req.method === "POST") {
    if (!checkAuth(req)) {
      return Response.json({ code: 401, msg: "账号密码错误" }, { status: 401, headers: corsHeaders });
    }
    lxData = await req.json();
    return Response.json({ code: 0, msg: "保存成功" }, { headers: corsHeaders });
  }

  return Response.json({ code: 404, msg: "接口不存在" }, { status: 404, headers: corsHeaders });
}
