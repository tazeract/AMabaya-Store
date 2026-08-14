import { getProductBySlug, getProductSlugs } from "@/lib/products";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";
import siteConfig from "@/lib/siteConfig";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.title} | ${siteConfig.storeName}`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images[0]
        ? [{ url: `${siteConfig.siteUrl}${product.images[0]}`, width: 800, height: 1000 }]
        : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
