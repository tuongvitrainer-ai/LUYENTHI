import React from 'react';
import BaseLayout from './BaseLayout';
import './ArticleLayout.css';

/**
 * ArticleLayout - Layout đặc biệt cho bài viết, blog, tin tức
 *
 * Features:
 * - Typography tối ưu cho đọc
 * - Centered content, max-width hẹp hơn
 * - Author info, publish date
 * - Reading time estimate
 * - Share buttons
 * - Related articles
 * - Comments section (optional)
 *
 * Props:
 * - children: ReactNode - Nội dung bài viết
 * - title: string - Tiêu đề bài viết
 * - author: object - { name, avatar, bio }
 * - publishDate: string - Ngày xuất bản
 * - readingTime: number - Thời gian đọc (phút)
 * - category: string - Danh mục bài viết
 * - tags: array - Tags
 * - showShare: boolean - Hiển thị nút share
 * - onShare: function - Handler share
 * - showAuthor: boolean - Hiển thị thông tin tác giả
 * - relatedArticles: array - Bài viết liên quan
 * - showComments: boolean - Hiển thị comments
 * - className: string - Custom class
 */

const ArticleLayout = ({
  children,
  title,
  author,
  publishDate,
  readingTime,
  category,
  tags = [],
  showShare = true,
  onShare,
  showAuthor = true,
  relatedArticles = [],
  showComments = false,
  className = '',
  ...restProps
}) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Header right content (share, reading time)
  const headerRight = (
    <div className="article-header-right">
      {readingTime && (
        <div className="reading-time" title="Thời gian đọc">
          <span className="reading-icon">📖</span>
          <span className="reading-value">{readingTime} phút</span>
        </div>
      )}

      {showShare && (
        <button
          className="share-btn"
          onClick={onShare}
          aria-label="Chia sẻ bài viết"
          title="Chia sẻ"
        >
          🔗
        </button>
      )}
    </div>
  );

  return (
    <BaseLayout
      title={title}
      backgroundColor="#ffffff"
      maxWidth="800px"
      showSidebar={false}
      showBackButton={true}
      backPath="/articles"
      backText="Về danh sách bài viết"
      headerRight={headerRight}
      className={`article-layout ${className}`}
      containerClassName="article-container"
      {...restProps}
    >
      <article className="article-content" id="main-content">
        {/* Article Header */}
        <header className="article-header">
          <h1 className="article-title">{title}</h1>

          {/* Meta Info */}
          <div className="article-meta">
            {category && (
              <span className="article-category">{category}</span>
            )}

            {publishDate && (
              <time className="article-date" dateTime={publishDate}>
                {formatDate(publishDate)}
              </time>
            )}

            {author && showAuthor && (
              <div className="article-author-inline">
                {author.avatar && (
                  <img src={author.avatar} alt={author.name} className="author-avatar-small" />
                )}
                <span className="author-name">{author.name}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="article-tags">
              {tags.map((tag, index) => (
                <span key={index} className="article-tag">#{tag}</span>
              ))}
            </div>
          )}
        </header>

        {/* Article Body */}
        <div className="article-body">
          {children}
        </div>

        {/* Author Info Box */}
        {author && showAuthor && (
          <aside className="author-box">
            {author.avatar && (
              <img src={author.avatar} alt={author.name} className="author-avatar" />
            )}
            <div className="author-info">
              <h3 className="author-name-large">{author.name}</h3>
              {author.bio && <p className="author-bio">{author.bio}</p>}
            </div>
          </aside>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="related-articles">
            <h2 className="related-title">Bài viết liên quan</h2>
            <div className="related-grid">
              {relatedArticles.map((article, index) => (
                <a href={article.path} key={index} className="related-card">
                  {article.image && (
                    <img src={article.image} alt={article.title} className="related-image" />
                  )}
                  <div className="related-content">
                    <h3 className="related-card-title">{article.title}</h3>
                    {article.excerpt && (
                      <p className="related-excerpt">{article.excerpt}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        {showComments && (
          <section className="comments-section">
            <h2 className="comments-title">Bình luận</h2>
            <div className="comments-placeholder">
              {/* Comments component would go here */}
              <p className="comments-message">Tính năng bình luận sẽ sớm có mặt!</p>
            </div>
          </section>
        )}
      </article>
    </BaseLayout>
  );
};

export default ArticleLayout;
