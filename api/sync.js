export const config = {
  runtime: "edge"
};

// 你的账号密码
const USERNAME = "1437053376";
const PASSWORD = "oy111111213";

// 跨域CORS头部，解决洛雪客户端跨域拦截
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
};

// 鉴权校验函数
function checkAuth(req) {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const base64Str = auth.replace("Basic ", "");
  const decodeStr = atob(base64Str);
  const [user, pass] = decodeStr.split(":");
  return user === USERNAME && pass === PASSWORD;
}

export default async function handler(req) {
  // 处理OPTIONS预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const edgeConfig = process.env.LX_KV; // 对应Vercel Edge Config存储

  // 1. 访问 /sync/get 获取歌单
  if (path === "/sync/get" && req.method === "GET") {
    // 未登录返回401（和你原CF返回格式完全一致）
    if (!checkAuth(req)) {
      return Response.json(
        { code: 401, msg: "账号密码错误" },
        { status: 401, headers: corsHeaders }
      );
    }
    // 读取存储的歌单
    const data = await edgeConfig.get("lx_data") || "{}";
    return Response.json({ code: 0, data: JSON.parse(data) }, { headers: corsHeaders });
  }

  // 2. 访问 /sync/save 保存歌单
  if (path === "/sync/save" && req.method === "POST") {
    if (!checkAuth(req)) {
      return Response.json(
        { code: 401, msg: "账号密码错误" },
        { status: 401, headers: corsHeaders }
      );
    }
    const body = await req.json();
    await edgeConfig.set("lx_data", JSON.stringify(body));
    return Response.json({ code: 0, msg: "保存成功" }, { headers: corsHeaders });
  }

  // 非法路径返回404
  return Response.json({ code: 404, msg: "接口不存在" }, { status: 404, headers: corsHeaders });
}
