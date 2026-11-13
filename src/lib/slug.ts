// أرقام الإعلانات والمعلنين في قاعدة البيانات بالشكل meta:123، وفي الروابط meta-123.
export const toSlug = (id: string) => id.replace(":", "-");
export const fromSlug = (slug: string) => {
  const m = slug.match(/^(meta|tiktok|reels|pinterest)-(.+)$/);
  return m ? `${m[1]}:${m[2]}` : slug;
};
