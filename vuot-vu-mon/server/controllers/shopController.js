const { db } = require('../database/db');

/**
 * Get all shop items
 * GET /api/shop/items
 *
 * Query params:
 * - status: Filter by status (default: 'active')
 * - item_type: Filter by type
 */
const getItems = (req, res) => {
  try {
    const { status = 'active', item_type } = req.query;

    let query = `
      SELECT id, item_name, item_description, item_type,
             star_cost, stock_quantity, image_url, display_order
      FROM shop_items
      WHERE status = ?
    `;

    const params = [status];

    if (item_type) {
      query += ' AND item_type = ?';
      params.push(item_type);
    }

    query += ' ORDER BY display_order ASC, id ASC';

    const items = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: {
        items,
        count: items.length
      }
    });

  } catch (error) {
    console.error('Get shop items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop items'
    });
  }
};

/**
 * Purchase an item
 * POST /api/shop/purchase
 *
 * Body:
 * - item_id: ID of the item to purchase
 * - quantity: Quantity (default: 1)
 */
const purchase = (req, res) => {
  try {
    const { item_id, quantity = 1 } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!item_id) {
      return res.status(400).json({
        success: false,
        message: 'item_id is required'
      });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 10'
      });
    }

    // Get item
    const item = db.prepare(`
      SELECT id, item_name, star_cost, stock_quantity, status
      FROM shop_items
      WHERE id = ?
    `).get(item_id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (item.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Item is not available for purchase'
      });
    }

    // Check stock (if stock_quantity is -1, unlimited)
    if (item.stock_quantity !== -1 && item.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Calculate total cost
    const totalCost = item.star_cost * quantity;

    // Get user
    const user = db.prepare(`
      SELECT id, total_stars
      FROM users
      WHERE id = ?
    `).get(user_id);

    // Check if user has enough stars
    if (user.total_stars < totalCost) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stars',
        required: totalCost,
        current: user.total_stars,
        shortage: totalCost - user.total_stars
      });
    }

    // Use transaction for purchase
    const transaction = db.transaction(() => {
      // Deduct stars from user
      db.prepare(`
        UPDATE users
        SET total_stars = total_stars - ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(totalCost, user_id);

      // Update stock if not unlimited
      if (item.stock_quantity !== -1) {
        db.prepare(`
          UPDATE shop_items
          SET stock_quantity = stock_quantity - ?,
              updated_at = datetime('now')
          WHERE id = ?
        `).run(quantity, item_id);
      }

      // Record purchase
      const purchaseResult = db.prepare(`
        INSERT INTO user_purchases
        (user_id, shop_item_id, stars_spent, quantity, status)
        VALUES (?, ?, ?, ?, 'completed')
      `).run(user_id, item_id, totalCost, quantity);

      return purchaseResult.lastInsertRowid;
    });

    // Execute transaction
    const purchaseId = transaction();

    // Get updated user data
    const updatedUser = db.prepare(`
      SELECT total_stars
      FROM users
      WHERE id = ?
    `).get(user_id);

    res.json({
      success: true,
      message: 'Purchase successful',
      data: {
        purchase_id: purchaseId,
        item_name: item.item_name,
        quantity: quantity,
        stars_spent: totalCost,
        new_total_stars: updatedUser.total_stars
      }
    });

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing purchase'
    });
  }
};

/**
 * Get user's purchase history
 * GET /api/shop/purchases
 */
const getUserPurchases = (req, res) => {
  try {
    const user_id = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const purchases = db.prepare(`
      SELECT up.id, up.stars_spent, up.quantity, up.status, up.created_at,
             si.item_name, si.item_description, si.item_type
      FROM user_purchases up
      INNER JOIN shop_items si ON up.shop_item_id = si.id
      WHERE up.user_id = ?
      ORDER BY up.created_at DESC
      LIMIT ? OFFSET ?
    `).all(user_id, parseInt(limit), parseInt(offset));

    const totalPurchases = db.prepare(`
      SELECT COUNT(*) as count
      FROM user_purchases
      WHERE user_id = ?
    `).get(user_id);

    res.json({
      success: true,
      data: {
        purchases,
        count: purchases.length,
        total: totalPurchases.count
      }
    });

  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases'
    });
  }
};

/**
 * Get user's inventory (purchased items summary)
 * GET /api/shop/inventory
 */
const getInventory = (req, res) => {
  try {
    const user_id = req.user.id;

    const inventory = db.prepare(`
      SELECT si.item_name, si.item_type, si.item_description,
             SUM(up.quantity) as total_quantity,
             COUNT(up.id) as purchase_count
      FROM user_purchases up
      INNER JOIN shop_items si ON up.shop_item_id = si.id
      WHERE up.user_id = ? AND up.status = 'completed'
      GROUP BY si.id
      ORDER BY total_quantity DESC
    `).all(user_id);

    res.json({
      success: true,
      data: {
        inventory,
        count: inventory.length
      }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory'
    });
  }
};

module.exports = {
  getItems,
  purchase,
  getUserPurchases,
  getInventory
};
