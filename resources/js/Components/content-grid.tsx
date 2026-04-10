"use client"

import { ContentCard, ContentCardData } from "./content-card"

interface ContentGridProps {
  contents: ContentCardData[]
  emptyMessage?: string
}

export function ContentGrid({ contents, emptyMessage = "No content available yet. Check back soon! 🎉" }: ContentGridProps) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-8xl mb-6">😊</div>
        <p className="text-2xl font-bold text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-12 max-w-5xl mx-auto">
      {contents.map((content) => (
        <div 
          key={content.id}
          className="w-full h-full"
        >
          <ContentCard content={content} />
        </div>
      ))}
    </div>
  )
}
