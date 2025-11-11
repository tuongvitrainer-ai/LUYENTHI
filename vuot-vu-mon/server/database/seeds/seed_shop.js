const { db } = require('../db');

/**
 * Seed shop items data
 */

const shopItems = [
  // Avatars
  {
    item_name: 'Avatar Siêu Nhân',
    item_description: 'Avatar siêu nhân đặc biệt cho profile của bạn',
    item_type: 'avatar',
    star_cost: 50,
    stock_quantity: -1, // Unlimited
    image_url: null,
    display_order: 1
  },
  {
    item_name: 'Avatar Công Chúa',
    item_description: 'Avatar công chúa xinh đẹp',
    item_type: 'avatar',
    star_cost: 50,
    stock_quantity: -1,
    image_url: null,
    display_order: 2
  },
  {
    item_name: 'Avatar Robot',
    item_description: 'Avatar robot tương lai',
    item_type: 'avatar',
    star_cost: 50,
    stock_quantity: -1,
    image_url: null,
    display_order: 3
  },

  // Badges
  {
    item_name: 'Huy Hiệu Vàng',
    item_description: 'Huy hiệu vàng danh giá',
    item_type: 'badge',
    star_cost: 100,
    stock_quantity: -1,
    image_url: null,
    display_order: 10
  },
  {
    item_name: 'Huy Hiệu Bạc',
    item_description: 'Huy hiệu bạc đẹp mắt',
    item_type: 'badge',
    star_cost: 75,
    stock_quantity: -1,
    image_url: null,
    display_order: 11
  },
  {
    item_name: 'Huy Hiệu Đồng',
    item_description: 'Huy hiệu đồng cho người mới',
    item_type: 'badge',
    star_cost: 50,
    stock_quantity: -1,
    image_url: null,
    display_order: 12
  },

  // Power-ups
  {
    item_name: 'Gợi Ý 50/50',
    item_description: 'Loại bỏ 2 đáp án sai',
    item_type: 'powerup',
    star_cost: 30,
    stock_quantity: -1,
    image_url: null,
    display_order: 20
  },
  {
    item_name: 'Thời Gian Thêm',
    item_description: 'Thêm 30 giây làm bài',
    item_type: 'powerup',
    star_cost: 25,
    stock_quantity: -1,
    image_url: null,
    display_order: 21
  },
  {
    item_name: 'Bỏ Qua Câu Hỏi',
    item_description: 'Bỏ qua 1 câu khó mà không mất điểm',
    item_type: 'powerup',
    star_cost: 40,
    stock_quantity: -1,
    image_url: null,
    display_order: 22
  },

  // Themes
  {
    item_name: 'Giao Diện Tối',
    item_description: 'Chủ đề tối bảo vệ mắt',
    item_type: 'theme',
    star_cost: 80,
    stock_quantity: -1,
    image_url: null,
    display_order: 30
  },
  {
    item_name: 'Giao Diện Rừng Xanh',
    item_description: 'Chủ đề thiên nhiên tươi mát',
    item_type: 'theme',
    star_cost: 80,
    stock_quantity: -1,
    image_url: null,
    display_order: 31
  },
  {
    item_name: 'Giao Diện Biển Xanh',
    item_description: 'Chủ đề đại dương trong lành',
    item_type: 'theme',
    star_cost: 80,
    stock_quantity: -1,
    image_url: null,
    display_order: 32
  }
];

function seedShopItems() {
  console.log('🛒 Starting shop items seed process...\n');

  try {
    // Check if items already exist
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM shop_items').get();

    if (existingCount.count > 0) {
      console.log(`⚠️  Shop already has ${existingCount.count} item(s).`);
      console.log('Continuing to add more items...\n');
    }

    // Use transaction to insert all items
    const insertTransaction = db.transaction((items) => {
      const insertItem = db.prepare(`
        INSERT INTO shop_items
        (item_name, item_description, item_type, star_cost, stock_quantity, image_url, display_order, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `);

      const insertedItems = [];

      for (const item of items) {
        const result = insertItem.run(
          item.item_name,
          item.item_description,
          item.item_type,
          item.star_cost,
          item.stock_quantity,
          item.image_url,
          item.display_order
        );

        insertedItems.push({
          id: result.lastInsertRowid,
          ...item
        });
      }

      return insertedItems;
    });

    // Execute transaction
    console.log(`📦 Inserting ${shopItems.length} shop items...\n`);
    const insertedItems = insertTransaction(shopItems);

    // Display results by category
    console.log('✅ Successfully inserted items:\n');

    const categories = {};
    insertedItems.forEach(item => {
      if (!categories[item.item_type]) {
        categories[item.item_type] = [];
      }
      categories[item.item_type].push(item);
    });

    const categoryNames = {
      avatar: '👤 Avatars',
      badge: '🏅 Huy Hiệu',
      powerup: '⚡ Power-ups',
      theme: '🎨 Themes'
    };

    for (const [type, items] of Object.entries(categories)) {
      console.log(`${categoryNames[type] || type}: ${items.length} items`);
      items.forEach(item => {
        console.log(`   - ${item.item_name} (${item.star_cost} ⭐)`);
      });
      console.log('');
    }

    // Show summary
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM shop_items').get();
    const totalValue = db.prepare('SELECT SUM(star_cost) as total FROM shop_items WHERE stock_quantity = -1').get();

    console.log('📊 Shop Summary:');
    console.log(`   Total items: ${totalItems.count}`);
    console.log(`   Total catalog value: ${totalValue.total} ⭐`);
    console.log('');
    console.log('🎉 Shop seed completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding shop:', error.message);
    throw error;
  }
}

// Run seed if file is executed directly
if (require.main === module) {
  seedShopItems();
  process.exit(0);
}

module.exports = { seedShopItems, shopItems };
