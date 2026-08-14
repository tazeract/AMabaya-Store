import type { Metadata } from "next";
import { AboutPageContent } from "./AboutPageContent";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Learn about AMabaya — Pakistan's premier luxury abaya brand, born from a passion for modest fashion and cultural heritage.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
