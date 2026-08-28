import { getProductBySlug, getProductSlugs } from "@/lib/products";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";
import siteConfig from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: `Product | ${siteConfig.storeName}`,
      description: siteConfig.storeTagline,
    };
  }

  return {
    title: `${product.title} | ${siteConfig.storeName}`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images && product.images[0]
        ? [{ url: `${siteConfig.siteUrl}${product.images[0]}`, width: 800, height: 1000 }]
        : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return <ProductDetailClient initialProduct={product} slug={slug} />;
}
