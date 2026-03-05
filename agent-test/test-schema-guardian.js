// f:\Work\CCTV\cctv-survey-app\agent-test\test-schema-guardian.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function generateMigration() {
  try {
    // 🔑 Load YOUR actual schema snippet (first 80 lines of your baseline migration)
    const existingPattern = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '00001_docs_first_baseline.sql'),
      'utf-8'
    ).split('\n').slice(0, 80).join('\n');

    const SYSTEM_PROMPT = `ROLE: Senior Supabase Architect for CCTV ERP. YOU MUST MATCH EXACT PATTERNS FROM THIS SNIPPET:
${existingPattern}

RULES (NON-NEGOTIABLE):
- Column type: TEXT (NEVER VARCHAR)
- Values: ONLY 'cctv', 'web', 'maintenance'
- Add CHECK constraint + COMMENT
- Include schema prefix: finance.finance_ledger (NOT just finance_ledger)
- Output ONLY SQL code (no explanations, no markdown)
- Filename hint: 00002_add_business_unit.sql`;

    const USER_PROMPT = `Generate migration to add business_unit column to finance.finance_ledger.
Follow safe pattern:
1. ADD COLUMN nullable with CHECK constraint
2. COMMENT ON COLUMN
(Output ONLY the ALTER TABLE statement for finance_ledger)`;

    console.log('🚀 Sending request to Qwen...');
    
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable' // Required for some DashScope endpoints
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: USER_PROMPT }
          ]
        },
        parameters: { result_format: 'message' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const sqlOutput = result.output.choices[0].message.content.trim();

    // Save output
    const outputPath = path.join(__dirname, 'generated_migration.sql');
    fs.writeFileSync(outputPath, sqlOutput, 'utf-8');
    
    console.log('\n✅ SUCCESS! Migration saved to:');
    console.log(outputPath);
    console.log('\n🔍 MANUAL VALIDATION CHECKLIST:');
    console.log('   [ ] Uses TEXT (not VARCHAR)');
    console.log('   [ ] Has CHECK constraint with 3 values');
    console.log('   [ ] Has COMMENT matching your style');
    console.log('   [ ] Includes schema prefix: finance.finance_ledger');
    console.log('   [ ] NO markdown/backticks in file');
    console.log('\n📄 FILE CONTENTS:');
    console.log('─'.repeat(50));
    console.log(sqlOutput);
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.message.includes('DASHSCOPE_API_KEY')) {
      console.error('💡 FIX: Create .env file with your API key!');
    }
    if (error.message.includes('fetch is not defined')) {
      console.error('💡 FIX: Update Node.js to v18+ (you have v24.14.0 - should work)');
    }
    process.exit(1);
  }
}

// Run it
generateMigration();
