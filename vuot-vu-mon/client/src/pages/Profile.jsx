import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shopAPI } from '../services/api';
import UserAvatar from '../components/UserAvatar';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoadingInventory(true);
      const response = await shopAPI.getInventory();

      if (response.data.success) {
        setInventory(response.data.data.inventory || []);
      }
    } catch (error) {
      console.error('Load inventory error:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      alert('Vui lòng nhập tên hiển thị!');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ display_name: displayName })
      });

      const data = await response.json();

      if (data.success) {
        updateUser(data.data.user);
        setEditMode(false);
        alert('Cập nhật thông tin thành công! ✓');
      } else {
        alert(data.message || 'Lỗi khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      alert('Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.display_name || '');
    setEditMode(false);
  };

  const getCategoryIcon = (type) => {
    const icons = {
      avatar: '👤',
      badge: '🏅',
      powerup: '⚡',
      theme: '🎨'
    };
    return icons[type] || '📦';
  };

  const getCategoryName = (type) => {
    const names = {
      avatar: 'Avatar',
      badge: 'Huy Hiệu',
      powerup: 'Power-ups',
      theme: 'Giao Diện'
    };
    return names[type] || type;
  };

  // Group inventory by type
  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.item_type]) {
      acc[item.item_type] = [];
    }
    acc[item.item_type].push(item);
    return acc;
  }, {});

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <button onClick={() => navigate('/')} className="btn-back">
            ← Về trang chủ
          </button>
          <h1>🎯 Hồ Sơ Của Tôi</h1>
          <div className="header-right">
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="profile-container">
        {/* User Info Card */}
        <div className="user-info-card">
          <div className="user-avatar-large">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          <div className="user-details">
            {!editMode ? (
              <>
                <h2>{user?.display_name || user?.username}</h2>
                <p className="user-email">{user?.email}</p>
                <button className="btn-edit" onClick={() => setEditMode(true)}>
                  ✏️ Chỉnh sửa thông tin
                </button>
              </>
            ) : (
              <div className="edit-form">
                <div className="form-group">
                  <label>Tên hiển thị:</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập tên hiển thị"
                    maxLength={50}
                  />
                </div>
                <div className="edit-actions">
                  <button
                    className="btn-save"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? '⏳ Đang lưu...' : '✓ Lưu'}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    ✗ Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="user-stats-grid">
            <div className="stat-box">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{user?.total_stars || 0}</div>
              <div className="stat-label">Tổng sao</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{user?.current_streak || 0}</div>
              <div className="stat-label">Chuỗi ngày</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{user?.max_streak || 0}</div>
              <div className="stat-label">Kỷ lục</div>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="inventory-section">
          <h2 className="section-title">🎒 Vật Phẩm Của Tôi</h2>

          {loadingInventory ? (
            <div className="loading-inventory">
              <div className="spinner">⏳</div>
              <p>Đang tải vật phẩm...</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="empty-inventory">
              <div className="empty-icon">📭</div>
              <h3>Chưa có vật phẩm nào</h3>
              <p>Hãy ghé cửa hàng để mua vật phẩm nhé!</p>
              <button onClick={() => navigate('/shop')} className="btn-go-shop">
                🛒 Đến cửa hàng
              </button>
            </div>
          ) : (
            <div className="inventory-content">
              {Object.entries(groupedInventory).map(([type, items]) => (
                <div key={type} className="inventory-category">
                  <h3 className="category-title">
                    <span className="category-icon">{getCategoryIcon(type)}</span>
                    {getCategoryName(type)}
                    <span className="category-count">({items.length})</span>
                  </h3>

                  <div className="items-grid">
                    {items.map((item, index) => (
                      <div key={index} className="inventory-item">
                        <div className="item-icon-large">{getCategoryIcon(item.item_type)}</div>
                        <div className="item-info">
                          <h4>{item.item_name}</h4>
                          {item.item_description && (
                            <p className="item-desc">{item.item_description}</p>
                          )}
                          <div className="item-quantity">
                            Số lượng: <strong>{item.total_quantity}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
