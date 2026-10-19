import { PortfolioPage } from "@/components/portfolio-page";

/** Routes the site root through the same shared renderer as every other view. */
export default function Page() {
  return <PortfolioPage pathname="/" />;
}
