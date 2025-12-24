/**
 * Article Screen
 * Full-screen article reader
 */

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { ArticleReader } from '../../components/content/ArticleReader';
import { getContentById } from '../../stores/contentStore';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams();
  const content = getContentById(id as string);

  if (!content || content.type !== 'article') {
    router.back();
    return null;
  }

  return (
    <ArticleReader
      content={content}
      onClose={() => router.back()}
    />
  );
}
