import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

/**
 * Header Component - Header section cho layouts
 *
 * Features:
 * - Back button (customizable)
 * - Title/Breadcrumb
 * - Action buttons (custom slots)
 * - Responsive
 *
 * Props:
 * - title: string - Tiêu đề trang
 * - showBackButton: boolean - Hiển thị nút quay lại
 * - backPath: string - Đường dẫn quay lại (default: '/game-map')
 * - backText: string - Text nút quay lại (default: 'Về trang chủ')
 * - onBack: function - Custom handler cho nút back
 * - headerLeft: ReactNode - Custom content bên trái
 * - headerCenter: ReactNode - Custom content ở giữa
 * - headerRight: ReactNode - Custom content bên phải
 * - showBreadcrumb: boolean - Hiển thị breadcrumb
 * - breadcrumbItems: array - Breadcrumb items
 */

const Header = ({
  title,
  showBackButton = true,
  backPath = '/game-map',
  backText = 'Về trang chủ',
  onBack,
  headerLeft,
  headerCenter,
  headerRight,
  showBreadcrumb = false,
  breadcrumbItems = [],
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(backPath);
    }
  };

  return (
    <header className={`layout-header ${className}`}>
      <div className="header-container">
        {/* Left Section */}
        <div className="header-left">
          {headerLeft || (
            showBackButton && (
              <button
                onClick={handleBack}
                className="back-button"
                aria-label={backText}
              >
                <span className="back-icon">←</span>
                <span className="back-text">{backText}</span>
              </button>
            )
          )}
        </div>

        {/* Center Section */}
        <div className="header-center">
          {headerCenter || (
            <>
              {showBreadcrumb && breadcrumbItems.length > 0 ? (
                <nav className="breadcrumb" aria-label="Breadcrumb">
                  <ol className="breadcrumb-list">
                    {breadcrumbItems.map((item, index) => (
                      <li key={index} className="breadcrumb-item">
                        {item.path ? (
                          <a
                            href={item.path}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(item.path);
                            }}
                            className="breadcrumb-link"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span className="breadcrumb-current">{item.label}</span>
                        )}
                        {index < breadcrumbItems.length - 1 && (
                          <span className="breadcrumb-separator" aria-hidden="true">
                            /
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : (
                title && <h1 className="header-title">{title}</h1>
              )}
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="header-right">
          {headerRight}
        </div>
      </div>
    </header>
  );
};

export default Header;
