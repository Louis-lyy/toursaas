import Link from "next/link";
import { notFound } from "next/navigation";
import PreviewBanner from "@/components/preview/PreviewBanner";
import PreviewFooter from "@/components/preview/PreviewFooter";
import PreviewHeader from "@/components/preview/PreviewHeader";
import {
  DEFAULT_CARD_IMAGE,
  getArticleById,
  getSiteProfile,
} from "@/lib/preview-data";
import { formatDate } from "@/lib/format";

type Props = { params: { id: string } };

export default async function PreviewArticlePage({ params }: Props) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const [profile, article] = await Promise.all([
    getSiteProfile(),
    getArticleById(id),
  ]);

  if (!article) notFound();

  const heroImage = article.coverImage || DEFAULT_CARD_IMAGE;

  return (
    <>
      <PreviewBanner />
      <PreviewHeader profile={profile} active="guide" />

      <section className="detail-hero">
        <div
          className="detail-hero-bg"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="detail-hero-overlay" />
        <div className="container detail-hero-content">
          <Link href="/preview#guide" className="text-white-50 small text-decoration-none">
            ← Back to Travel Guide
          </Link>
          <h1 className="mt-2">{article.title}</h1>
          <p className="mb-0 opacity-75">{formatDate(article.createdAt)}</p>
          {article.status === "draft" && (
            <span className="badge bg-warning text-dark mt-2">Draft Preview</span>
          )}
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="detail-content">
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content || "<p>No content yet.</p>" }}
            />
          </div>
        </div>
      </section>

      <PreviewFooter profile={profile} />
    </>
  );
}
