import type { User } from "@prisma/client";
import Link from "next/link";
import { getSiteName } from "@/lib/preview-data";

type Props = {
  profile: User;
  active?: "home" | "tours" | "guide" | "about" | "contact";
};

export default function PreviewHeader({ profile, active = "home" }: Props) {
  const siteName = getSiteName(profile.nickname);
  const nameParts = siteName.split(/\s+/);
  const firstPart = nameParts[0] || siteName;
  const restPart = nameParts.slice(1).join(" ");

  return (
    <>
      <div className="top-bar d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-4">
            {profile.email && (
              <a href={`mailto:${profile.email}`}>
                <i className="far fa-envelope me-1" /> {profile.email}
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`}>
                <i className="fas fa-phone me-1" /> {profile.phone}
              </a>
            )}
            {profile.wechat && (
              <span>
                <i className="fab fa-weixin me-1" /> {profile.wechat}
              </span>
            )}
          </div>
          <div className="d-flex gap-3">
            <span>English</span>
            <span>|</span>
            <span>中文</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <nav className="navbar navbar-expand-lg py-3">
            <Link className="navbar-brand d-flex align-items-center gap-2" href="/preview">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt={siteName}
                  width={36}
                  height={36}
                  className="rounded-circle object-fit-cover"
                  style={{ width: 36, height: 36 }}
                />
              ) : (
                <i className="fas fa-landmark text-primary fs-4" />
              )}
              <span className="logo-text">
                {firstPart}
                {restPart ? <> <span>{restPart}</span></> : null}
              </span>
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#previewNav"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="previewNav">
              <ul className="navbar-nav mx-auto main-nav">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${active === "home" ? "active" : ""}`}
                    href="/preview"
                  >
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${active === "tours" ? "active" : ""}`}
                    href="/preview#tours"
                  >
                    Tours
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${active === "guide" ? "active" : ""}`}
                    href="/preview#guide"
                  >
                    Travel Guide
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${active === "about" ? "active" : ""}`}
                    href="/preview#about"
                  >
                    About Us
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${active === "contact" ? "active" : ""}`}
                    href="/preview#contact"
                  >
                    Contact
                  </a>
                </li>
              </ul>
              <div className="d-flex gap-2">
                <a href="/preview#contact" className="btn btn-outline-brand btn-sm">
                  Inquire Now
                </a>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
