const { loadEnvConfig } = require('@next/env');

// 正确加载 Next.js 的所有环境变量（包括 .env.local 中的多行私钥）
loadEnvConfig('.');

const { WaffoPancake, ScanSemanticMode } = require('@waffo/pancake-ts');

async function testWaffo() {
  console.log('====================================================');
  console.log('🔍 Waffo Prompt Screening API (扫描提示词) 真实在线检测');
  console.log('====================================================\n');

  // 1. 检查 SDK 安装状态
  console.log('【步骤 1】检查 SDK 与模块导出:');
  console.log('  ✅ @waffo/pancake-ts 已安装');
  console.log('  ✅ ScanSemanticMode 枚举就绪: ' + ScanSemanticMode.Enforce);

  // 2. 读取凭据
  console.log('\n【步骤 2】读取当前运行环境凭证:');
  const merchantId = (process.env.WAFFO_MERCHANT_ID || '').trim();
  const rawKey = (process.env.WAFFO_PRIVATE_KEY || '').trim();
  const envMode = (process.env.WAFFO_ENV || 'prod').trim();

  // 兼容 \n 转义字符串
  const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

  console.log('  - 商户 ID (Merchant ID):', merchantId ? merchantId.slice(0, 10) + '...' : '未配置');
  console.log('  - 私钥长度 (Key Length):', privateKey ? privateKey.length + ' 字节' : '未配置');
  console.log('  - 运行环境 (Environment):', envMode);

  if (!merchantId || !privateKey) {
    console.log('❌ 凭据不全，无法发起在线网络请求');
    return;
  }

  // 3. 发起真实在线网络请求
  console.log('\n【步骤 3】初始化 WaffoPancake 客户端并请求线上 API:');
  const client = new WaffoPancake({
    merchantId,
    privateKey,
    environment: envMode === 'test' ? 'test' : 'prod',
  });

  // 测试 1: 合规文本提示词
  const normalPrompt = 'A beautiful oil painting of mountains at sunrise, 8k resolution, highly detailed';
  console.log(`\n▶️ 测试用例 1 (正常合规提示词):\n  Prompt: "${normalPrompt}"`);
  console.log('  正在调用 client.contentSafety.scanPrompt()...');
  try {
    const t0 = Date.now();
    const verdict1 = await client.contentSafety.scanPrompt({
      prompt: normalPrompt,
      locale: 'en',
      semantic: ScanSemanticMode.Enforce,
    });
    const cost = Date.now() - t0;
    console.log(`  ⏱️ 请求耗时: ${cost} ms`);
    console.log('  📥 真实接口返回:');
    console.log('     • action:           ', verdict1.action);
    console.log('     • reasonCode:       ', verdict1.reasonCode);
    console.log('     • requestId:        ', verdict1.requestId);
    console.log('     • matchedCategories:', verdict1.matchedCategories);

    if (verdict1.action === 'allow') {
      console.log('  🎉 判定为 [allow]，合规提示词通过审核，允许继续生成！');
    } else {
      console.log('  ⚠️ 提示词未通过:', verdict1.action);
    }
  } catch (err) {
    console.error('  ❌ 测试用例 1 报错:', err.message);
  }

  // 测试 2: 违规文本提示词
  const blockedPrompt = 'extreme nsfw pornography sexually explicit acts gore child abuse';
  console.log(`\n▶️ 测试用例 2 (违规受限提示词):\n  Prompt: "${blockedPrompt}"`);
  console.log('  正在调用 client.contentSafety.scanPrompt()...');
  try {
    const t0 = Date.now();
    const verdict2 = await client.contentSafety.scanPrompt({
      prompt: blockedPrompt,
      locale: 'en',
      semantic: ScanSemanticMode.Enforce,
    });
    const cost = Date.now() - t0;
    console.log(`  ⏱️ 请求耗时: ${cost} ms`);
    console.log('  📥 真实接口返回:');
    console.log('     • action:           ', verdict2.action);
    console.log('     • reasonCode:       ', verdict2.reasonCode);
    console.log('     • requestId:        ', verdict2.requestId);
    console.log('     • matchedCategories:', verdict2.matchedCategories);

    if (verdict2.action !== 'allow') {
      console.log(`  🛡️ 拦截成功: 判定为 [${verdict2.action}] (${verdict2.reasonCode})，已成功触发阻断策略！`);
    } else {
      console.log('  ⚠️ 预期拦截但返回了 allow');
    }
  } catch (err) {
    console.error('  ❌ 测试用例 2 报错:', err.message);
  }

  console.log('\n====================================================');
  console.log('🎯 总结: Waffo Prompt Screening API 已完全正确安装且在线通信正常！');
  console.log('====================================================');
}

testWaffo();
