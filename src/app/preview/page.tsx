import Link from "next/link";
import PreviewBanner from "@/components/preview/PreviewBanner";
import PreviewFooter from "@/components/preview/PreviewFooter";
import PreviewHeader from "@/components/preview/PreviewHeader";
import {
  DEFAULT_CARD_IMAGE,
  DEFAULT_HERO_IMAGE,
  getAllRoutes,
  getPublishedArticles,
  getSiteName,
  getSiteProfile,
} from "@/lib/preview-data";
import { formatDate, formatPrice } from "@/lib/format";

export default async function PreviewHomePage() {
  const [profile, routes, articles] = await Promise.all([
    getSiteProfile(),
    getAllRoutes(),
    getPublishedArticles(),
  ]);

  const siteName = getSiteName(profile.nickname);
  const heroImage = routes[0]?.image || DEFAULT_HERO_IMAGE;

  return (
    <>
      <PreviewBanner />
      <PreviewHeader profile={profile} active="home" />

      <section className="hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="col-lg-8">
            <div className="hero-badge">
              <i className="fas fa-compass" /> Professional Tour Guide
            </div>
            <h1>Explore with {siteName}!</h1>
            <p>
              {profile.bio ||
                "Discover authentic travel experiences, curated routes, and inspiring travel guides from a passionate local expert."}
            </p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <a href="#tours" className="btn btn-accent btn-lg">
                Browse Tours
              </a>
              <a
                href="#contact"
                className="btn btn-outline-light btn-lg rounded-pill"
              >
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <p className="section-label">About Us</p>
              <h2 className="section-title">Your Trustable Tour Guide</h2>
              <p className="text-muted">
                {profile.bio ||
                  `${siteName} offers carefully designed travel routes and insightful articles to help you plan unforgettable journeys.`}
              </p>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6">
                  <div className="feature-box text-center">
                    <div className="feature-icon mx-auto">
                      <i className="fas fa-route" />
                    </div>
                    <h3 className="h5">{routes.length}</h3>
                    <p className="text-muted small mb-0">Tour Routes</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="feature-box text-center">
                    <div className="feature-icon mx-auto">
                      <i className="fas fa-newspaper" />
                    </div>
                    <h3 className="h5">{articles.length}</h3>
                    <p className="text-muted small mb-0">Travel Articles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="tours">
        <div className="container">
          <p className="section-label">Popular Packages</p>
          <h2 className="section-title mb-2">Featured Tour Routes</h2>
          <p className="text-muted mb-5">
            Handpicked itineraries designed for memorable travel experiences.
          </p>

          {routes.length === 0 ? (
            <div className="text-center text-muted py-5">
              No tour routes yet. Add routes in the admin panel to see them here.
            </div>
          ) : (
            <div className="row g-4">
              {routes.map((route) => (
                <div key={route.id} className="col-md-6 col-lg-4">
                  <Link className="tour-card" href={`/preview/routes/${route.id}`}>
                    <div className="img-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={route.image || DEFAULT_CARD_IMAGE}
                        alt={route.title}
                      />
                    </div>
                    <div className="tour-card-body">
                      <h3>{route.title}</h3>
                      <p>{route.description || "Explore this curated itinerary."}</p>
                      <div className="tour-meta">
                        <span>{formatPrice(route.price)}</span>
                        <span>{route.days} Days</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" id="guide">
        <div className="container">
          <p className="section-label">Inspiration</p>
          <h2 className="section-title mb-5">Travel Guide & Articles</h2>

          {articles.length === 0 ? (
            <div className="text-center text-muted py-5">
              No published articles yet. Publish articles in the admin panel to see them here.
            </div>
          ) : (
            <div className="row g-4">
              {articles.map((article) => (
                <div key={article.id} className="col-md-6 col-lg-4">
                  <Link
                    className="blog-card"
                    href={`/preview/articles/${article.id}`}
                  >
                    <div className="img-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.coverImage || DEFAULT_CARD_IMAGE}
                        alt={article.title}
                      />
                    </div>
                    <div className="blog-card-body">
                      <h3>{article.title}</h3>
                      <p className="text-muted small mb-0">
                        {formatDate(article.createdAt)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="contact-box">
            <h2 className="mb-3">Plan Your Journey Today</h2>
            <p className="mb-4 opacity-90">
              Get in touch for personalized travel advice and itinerary planning.
            </p>
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="btn btn-light btn-lg rounded-pill">
                {profile.email}
              </a>
            )}
          </div>
        </div>
      </section>

      <PreviewFooter profile={profile} />
    </>
  );
}
