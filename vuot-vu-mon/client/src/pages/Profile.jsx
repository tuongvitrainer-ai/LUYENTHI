import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shopAPI } from '../services/api';
import UserAvatar from '../components/UserAvatar';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // State cho inventory
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  // State cho edit profile
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    birthday: user?.birthday || '',
    gender: user?.gender || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  // State cho change password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    // Update form data khi user thay đổi
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        birthday: user.birthday || '',
        gender: user.gender || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.display_name.trim()) {
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
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        updateUser(data.data.user);
        setEditMode(false);
        alert('✅ Cập nhật thông tin thành công!');
      } else {
        alert('❌ ' + (data.message || 'Lỗi khi cập nhật thông tin'));
      }
    } catch (error) {
      console.error('Save profile error:', error);
      alert('❌ Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      display_name: user?.display_name || '',
      birthday: user?.birthday || '',
      gender: user?.gender || '',
      phone: user?.phone || '',
      bio: user?.bio || ''
    });
    setEditMode(false);
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (newPassword.length < 6) {
      alert('⚠️ Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('⚠️ Mật khẩu mới và xác nhận không khớp!');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Đổi mật khẩu thành công!');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert('❌ ' + (data.message || 'Lỗi khi đổi mật khẩu'));
      }
    } catch (error) {
      console.error('Change password error:', error);
      alert('❌ Lỗi khi đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
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
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔑 Đổi Mật Khẩu</h2>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Mật khẩu hiện tại:</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới:</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới:</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-primary-action"
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? '⏳ Đang xử lý...' : '✓ Đổi mật khẩu'}
              </button>
              <button
                className="btn-secondary-action"
                onClick={() => setShowPasswordModal(false)}
                disabled={changingPassword}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

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
                <h2>{user?.display_name || user?.username || 'Chưa đặt tên'}</h2>
                <p className="user-email">{user?.email || 'Khách'}</p>

                {/* Display user info */}
                <div className="user-info-display">
                  {user?.birthday && (
                    <p><strong>🎂 Sinh nhật:</strong> {new Date(user.birthday).toLocaleDateString('vi-VN')}</p>
                  )}
                  {user?.gender && (
                    <p><strong>👤 Giới tính:</strong> {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}</p>
                  )}
                  {user?.phone && (
                    <p><strong>📱 Số điện thoại:</strong> {user.phone}</p>
                  )}
                  {user?.bio && (
                    <p><strong>✏️ Giới thiệu:</strong> {user.bio}</p>
                  )}
                </div>

                <div className="profile-actions">
                  <button className="btn-edit" onClick={() => setEditMode(true)}>
                    ✏️ Chỉnh sửa thông tin
                  </button>
                  <button className="btn-change-password" onClick={() => setShowPasswordModal(true)}>
                    🔑 Đổi mật khẩu
                  </button>
                </div>
              </>
            ) : (
              <div className="edit-form">
                <h3>📝 Chỉnh Sửa Thông Tin</h3>

                <div className="form-group">
                  <label>Tên hiển thị: *</label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên hiển thị"
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label>Ngày sinh nhật:</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Giới tính:</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleInputChange}
                      />
                      <span>Nam</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleInputChange}
                      />
                      <span>Nữ</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={handleInputChange}
                      />
                      <span>Khác</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Số điện thoại:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    maxLength={20}
                  />
                </div>

                <div className="form-group">
                  <label>Giới thiệu bản thân:</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Viết vài dòng về bạn..."
                    rows={4}
                    maxLength={500}
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
              <div className="stat-value">{user?.stars_balance || 0}</div>
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
