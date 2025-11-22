import React from 'react';
import { useParams } from 'react-router-dom';
import PageBuilder from './PageBuilder';

/**
 * Wrapper component để lấy pageName từ URL params
 * và truyền vào PageBuilder
 */
const PageBuilderWrapper = () => {
  const { pageName } = useParams();

  return <PageBuilder pageName={pageName || 'home'} />;
};

export default PageBuilderWrapper;
