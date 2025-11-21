/**
 * Script kiểm tra database có câu hỏi chưa
 */

const { knex } = require('../database/db');

async function checkDatabase() {
  try {
    console.log('\n🔍 KIỂM TRA DATABASE\n');

    // 1. Kiểm tra bảng questions có tồn tại không
    const hasTable = await knex.schema.hasTable('questions');
    console.log(`✓ Bảng 'questions': ${hasTable ? 'CÓ' : 'KHÔNG'}`);

    if (!hasTable) {
      console.log('\n❌ Bảng questions chưa tồn tại!');
      console.log('→ Chạy: npx knex migrate:latest --knexfile knexfile.js');
      process.exit(1);
    }

    // 2. Kiểm tra columns mới
    const columns = await knex('questions').columnInfo();
    const requiredColumns = ['subject', 'topic', 'grade_level', 'question_text', 'options_json'];

    console.log('\n📋 Columns trong bảng questions:');
    requiredColumns.forEach(col => {
      const exists = columns[col] ? '✓' : '✗';
      console.log(`  ${exists} ${col}`);
    });

    // 3. Đếm số câu hỏi
    const totalQuestions = await knex('questions').count('* as count').first();
    console.log(`\n📊 Tổng số câu hỏi: ${totalQuestions.count}`);

    if (totalQuestions.count === '0') {
      console.log('\n❌ Database chưa có câu hỏi!');
      console.log('→ Chạy: npx knex seed:run --knexfile knexfile.js');
      process.exit(1);
    }

    // 4. Thống kê theo lớp và môn
    const stats = await knex('questions')
      .select('grade_level', 'subject')
      .count('* as count')
      .where({ is_active: true })
      .groupBy('grade_level', 'subject')
      .orderBy(['grade_level', 'subject']);

    console.log('\n📈 Phân bố câu hỏi:\n');

    let currentGrade = null;
    let gradeTotal = 0;

    stats.forEach(row => {
      if (currentGrade !== row.grade_level) {
        if (currentGrade !== null) {
          console.log(`  └─ TỔNG LỚP ${currentGrade}: ${gradeTotal} câu\n`);
        }
        currentGrade = row.grade_level;
        gradeTotal = 0;
        console.log(`Lớp ${row.grade_level}:`);
      }
      console.log(`  ├─ ${row.subject}: ${row.count} câu`);
      gradeTotal += parseInt(row.count);
    });

    if (currentGrade !== null) {
      console.log(`  └─ TỔNG LỚP ${currentGrade}: ${gradeTotal} câu\n`);
    }

    // 5. Xem mẫu 3 câu hỏi lớp 3
    console.log('🔍 Mẫu 3 câu hỏi LỚP 3:\n');

    const samples = await knex('questions')
      .where({ grade_level: 3, is_active: true })
      .limit(3)
      .select('id', 'subject', 'topic', 'question_text', 'options_json', 'correct_answer');

    samples.forEach((q, index) => {
      console.log(`${index + 1}. [${q.subject.toUpperCase()}] ${q.question_text}`);
      console.log(`   Topic: ${q.topic}`);
      const options = JSON.parse(q.options_json);
      console.log(`   Options: ${options.join(', ')}`);
      console.log(`   Đáp án đúng: ${q.correct_answer}\n`);
    });

    // 6. Kiểm tra bảng test_results
    const hasTestResults = await knex.schema.hasTable('test_results');
    console.log(`✓ Bảng 'test_results': ${hasTestResults ? 'CÓ' : 'KHÔNG'}`);

    if (hasTestResults) {
      const totalTests = await knex('test_results').count('* as count').first();
      console.log(`  └─ Số kết quả test: ${totalTests.count}\n`);
    }

    console.log('\n✅ DATABASE HOẠT ĐỘNG TỐT!\n');
    console.log('📝 Bước tiếp theo:');
    console.log('   1. Tạo API endpoints (routes)');
    console.log('   2. Kết nối frontend với API');
    console.log('   3. Thay thế MOCK_QUESTIONS bằng data từ API\n');

  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error('\n💡 Khắc phục:');
    console.error('   1. Kiểm tra PostgreSQL đang chạy');
    console.error('   2. Kiểm tra file .env có đúng không');
    console.error('   3. Chạy migrations: npx knex migrate:latest');
    console.error('   4. Chạy seeds: npx knex seed:run\n');
  } finally {
    await knex.destroy();
  }
}

checkDatabase();
