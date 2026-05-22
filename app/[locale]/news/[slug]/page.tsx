import { NewsPage } from "@/features/news"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function SingleNewsRoutePage({ params }: Props) {
  await params
  return <NewsPage />
}
