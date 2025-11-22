import React, { useState, useEffect } from 'react';
import './GameConfigEditor.css';
import gameConfigData from '../../config/gameConfig.json';

/**
 * GAME CONFIG EDITOR - Giao diện chỉnh sửa config game trực quan
 *
 * Tương tự WordPress Editor:
 * - Click vào field để edit
 * - Live preview
 * - Save/Export config
 * - Import config từ file
 *
 * Usage: Truy cập /admin/game-config
 */

const GameConfigEditor = () => {
  const [config, setConfig] = useState(gameConfigData.thuThachKhoiDau);
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  // Update config value
  const updateConfig = (path, value) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
    setSaved(false);
  };

  // Save config to localStorage (hoặc API sau này)
  const saveConfig = () => {
    localStorage.setItem('gameConfig_thuThachKhoiDau', JSON.stringify(config));
    setSaved(true);

    // Download config file
    const blob = new Blob([JSON.stringify({ thuThachKhoiDau: config }, null, 2)],
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gameConfig.json';
    a.click();

    setTimeout(() => setSaved(false), 3000);
  };

  // Import config from file
  const importConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setConfig(imported.thuThachKhoiDau || imported);
          alert('✅ Import thành công!');
        } catch (error) {
          alert('❌ File không hợp lệ!');
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset to default
  const resetToDefault = () => {
    if (window.confirm('Bạn có chắc muốn reset về mặc định?')) {
      setConfig(gameConfigData.thuThachKhoiDau);
      setSaved(false);
    }
  };

  return (
    <div className="game-config-editor">
      {/* Header */}
      <div className="editor-header">
        <h1>🎮 Chỉnh sửa Game Config</h1>
        <p>Tùy chỉnh text, màu sắc, icon một cách trực quan - Giống WordPress!</p>

        <div className="header-actions">
          <button className="btn-save" onClick={saveConfig}>
            {saved ? '✅ Đã lưu!' : '💾 Lưu & Tải xuống'}
          </button>

          <label className="btn-import">
            📂 Import Config
            <input type="file" accept=".json" onChange={importConfig} style={{ display: 'none' }} />
          </label>

          <button className="btn-reset" onClick={resetToDefault}>
            🔄 Reset mặc định
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="editor-tabs">
        <button
          className={activeTab === 'general' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('general')}
        >
          📝 Chung
        </button>
        <button
          className={activeTab === 'levels' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('levels')}
        >
          🎓 Cấp độ
        </button>
        <button
          className={activeTab === 'screens' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('screens')}
        >
          🖥️ Màn hình
        </button>
        <button
          className={activeTab === 'colors' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('colors')}
        >
          🎨 Màu sắc
        </button>
      </div>

      {/* Content */}
      <div className="editor-content">

        {/* TAB: GENERAL */}
        {activeTab === 'general' && (
          <div className="tab-panel">
            <h2>Cài đặt chung</h2>

            <div className="field-group">
              <label>Tiêu đề chính</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="KHỞI ĐỘNG THỬ THÁCH"
              />
            </div>

            <div className="field-group">
              <label>Câu hỏi chọn lớp</label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => updateConfig('subtitle', e.target.value)}
                placeholder="Bạn đang học lớp mấy?"
              />
            </div>

            <div className="field-group">
              <label>Màu nền câu hỏi</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.subtitleStyle.background}
                  onChange={(e) => updateConfig('subtitleStyle.background', e.target.value)}
                />
                <input
                  type="text"
                  value={config.subtitleStyle.background}
                  onChange={(e) => updateConfig('subtitleStyle.background', e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Màu viền câu hỏi</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.subtitleStyle.borderColor}
                  onChange={(e) => updateConfig('subtitleStyle.borderColor', e.target.value)}
                />
                <input
                  type="text"
                  value={config.subtitleStyle.borderColor}
                  onChange={(e) => updateConfig('subtitleStyle.borderColor', e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Text nút bắt đầu</label>
              <input
                type="text"
                value={config.startButton.text}
                onChange={(e) => updateConfig('startButton.text', e.target.value)}
                placeholder="Bắt đầu thử thách! 🚀"
              />
            </div>

            <div className="field-group">
              <label>Text khi đang tải</label>
              <input
                type="text"
                value={config.startButton.loadingText}
                onChange={(e) => updateConfig('startButton.loadingText', e.target.value)}
                placeholder="Đang tải câu hỏi..."
              />
            </div>
          </div>
        )}

        {/* TAB: LEVELS */}
        {activeTab === 'levels' && (
          <div className="tab-panel">
            <h2>Cấu hình cấp độ (Lớp 3, 4, 5)</h2>

            {config.levels.map((level, index) => (
              <div key={level.id} className="level-config">
                <h3>Lớp {level.id}</h3>

                <div className="field-group">
                  <label>Tên hiển thị</label>
                  <input
                    type="text"
                    value={level.name}
                    onChange={(e) => {
                      const newLevels = [...config.levels];
                      newLevels[index].name = e.target.value;
                      setConfig({ ...config, levels: newLevels });
                    }}
                  />
                </div>

                <div className="field-group">
                  <label>Icon (emoji)</label>
                  <input
                    type="text"
                    value={level.icon}
                    onChange={(e) => {
                      const newLevels = [...config.levels];
                      newLevels[index].icon = e.target.value;
                      setConfig({ ...config, levels: newLevels });
                    }}
                    placeholder="🎓"
                    maxLength="2"
                  />
                  <small>Paste emoji từ: <a href="https://emojipedia.org" target="_blank" rel="noopener noreferrer">emojipedia.org</a></small>
                </div>
              </div>
            ))}

            <hr />

            <h3>Cấu hình số câu hỏi</h3>
            <div className="field-group">
              <label>Tiêu đề</label>
              <input
                type="text"
                value={config.questionCountSection.title}
                onChange={(e) => updateConfig('questionCountSection.title', e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Gợi ý</label>
              <textarea
                value={config.questionCountSection.hint}
                onChange={(e) => updateConfig('questionCountSection.hint', e.target.value)}
                rows="2"
              />
            </div>

            <hr />

            <h3>Cấu hình độ khó</h3>
            <div className="field-group">
              <label>Tiêu đề</label>
              <input
                type="text"
                value={config.difficultySection.title}
                onChange={(e) => updateConfig('difficultySection.title', e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>Label "Dễ"</label>
                <input
                  type="text"
                  value={config.difficultySection.minLabel}
                  onChange={(e) => updateConfig('difficultySection.minLabel', e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Label "Khó"</label>
                <input
                  type="text"
                  value={config.difficultySection.maxLabel}
                  onChange={(e) => updateConfig('difficultySection.maxLabel', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: SCREENS */}
        {activeTab === 'screens' && (
          <div className="tab-panel">
            <h2>Màn hình Test</h2>

            <div className="field-group">
              <label>Tiêu đề</label>
              <input
                type="text"
                value={config.testScreen.title}
                onChange={(e) => updateConfig('testScreen.title', e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Label Timer</label>
              <input
                type="text"
                value={config.testScreen.timerLabel}
                onChange={(e) => updateConfig('testScreen.timerLabel', e.target.value)}
              />
            </div>

            <hr />

            <h2>Màn hình Kết quả</h2>

            <div className="field-group">
              <label>Tiêu đề</label>
              <input
                type="text"
                value={config.resultScreen.title}
                onChange={(e) => updateConfig('resultScreen.title', e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Label điểm số</label>
              <input
                type="text"
                value={config.resultScreen.scoreLabel}
                onChange={(e) => updateConfig('resultScreen.scoreLabel', e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Tiêu đề phân tích môn học</label>
              <input
                type="text"
                value={config.resultScreen.breakdownTitle}
                onChange={(e) => updateConfig('resultScreen.breakdownTitle', e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>Text nút "Làm lại"</label>
                <input
                  type="text"
                  value={config.resultScreen.retryButton}
                  onChange={(e) => updateConfig('resultScreen.retryButton', e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Text nút "Về trang chủ"</label>
                <input
                  type="text"
                  value={config.resultScreen.homeButton}
                  onChange={(e) => updateConfig('resultScreen.homeButton', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: COLORS */}
        {activeTab === 'colors' && (
          <div className="tab-panel">
            <h2>Bảng màu</h2>
            <p>Tùy chỉnh màu sắc chủ đạo của game</p>

            <div className="field-group">
              <label>Màu chính (Primary)</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.colors.primary}
                  onChange={(e) => updateConfig('colors.primary', e.target.value)}
                />
                <input
                  type="text"
                  value={config.colors.primary}
                  onChange={(e) => updateConfig('colors.primary', e.target.value)}
                />
              </div>
              <small>Dùng cho tiêu đề, viền, nút chính</small>
            </div>

            <div className="field-group">
              <label>Màu phụ (Accent)</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.colors.accent}
                  onChange={(e) => updateConfig('colors.accent', e.target.value)}
                />
                <input
                  type="text"
                  value={config.colors.accent}
                  onChange={(e) => updateConfig('colors.accent', e.target.value)}
                />
              </div>
              <small>Dùng cho highlight, nút "Bắt đầu"</small>
            </div>

            <div className="field-group">
              <label>Màu "Đúng"</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.colors.correct}
                  onChange={(e) => updateConfig('colors.correct', e.target.value)}
                />
                <input
                  type="text"
                  value={config.colors.correct}
                  onChange={(e) => updateConfig('colors.correct', e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Màu "Sai"</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.colors.incorrect}
                  onChange={(e) => updateConfig('colors.incorrect', e.target.value)}
                />
                <input
                  type="text"
                  value={config.colors.incorrect}
                  onChange={(e) => updateConfig('colors.incorrect', e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Màu cảnh báo (Warning)</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.colors.warning}
                  onChange={(e) => updateConfig('colors.warning', e.target.value)}
                />
                <input
                  type="text"
                  value={config.colors.warning}
                  onChange={(e) => updateConfig('colors.warning', e.target.value)}
                />
              </div>
            </div>

            <hr />

            <h3>Màu độ khó</h3>
            <div className="field-group">
              <label>Màu "Dễ"</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.difficultySection.colors.easy}
                  onChange={(e) => updateConfig('difficultySection.colors.easy', e.target.value)}
                />
                <input
                  type="text"
                  value={config.difficultySection.colors.easy}
                  onChange={(e) => updateConfig('difficultySection.colors.easy', e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Màu "Trung bình"</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.difficultySection.colors.medium}
                  onChange={(e) => updateConfig('difficultySection.colors.medium', e.target.value)}
                />
                <input
                  type="text"
                  value={config.difficultySection.colors.medium}
                  onChange={(e) => updateConfig('difficultySection.colors.medium', e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Màu "Khó"</label>
              <div className="color-input">
                <input
                  type="color"
                  value={config.difficultySection.colors.hard}
                  onChange={(e) => updateConfig('difficultySection.colors.hard', e.target.value)}
                />
                <input
                  type="text"
                  value={config.difficultySection.colors.hard}
                  onChange={(e) => updateConfig('difficultySection.colors.hard', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Preview */}
      <div className="editor-preview">
        <h3>🔍 Preview (Đang phát triển)</h3>
        <p>Sau khi lưu, hãy refresh trang game để xem thay đổi</p>
        <div className="preview-box">
          <div style={{
            background: config.subtitleStyle.background,
            borderColor: config.subtitleStyle.borderColor,
            border: '2px solid',
            borderRadius: '12px',
            padding: '15px',
            textAlign: 'center',
            fontWeight: config.subtitleStyle.fontWeight
          }}>
            {config.subtitle}
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '20px', justifyContent: 'center' }}>
            {config.levels.map(level => (
              <div key={level.id} style={{
                padding: '20px',
                background: '#f5f5f5',
                borderRadius: '16px',
                textAlign: 'center',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '3rem' }}>{level.icon}</div>
                <div style={{ fontWeight: '700', marginTop: '10px' }}>{level.name}</div>
              </div>
            ))}
          </div>

          <button style={{
            background: config.startButton.gradient,
            color: 'white',
            border: 'none',
            padding: config.startButton.padding,
            fontSize: config.startButton.fontSize,
            borderRadius: '12px',
            cursor: 'pointer',
            marginTop: '20px',
            fontWeight: '700'
          }}>
            {config.startButton.text}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="editor-instructions">
        <h3>📖 Hướng dẫn sử dụng</h3>
        <ol>
          <li>Chỉnh sửa các field ở tabs phía trên</li>
          <li>Click "Lưu & Tải xuống" để lưu config</li>
          <li>File <code>gameConfig.json</code> sẽ được tải về máy</li>
          <li>Copy file vào <code>/home/user/LUYENTHI/vuot-vu-mon/client/src/config/</code></li>
          <li>Refresh trang game để xem thay đổi</li>
        </ol>

        <div className="tip">
          <strong>💡 Mẹo:</strong> Dùng "Import Config" để load lại config đã lưu trước đó
        </div>
      </div>
    </div>
  );
};

export default GameConfigEditor;
