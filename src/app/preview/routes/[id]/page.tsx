import Link from "next/link";
import { notFound } from "next/navigation";
import PreviewBanner from "@/components/preview/PreviewBanner";
import PreviewFooter from "@/components/preview/PreviewFooter";
import PreviewHeader from "@/components/preview/PreviewHeader";
import {
  DEFAULT_CARD_IMAGE,
  getRouteById,
  getSiteProfile,
  splitHighlights,
} from "@/lib/preview-data";
import { formatPrice } from "@/lib/format";

type Props = { params: { id: string } };

export default async function PreviewRoutePage({ params }: Props) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const [profile, route] = await Promise.all([
    getSiteProfile(),
    getRouteById(id),
  ]);

  if (!route) notFound();

  const highlights = splitHighlights(route.highlights);
  const heroImage = route.image || DEFAULT_CARD_IMAGE;

  return (
    <>
      <PreviewBanner />
      <PreviewHeader profile={profile} active="tours" />

      <section className="detail-hero">
        <div
          className="detail-hero-bg"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="detail-hero-overlay" />
        <div className="container detail-hero-content">
          <Link href="/preview#tours" className="text-white-50 small text-decoration-none">
            ← Back to Tours
          </Link>
          <h1 className="mt-2">{route.title}</h1>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge bg-light text-dark px-3 py-2">
              {formatPrice(route.price)}
            </span>
            <span className="badge bg-light text-dark px-3 py-2">
              {route.days} Days
            </span>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="detail-content">
            {route.description && (
              <>
                <h2 className="h4 mb-3">Overview</h2>
                <p className="text-muted mb-4">{route.description}</p>
              </>
            )}

            {highlights.length > 0 && (
              <>
                <h2 className="h4 mb-3">Trip Highlights</h2>
                <ul className="highlights-list mb-4">
                  {highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="contact-box mt-4">
              <h2 className="h4 mb-3">Interested in this tour?</h2>
              <p className="mb-3 opacity-90">
                Contact us to customize this itinerary or ask any questions.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="btn btn-light rounded-pill">
                    Email Us
                  </a>
                )}
                {profile.wechat && (
                  <span className="btn btn-outline-light rounded-pill">
                    WeChat: {profile.wechat}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PreviewFooter profile={profile} />
    </>
  );
}
