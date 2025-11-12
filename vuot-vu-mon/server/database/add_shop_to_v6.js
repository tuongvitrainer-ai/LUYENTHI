const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('🛒 Adding shop_items table to V6 database...\n');

try {
  // Create shop_items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL,
      item_description TEXT,
      item_type TEXT NOT NULL CHECK (item_type IN ('avatar', 'theme', 'freeze_streak', 'boost')),
      star_cost INTEGER NOT NULL CHECK (star_cost >= 0),
      stock_quantity INTEGER DEFAULT -1,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('✅ Created shop_items table');

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_shop_items_type ON shop_items(item_type);
    CREATE INDEX IF NOT EXISTS idx_shop_items_status ON shop_items(status);
    CREATE INDEX IF NOT EXISTS idx_shop_items_display_order ON shop_items(display_order);
  `);

  console.log('✅ Created indexes');

  // Create user_purchases table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      total_stars_spent INTEGER NOT NULL,
      purchased_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Created user_purchases table');

  // Create indexes for user_purchases
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_purchases_item_id ON user_purchases(item_id);
  `);

  console.log('✅ Created purchase indexes');

  // Insert sample shop items
  const items = [
    {
      item_name: 'Avatar Mèo Con',
      item_description: 'Avatar dễ thương hình mèo con',
      item_type: 'avatar',
      star_cost: 100,
      stock_quantity: -1,
      image_url: '/assets/avatars/cat.png',
      display_order: 1
    },
    {
      item_name: 'Avatar Khủng Long',
      item_description: 'Avatar hình khủng long ngầu',
      item_type: 'avatar',
      star_cost: 150,
      stock_quantity: -1,
      image_url: '/assets/avatars/dino.png',
      display_order: 2
    },
    {
      item_name: 'Freeze Streak Shield',
      item_description: 'Khiên bảo vệ chuỗi ngày học',
      item_type: 'freeze_streak',
      star_cost: 50,
      stock_quantity: -1,
      image_url: '/assets/items/freeze.png',
      display_order: 3
    },
    {
      item_name: 'Theme Xanh Dương',
      item_description: 'Giao diện màu xanh dương',
      item_type: 'theme',
      star_cost: 200,
      stock_quantity: -1,
      image_url: '/assets/themes/blue.png',
      display_order: 4
    },
    {
      item_name: 'Theme Hồng',
      item_description: 'Giao diện màu hồng dễ thương',
      item_type: 'theme',
      star_cost: 200,
      stock_quantity: -1,
      image_url: '/assets/themes/pink.png',
      display_order: 5
    }
  ];

  const insertItem = db.prepare(`
    INSERT INTO shop_items (item_name, item_description, item_type, star_cost, stock_quantity, image_url, display_order, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `);

  const insertAll = db.transaction((items) => {
    for (const item of items) {
      insertItem.run(
        item.item_name,
        item.item_description,
        item.item_type,
        item.star_cost,
        item.stock_quantity,
        item.image_url,
        item.display_order
      );
    }
  });

  insertAll(items);

  console.log(`✅ Inserted ${items.length} sample shop items`);

  // Verify
  const count = db.prepare('SELECT COUNT(*) as count FROM shop_items').get();
  console.log(`\n📊 Total shop items: ${count.count}`);

  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND (name='shop_items' OR name='user_purchases')
    ORDER BY name
  `).all();

  console.log(`📋 Shop tables: ${tables.map(t => t.name).join(', ')}`);

  console.log('\n✅ Shop system added to V6 database successfully!');

} catch (error) {
  console.error('❌ Error adding shop system:', error);
  process.exit(1);
}

db.close();
