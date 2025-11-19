/**
 * Script tạo Admin User mới
 * Chạy: node server/scripts/createAdmin.js
 */

const bcrypt = require('bcryptjs');
const { knex } = require('../database/db');

async function createAdminUser() {
  try {
    console.log('🔧 BẮT ĐẦU TẠO ADMIN USER...\n');

    // Cấu hình admin user - THAY ĐỔI THÔNG TIN NÀY
    const adminData = {
      username: 'admin',           // Tên đăng nhập
      email: 'admin@vuotvumon.com', // Email admin
      password: 'Admin@123',        // Mật khẩu - NÊN ĐỔI SAU KHI TẠO
      full_name: 'Administrator',   // Tên đầy đủ
      role: 'admin'                 // Role: admin
    };

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await knex('users')
      .where('email', adminData.email)
      .orWhere('username', adminData.username)
      .first();

    if (existingUser) {
      console.log('❌ LỖI: Email hoặc username đã tồn tại!');
      console.log(`   - User ID: ${existingUser.id}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Username: ${existingUser.username}`);
      console.log(`   - Role hiện tại: ${existingUser.role}`);
      console.log('\n💡 Gợi ý: Dùng script updateUserToAdmin.js để update user này thành admin');
      process.exit(1);
    }

    // Hash password
    console.log('🔐 Đang mã hóa mật khẩu...');
    const password_hash = await bcrypt.hash(adminData.password, 10);

    // Tạo admin user
    console.log('➕ Đang tạo admin user...');
    const [result] = await knex('users')
      .insert({
        username: adminData.username,
        email: adminData.email,
        password_hash: password_hash,
        full_name: adminData.full_name,
        role: 'admin',
        is_anonymous: false,
        is_active: true,
        stars_balance: 9999,      // Tặng admin 9999 stars
        freeze_streaks: 99,       // Tặng 99 freeze streaks
        current_streak: 0,
        max_streak: 0
      })
      .returning('id');

    const userId = result?.id || result;

    // Lấy thông tin admin vừa tạo
    const adminUser = await knex('users')
      .select('*')
      .where('id', userId)
      .first();

    console.log('\n✅ TẠO ADMIN USER THÀNH CÔNG!\n');
    console.log('📋 THÔNG TIN ADMIN:');
    console.log('─────────────────────────────────────');
    console.log(`   ID:           ${adminUser.id}`);
    console.log(`   Username:     ${adminUser.username}`);
    console.log(`   Email:        ${adminUser.email}`);
    console.log(`   Full Name:    ${adminUser.full_name}`);
    console.log(`   Role:         ${adminUser.role}`);
    console.log(`   Stars:        ${adminUser.stars_balance}`);
    console.log(`   Created:      ${adminUser.created_at}`);
    console.log('─────────────────────────────────────');
    console.log('\n🔑 THÔNG TIN ĐĂNG NHẬP:');
    console.log(`   Email:        ${adminData.email}`);
    console.log(`   Password:     ${adminData.password}`);
    console.log('\n⚠️  QUAN TRỌNG: Hãy đổi mật khẩu ngay sau khi đăng nhập lần đầu!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ LỖI KHI TẠO ADMIN USER:');
    console.error(error);
    process.exit(1);
  }
}

// Chạy script
createAdminUser();
