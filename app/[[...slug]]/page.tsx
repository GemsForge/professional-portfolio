import { PortfolioPage } from "@/components/portfolio-page";

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const pathname = slug?.length ? `/${slug.join("/")}/` : "/";
  return <PortfolioPage pathname={pathname} />;
}
