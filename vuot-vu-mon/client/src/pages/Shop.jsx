import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shopAPI } from '../services/api';
import UserAvatar from '../components/UserAvatar';
import './Shop.css';

function Shop() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Load shop items on mount
  useEffect(() => {
    loadShopItems();
  }, []);

  const loadShopItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await shopAPI.getItems();
      console.log('Shop API response:', response.data);

      if (response.data.success) {
        setItems(response.data.data.items || []);
        console.log('Loaded items:', response.data.data.items?.length || 0);
      } else {
        setError(response.data.message || 'Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      console.error('Load shop items error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi tải cửa hàng';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;
    if (purchasing) return;

    const totalCost = selectedItem.star_cost * quantity;

    if (user.total_stars < totalCost) {
      alert(`Bạn không đủ sao! Cần ${totalCost} sao, bạn hiện có ${user.total_stars} sao.`);
      return;
    }

    setPurchasing(true);

    try {
      const response = await shopAPI.purchase({
        item_id: selectedItem.id,
        quantity: quantity
      });

      if (response.data.success) {
        const result = response.data.data;

        // Update user stars
        updateUser({
          ...user,
          total_stars: result.new_total_stars
        });

        alert(`🎉 Mua thành công!\n${result.item_name} x${result.quantity}\nSố sao còn lại: ${result.new_total_stars} ⭐`);

        // Close modal
        setSelectedItem(null);
        setQuantity(1);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const message = error.message || 'Lỗi khi mua vật phẩm. Vui lòng thử lại.';
      alert(message);
    } finally {
      setPurchasing(false);
    }
  };

  const openPurchaseModal = (item) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  const closePurchaseModal = () => {
    setSelectedItem(null);
    setQuantity(1);
  };

  const handleBackToMap = () => {
    navigate('/');
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.item_type]) {
      acc[item.item_type] = [];
    }
    acc[item.item_type].push(item);
    return acc;
  }, {});

  const categoryInfo = {
    avatar: { name: 'Avatar', icon: '👤', color: '#3498db' },
    badge: { name: 'Huy Hiệu', icon: '🏅', color: '#f39c12' },
    powerup: { name: 'Power-ups', icon: '⚡', color: '#9b59b6' },
    theme: { name: 'Giao Diện', icon: '🎨', color: '#1abc9c' }
  };

  if (loading) {
    return (
      <div className="shop-page loading">
        <div className="loading-spinner">Đang tải cửa hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-page loading">
        <div className="error-message">
          <h2>❌ {error}</h2>
          <button onClick={loadShopItems} className="btn-retry">Thử lại</button>
          <button onClick={handleBackToMap} className="btn-back-home">Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="shop-header">
        <div className="header-content">
          <button onClick={handleBackToMap} className="btn-back">
            ← Về trang chủ
          </button>
          <h1>🛒 Cửa Hàng</h1>
          <div className="header-right">
            <div className="user-stars">⭐ {user?.total_stars || 0}</div>
            <UserAvatar />
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="shop-container">
        {Object.entries(groupedItems).map(([type, typeItems]) => {
          const category = categoryInfo[type] || { name: type, icon: '📦', color: '#95a5a6' };

          return (
            <div key={type} className="shop-category">
              <div className="category-header">
                <span className="category-icon">{category.icon}</span>
                <h2 className="category-name">{category.name}</h2>
              </div>

              <div className="items-grid">
                {typeItems.map((item) => (
                  <div key={item.id} className="shop-item-card">
                    <div
                      className="item-icon"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <h3 className="item-name">{item.item_name}</h3>
                    <p className="item-description">{item.item_description}</p>
                    <div className="item-footer">
                      <span className="item-cost">⭐ {item.star_cost}</span>
                      <button
                        onClick={() => openPurchaseModal(item)}
                        className="btn-buy"
                        style={{ backgroundColor: category.color }}
                      >
                        Mua
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="empty-shop">
            <p>Cửa hàng hiện chưa có sản phẩm nào.</p>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={closePurchaseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePurchaseModal}>✕</button>

            <h2>Xác nhận mua hàng</h2>

            <div className="modal-item-info">
              <h3>{selectedItem.item_name}</h3>
              <p>{selectedItem.item_description}</p>
              <p className="item-price">Giá: ⭐ {selectedItem.star_cost}</p>
            </div>

            <div className="quantity-selector">
              <label>Số lượng:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="10"
                />
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

            <div className="modal-summary">
              <p>Tổng cộng: <strong>⭐ {selectedItem.star_cost * quantity}</strong></p>
              <p>Số sao hiện tại: <strong>⭐ {user?.total_stars || 0}</strong></p>
              <p>Còn lại sau khi mua: <strong>⭐ {(user?.total_stars || 0) - (selectedItem.star_cost * quantity)}</strong></p>
            </div>

            <div className="modal-actions">
              <button onClick={closePurchaseModal} className="btn btn-secondary">
                Hủy
              </button>
              <button
                onClick={handlePurchase}
                className="btn btn-primary"
                disabled={purchasing || (user?.total_stars || 0) < (selectedItem.star_cost * quantity)}
              >
                {purchasing ? 'Đang mua...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;
