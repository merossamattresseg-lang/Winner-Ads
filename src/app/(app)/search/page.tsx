import { SearchView } from "./SearchView";

export const metadata = { title: "بحث الإعلانات" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchView initialQuery={q ?? ""} />;
}
