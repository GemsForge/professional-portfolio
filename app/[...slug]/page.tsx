import { PortfolioPage } from "@/components/portfolio-page";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const segments = slug.filter(Boolean);
  const pathname = segments.length ? `/${segments.join("/")}/` : "/";
  return <PortfolioPage pathname={pathname} />;
}
