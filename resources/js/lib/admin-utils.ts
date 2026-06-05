import type { CarouselImage, BlogPost, User, Video, FireCodeSection } from "@/types/admin"

export const getPermissionsForRole = (role?: string) => {
  const roles = (role ?? "guest").split(",");
  const isAdmin = roles.includes("admin");
  const isProfessional = roles.includes("professional") || isAdmin;
  return {
    accessKids: roles.includes("kid") || isProfessional,
    accessAdult: roles.includes("adult") || isProfessional,
    accessProfessional: isProfessional,
    isAdmin: isAdmin,
  };
}

export const normalizeCarouselImage = (image: any): CarouselImage => ({
  id: image?.id,
  title: image?.title ?? "",
  altText: image?.altText ?? image?.alt_text ?? image?.alt ?? "",
  url: image?.url ?? image?.imageUrl ?? image?.image_url ?? "",
})

export const normalizeBlogPost = (post: any): BlogPost => ({
  id: post?.id,
  title: post?.title ?? "",
  excerpt: post?.excerpt ?? "",
  content: post?.content ?? "",
  imageUrl: post?.imageUrl ?? post?.image_url ?? "",
  category: post?.category ?? "adult",
  createdAt: post?.createdAt ?? post?.created_at ?? new Date().toISOString(),
  author: typeof post?.author === "string" ? post.author : post?.author?.name ?? "Unknown",
})

export const normalizeVideo = (video: any): Video => {
  let youtubeId = video?.youtubeId ?? video?.youtube_id ?? "";
  
  // If it's a full URL, extract the ID
  if (youtubeId.includes('youtube.com') || youtubeId.includes('youtu.be')) {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([^&?\n]+)/;
    const match = youtubeId.match(regex);
    if (match && match[1]) {
      youtubeId = match[1];
    } else {
      // Manual fallback
      try {
        const url = new URL(youtubeId);
        if (url.hostname.includes('youtube.com')) {
          youtubeId = url.searchParams.get('v') || youtubeId.split('/').pop() || youtubeId;
        } else if (url.hostname.includes('youtu.be')) {
          youtubeId = url.pathname.slice(1);
        }
      } catch (e) {
        // Leave as is
      }
    }
  }

  // Clean up
  if (youtubeId.includes('?')) youtubeId = youtubeId.split('?')[0];
  if (youtubeId.includes('&')) youtubeId = youtubeId.split('&')[0];

  return {
    ...video,
    youtubeId,
    isActive: video?.isActive ?? video?.is_active ?? false,
  };
}

export const normalizeUser = (user: any): User => ({
  ...user,
  email: user?.email ?? "",
  isActive: user?.isActive ?? user?.is_active ?? true,
  createdAt: user?.createdAt ?? user?.created_at ?? "",
  permissions: user?.permissions ?? getPermissionsForRole(user?.role),
})

export const normalizeFireCodeSection = (section: any): FireCodeSection => ({
  ...section,
  category: section?.category ?? "Fire Code",
  sectionNum: section?.sectionNum ?? section?.section_num ?? "",
  content: section?.content ?? "",
  description: section?.description ?? "",
  filename: section?.filename ?? "",
  updatedAt: section?.updatedAt ?? section?.updated_at ?? null,
})
