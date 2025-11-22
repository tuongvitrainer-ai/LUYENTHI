import React from 'react';
import BaseLayout from './BaseLayout';
import './LessonLayout.css';

/**
 * LessonLayout - Layout đặc biệt cho bài học và nội dung học tập
 *
 * Features:
 * - Màu nền trắng/sáng, tối ưu cho đọc
 * - Breadcrumb navigation
 * - Progress bar cho lesson progress
 * - Table of contents sidebar (optional)
 * - Next/Previous lesson buttons
 * - Bookmark functionality
 *
 * Props:
 * - children: ReactNode - Nội dung bài học
 * - title: string - Tiêu đề bài học
 * - breadcrumbItems: array - Breadcrumb items
 * - showProgress: boolean - Hiển thị progress bar
 * - progressValue: number - % progress (0-100)
 * - showTableOfContents: boolean - Hiển thị mục lục
 * - tableOfContents: array - Danh sách sections
 * - onNavigateSection: function - Handler khi click section
 * - showNextPrev: boolean - Hiển thị nút next/prev
 * - prevLesson: object - { title, path }
 * - nextLesson: object - { title, path }
 * - showBookmark: boolean - Hiển thị nút bookmark
 * - isBookmarked: boolean - Trạng thái bookmark
 * - onBookmark: function - Handler bookmark
 * - className: string - Custom class
 */

const LessonLayout = ({
  children,
  title,
  breadcrumbItems = [],
  showProgress = false,
  progressValue = 0,
  showTableOfContents = false,
  tableOfContents = [],
  onNavigateSection,
  showNextPrev = false,
  prevLesson,
  nextLesson,
  showBookmark = false,
  isBookmarked = false,
  onBookmark,
  className = '',
  ...restProps
}) => {
  // Header right content (bookmark, progress)
  const headerRight = (
    <div className="lesson-header-right">
      {showProgress && (
        <div className="lesson-progress-indicator" title={`Hoàn thành ${progressValue}%`}>
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="progress-svg">
              <path
                className="progress-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="progress-bar"
                strokeDasharray={`${progressValue}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.5" className="progress-text">{progressValue}%</text>
            </svg>
          </div>
        </div>
      )}

      {showBookmark && (
        <button
          className={`bookmark-btn ${isBookmarked ? 'bookmark-btn--active' : ''}`}
          onClick={onBookmark}
          aria-label={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}
          title={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu bài học'}
        >
          {isBookmarked ? '🔖' : '📑'}
        </button>
      )}
    </div>
  );

  return (
    <BaseLayout
      title={title}
      backgroundColor="#f5f7fa"
      maxWidth="1200px"
      showSidebar={true}
      sidebarVariant="compact"
      showBackButton={true}
      backPath="/lessons"
      backText="Về danh sách bài học"
      showBreadcrumb={breadcrumbItems.length > 0}
      breadcrumbItems={breadcrumbItems}
      headerRight={headerRight}
      showProgress={showProgress}
      className={`lesson-layout ${className}`}
      containerClassName="lesson-container"
      {...restProps}
    >
      <div className="lesson-wrapper">
        {/* Table of Contents (Sidebar) */}
        {showTableOfContents && tableOfContents.length > 0 && (
          <aside className="lesson-toc" aria-label="Mục lục">
            <h3 className="toc-title">Mục lục</h3>
            <nav>
              <ul className="toc-list">
                {tableOfContents.map((section, index) => (
                  <li key={index} className="toc-item">
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onNavigateSection) {
                          onNavigateSection(section.id);
                        } else {
                          document.getElementById(section.id)?.scrollIntoView({
                            behavior: 'smooth'
                          });
                        }
                      }}
                      className="toc-link"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <article className="lesson-content" id="main-content">
          {children}

          {/* Next/Previous Navigation */}
          {showNextPrev && (prevLesson || nextLesson) && (
            <nav className="lesson-navigation" aria-label="Điều hướng bài học">
              {prevLesson && (
                <a href={prevLesson.path} className="lesson-nav-btn lesson-nav-btn--prev">
                  <span className="nav-arrow">←</span>
                  <div className="nav-content">
                    <span className="nav-label">Bài trước</span>
                    <span className="nav-title">{prevLesson.title}</span>
                  </div>
                </a>
              )}

              {nextLesson && (
                <a href={nextLesson.path} className="lesson-nav-btn lesson-nav-btn--next">
                  <div className="nav-content">
                    <span className="nav-label">Bài tiếp theo</span>
                    <span className="nav-title">{nextLesson.title}</span>
                  </div>
                  <span className="nav-arrow">→</span>
                </a>
              )}
            </nav>
          )}
        </article>
      </div>
    </BaseLayout>
  );
};

export default LessonLayout;
