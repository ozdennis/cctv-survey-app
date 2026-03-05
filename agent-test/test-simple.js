const API_KEY = process.env.DASHSCOPE_API_KEY;
if (!API_KEY) {
  console.error("ERROR: Set key first: set DASHSCOPE_API_KEY=sk-your_key");
  process.exit(1);
}
async function test() {
  try {
    const res = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen-turbo",
        input: { messages: [{ role: "user", content: "Say TEST OK" }] },
        parameters: { result_format: "message" }
      })
    });
    const txt = await res.text();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", txt.substring(0, 300));
    if (res.status !== 200) {
      console.error("FAIL: Check key/model activation at https://dashscope.console.aliyun.com");
      process.exit(1);
    }
    const d = JSON.parse(txt);
    if (d.output?.choices?.[0]?.message?.content?.includes("TEST OK")) {
      console.log("\n*** SUCCESS! API KEY WORKS ***");
      console.log("Next: Run real SQL test");
    } else {
      console.log("Warning: Unexpected response");
    }
  } catch (e) {
    console.error("CRASH:", e.message);
    process.exit(1);
  }
}
test();
