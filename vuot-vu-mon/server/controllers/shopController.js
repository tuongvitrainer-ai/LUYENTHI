const { knex } = require('../database/db');

/**
 * Get all shop items
 * GET /api/shop/items
 *
 * Query params:
 * - category: Filter by category
 * - is_active: Filter by active status (default: true)
 */
const getItems = async (req, res) => {
  try {
    const { category, is_active = true } = req.query;

    let query = knex('shop_items')
      .select(
        'id', 'name', 'description', 'category',
        'price', 'stock', 'image_url', 'properties_json'
      )
      .where('is_active', is_active === 'true' || is_active === true);

    if (category) {
      query = query.where('category', category);
    }

    query = query.orderBy('category', 'asc').orderBy('id', 'asc');

    const items = await query;

    // Parse properties_json for each item
    const formattedItems = items.map(item => ({
      ...item,
      properties: item.properties_json ? JSON.parse(item.properties_json) : null
    }));

    res.json({
      success: true,
      data: {
        items: formattedItems,
        count: formattedItems.length
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
const purchase = async (req, res) => {
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
    const item = await knex('shop_items')
      .select('id', 'name', 'price', 'stock', 'is_active')
      .where('id', item_id)
      .first();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (!item.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Item is not available for purchase'
      });
    }

    // Check stock (if stock is -1, unlimited)
    if (item.stock !== -1 && item.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Calculate total cost
    const totalCost = item.price * quantity;

    // Get user - FIX: Using stars_balance instead of deprecated total_stars
    const user = await knex('users')
      .select('id', 'stars_balance')
      .where('id', user_id)
      .first();

    // Check if user has enough stars
    if (user.stars_balance < totalCost) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stars',
        required: totalCost,
        current: user.stars_balance,
        shortage: totalCost - user.stars_balance
      });
    }

    // Use transaction for purchase
    const purchaseId = await knex.transaction(async (trx) => {
      // Deduct stars from user - FIX: Using stars_balance
      await trx('users')
        .where('id', user_id)
        .update({
          stars_balance: knex.raw('stars_balance - ?', [totalCost]),
          updated_at: trx.fn.now()
        });

      // Update stock if not unlimited
      if (item.stock !== -1) {
        await trx('shop_items')
          .where('id', item_id)
          .update({
            stock: knex.raw('stock - ?', [quantity])
          });
      }

      // Record purchase
      const [result] = await trx('user_purchases')
        .insert({
          user_id: user_id,
          item_id: item_id,
          price_paid: totalCost,
          is_equipped: false
        })
        .returning('id');

      return result.id || result;
    });

    // Get updated user data
    const updatedUser = await knex('users')
      .select('stars_balance')
      .where('id', user_id)
      .first();

    res.json({
      success: true,
      message: 'Purchase successful',
      data: {
        purchase_id: purchaseId,
        item_name: item.name,
        quantity: quantity,
        stars_spent: totalCost,
        new_stars_balance: updatedUser.stars_balance
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
const getUserPurchases = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const purchases = await knex('user_purchases as up')
      .select(
        'up.id', 'up.price_paid', 'up.is_equipped', 'up.purchased_at',
        'si.name as item_name', 'si.description as item_description', 'si.category'
      )
      .innerJoin('shop_items as si', 'up.item_id', 'si.id')
      .where('up.user_id', user_id)
      .orderBy('up.purchased_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const totalPurchases = await knex('user_purchases')
      .where('user_id', user_id)
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: {
        purchases,
        count: purchases.length,
        total: parseInt(totalPurchases.count)
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
const getInventory = async (req, res) => {
  try {
    const user_id = req.user.id;

    const inventory = await knex('user_purchases as up')
      .select(
        'si.name as item_name',
        'si.category',
        'si.description as item_description',
        knex.raw('COUNT(up.id) as purchase_count'),
        knex.raw('SUM(up.price_paid) as total_spent')
      )
      .innerJoin('shop_items as si', 'up.item_id', 'si.id')
      .where('up.user_id', user_id)
      .groupBy('si.id', 'si.name', 'si.category', 'si.description')
      .orderBy('purchase_count', 'desc');

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

/**
 * Equip/Unequip an item
 * POST /api/shop/equip
 *
 * Body:
 * - purchase_id: ID of the purchase to equip/unequip
 * - is_equipped: boolean
 */
const equipItem = async (req, res) => {
  try {
    const { purchase_id, is_equipped } = req.body;
    const user_id = req.user.id;

    if (!purchase_id || is_equipped === undefined) {
      return res.status(400).json({
        success: false,
        message: 'purchase_id and is_equipped are required'
      });
    }

    // Verify ownership
    const purchase = await knex('user_purchases')
      .where({
        id: purchase_id,
        user_id: user_id
      })
      .first();

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found or not owned by user'
      });
    }

    // Update equipped status
    await knex('user_purchases')
      .where('id', purchase_id)
      .update({ is_equipped: is_equipped });

    res.json({
      success: true,
      message: is_equipped ? 'Item equipped' : 'Item unequipped',
      data: {
        purchase_id: purchase_id,
        is_equipped: is_equipped
      }
    });

  } catch (error) {
    console.error('Equip item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item equipment status'
    });
  }
};

module.exports = {
  getItems,
  purchase,
  getUserPurchases,
  getInventory,
  equipItem
};
