const API_KEY = process.env.DASHSCOPE_API_KEY?.trim();

if (!API_KEY || API_KEY === 'sk-xxxxxx') {
  console.error("\n❌ FATAL: Invalid API key setup!");
  console.error("✅ DO THIS:");
  console.error("   1. Get VALID key from https://dashscope.console.aliyun.com/apiKey");
  console.error("   2. In CMD: set DASHSCOPE_API_KEY=sk-your_actual_key_here");
  console.error("   3. DO NOT close this CMD window after setting key!");
  process.exit(1);
}

async function testGuardian() {
  console.log("\n📡 Sending request to DashScope...");
  console.log("🔑 Key prefix:", API_KEY.substring(0,8) + "...");
  
  try {
    const res = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-turbo', // SAFER THAN qwen-max FOR TESTING
        input: { messages: [{role:'user', content:'Say "TEST OK"'}] },
        parameters: { result_format: 'message' }
      })
    });

    // LOG RAW RESPONSE FOR DEBUGGING
    const rawText = await res.text();
    console.log("\n📥 RAW RESPONSE STATUS:", res.status);
    console.log("📥 RAW RESPONSE BODY:", rawText.substring(0, 500)); // First 500 chars

    if (!res.ok) {
      console.error("\n🔥 HTTP ERROR:", res.status, res.statusText);
      console.error("💡 Likely causes:");
      console.error("   • Invalid API key (check https://dashscope.console.aliyun.com/apiKey)");
      console.error("   • Model not activated (activate qwen-turbo in Model Studio)");
      console.error("   • Network firewall blocking dashscope.aliyuncs.com");
      process.exit(1);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("\n❌ FAILED TO PARSE RESPONSE AS JSON");
      console.error("💡 This means DashScope returned HTML/error page (common with invalid keys)");
      process.exit(1);
    }

    // CHECK FOR DASHSCOPE-SPECIFIC ERRORS
    if (data.code && data.code !== 200) {
      console.error("\n❌ :dot:
