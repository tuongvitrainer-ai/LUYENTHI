/**
 * Script liệt kê tất cả Users
 * Chạy: node server/scripts/listUsers.js
 */

const { knex } = require('../database/db');

async function listUsers() {
  try {
    console.log('\n📋 DANH SÁCH TẤT CẢ USERS\n');

    // Lấy tất cả users
    const users = await knex('users')
      .select(
        'id',
        'username',
        'email',
        'full_name',
        'role',
        'is_anonymous',
        'is_active',
        'stars_balance',
        'current_streak',
        'created_at'
      )
      .orderBy('id', 'asc');

    if (users.length === 0) {
      console.log('❌ Chưa có user nào trong database.\n');
      console.log('💡 Tạo admin user bằng lệnh:');
      console.log('   node server/scripts/createAdmin.js\n');
      process.exit(0);
    }

    console.log(`Tổng số users: ${users.length}\n`);

    // Đếm theo role
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 THỐNG KÊ THEO ROLE:');
    Object.entries(roleCount).forEach(([role, count]) => {
      const icon = role === 'admin' ? '⭐' : role === 'student' ? '👨‍🎓' : '👤';
      console.log(`   ${icon} ${role.padEnd(10)} : ${count} users`);
    });

    console.log('\n─────────────────────────────────────────────────────────────────────────────');
    console.log('ID   | Email                     | Username      | Role      | Stars | Active');
    console.log('─────┼───────────────────────────┼───────────────┼───────────┼───────┼────────');

    users.forEach(user => {
      const id = String(user.id).padEnd(4);
      const email = (user.email || 'N/A').padEnd(25);
      const username = (user.username || 'N/A').padEnd(13);
      const role = user.role.padEnd(9);
      const stars = String(user.stars_balance || 0).padStart(5);
      const active = user.is_active ? '✓' : '✗';
      const roleIcon = user.role === 'admin' ? '⭐' : '';

      console.log(`${id} | ${email} | ${username} | ${role} ${roleIcon} | ${stars} | ${active}`);
    });

    console.log('─────────────────────────────────────────────────────────────────────────────\n');

    // Hiển thị admin users riêng
    const admins = users.filter(u => u.role === 'admin');
    if (admins.length > 0) {
      console.log('⭐ ADMIN USERS:');
      admins.forEach(admin => {
        console.log(`   • ${admin.email} (ID: ${admin.id}) - ${admin.full_name || admin.username || 'N/A'}`);
      });
      console.log('');
    } else {
      console.log('⚠️  CẢNH BÁO: Chưa có admin user nào!');
      console.log('   Tạo admin bằng lệnh: node server/scripts/createAdmin.js\n');
    }

    console.log('💡 TIP: Để chuyển user thành admin, dùng lệnh:');
    console.log('   node server/scripts/updateUserToAdmin.js <email>\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ LỖI KHI LIỆT KÊ USERS:');
    console.error(error);
    process.exit(1);
  }
}

// Chạy script
listUsers();
