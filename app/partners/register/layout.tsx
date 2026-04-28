import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Партнер бүртгэл",
  description:
    "Scholarship MN Academy-ийн түнш байгууллагын бүртгэлийн хуудас. Байгууллагын мэдээллээ оруулж хамтын ажиллагааны хүсэлт илгээнэ үү.",
  alternates: {
    canonical: "/partners/register",
  },
  openGraph: {
    title: "Партнер бүртгэл | Scholarship MN Academy",
    description:
      "Scholarship MN Academy-ийн түнш байгууллагын бүртгэлийн хуудас. Мэдээллээ бүртгүүлж хамтын ажиллагааны хүсэлт илгээнэ үү.",
    url: "/partners/register",
    type: "website",
  },
};

export default function PartnerRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
