import { NewsDetailPage } from "@/features/news/components/news-detail-page"

type Props = {
  params: Promise<{ slug: string; locale: string }>
}

export default async function SingleNewsRoutePage({ params }: Props) {
  const { slug } = await params
  return <NewsDetailPage slug={slug} />
}
