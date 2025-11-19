/**
 * Script chuyển User thành Admin
 * Chạy: node server/scripts/updateUserToAdmin.js <email>
 * Ví dụ: node server/scripts/updateUserToAdmin.js user@example.com
 */

const { knex } = require('../database/db');

async function updateUserToAdmin() {
  try {
    // Lấy email từ command line arguments
    const email = process.argv[2];

    if (!email) {
      console.log('\n❌ LỖI: Chưa cung cấp email!');
      console.log('\n📘 CÁCH DÙNG:');
      console.log('   node server/scripts/updateUserToAdmin.js <email>');
      console.log('\n📝 VÍ DỤ:');
      console.log('   node server/scripts/updateUserToAdmin.js user@example.com\n');
      process.exit(1);
    }

    console.log(`\n🔍 Đang tìm user với email: ${email}...\n`);

    // Tìm user theo email
    const user = await knex('users')
      .where('email', email)
      .first();

    if (!user) {
      console.log('❌ KHÔNG TÌM THẤY USER!');
      console.log(`   Email "${email}" không tồn tại trong database.\n`);

      // Liệt kê tất cả users để giúp debug
      console.log('📋 Danh sách users hiện có:');
      const allUsers = await knex('users')
        .select('id', 'username', 'email', 'role')
        .orderBy('id', 'asc')
        .limit(10);

      if (allUsers.length === 0) {
        console.log('   (Database chưa có user nào)\n');
      } else {
        console.log('   ID  | Email                    | Username   | Role');
        console.log('   ────┼──────────────────────────┼────────────┼──────────');
        allUsers.forEach(u => {
          console.log(`   ${String(u.id).padEnd(3)} | ${(u.email || 'N/A').padEnd(24)} | ${(u.username || 'N/A').padEnd(10)} | ${u.role}`);
        });
        console.log('');
      }

      process.exit(1);
    }

    console.log('✅ TÌM THẤY USER!');
    console.log('─────────────────────────────────────');
    console.log(`   ID:           ${user.id}`);
    console.log(`   Username:     ${user.username || 'N/A'}`);
    console.log(`   Email:        ${user.email || 'N/A'}`);
    console.log(`   Full Name:    ${user.full_name || 'N/A'}`);
    console.log(`   Role hiện tại: ${user.role}`);
    console.log(`   Is Anonymous: ${user.is_anonymous}`);
    console.log('─────────────────────────────────────\n');

    // Kiểm tra xem đã là admin chưa
    if (user.role === 'admin') {
      console.log('ℹ️  User này đã là ADMIN rồi. Không cần update.\n');
      process.exit(0);
    }

    // Hỏi xác nhận
    console.log('⚠️  BẠN SẮP CHUYỂN USER NÀY THÀNH ADMIN!');
    console.log('   Điều này sẽ cho phép user:');
    console.log('   - Truy cập Admin Panel');
    console.log('   - Quản lý câu hỏi');
    console.log('   - Quản lý users');
    console.log('   - Xem thống kê hệ thống\n');

    // Auto-confirm trong script (không cần input)
    console.log('⏳ Đang cập nhật...\n');

    // Update user thành admin
    await knex('users')
      .where('id', user.id)
      .update({
        role: 'admin',
        is_anonymous: false,  // Admin không thể là anonymous
        updated_at: knex.fn.now()
      });

    // Lấy thông tin sau khi update
    const updatedUser = await knex('users')
      .where('id', user.id)
      .first();

    console.log('✅ CẬP NHẬT THÀNH CÔNG!\n');
    console.log('📋 THÔNG TIN SAU KHI CẬP NHẬT:');
    console.log('─────────────────────────────────────');
    console.log(`   ID:           ${updatedUser.id}`);
    console.log(`   Username:     ${updatedUser.username || 'N/A'}`);
    console.log(`   Email:        ${updatedUser.email}`);
    console.log(`   Full Name:    ${updatedUser.full_name || 'N/A'}`);
    console.log(`   Role:         ${updatedUser.role} ⭐`);
    console.log(`   Updated at:   ${updatedUser.updated_at}`);
    console.log('─────────────────────────────────────');
    console.log('\n🎉 User này giờ có thể truy cập Admin Panel!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ LỖI KHI CẬP NHẬT USER:');
    console.error(error);
    process.exit(1);
  }
}

// Chạy script
updateUserToAdmin();
