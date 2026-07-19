import type { User } from "@prisma/client";
import Link from "next/link";
import { getSiteName } from "@/lib/preview-data";

export default function PreviewFooter({ profile }: { profile: User }) {
  const siteName = getSiteName(profile.nickname);

  return (
    <footer>
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <h5>{siteName}</h5>
            <p className="small mb-0">
              {profile.bio ||
                "Professional tour guide offering authentic travel experiences and curated itineraries."}
            </p>
          </div>
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <Link href="/preview">Home</Link>
            <a href="/preview#tours">Tours</a>
            <a href="/preview#guide">Travel Guide</a>
            <a href="/preview#contact">Contact</a>
          </div>
          <div className="col-md-4" id="contact">
            <h5>Contact Us</h5>
            {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
            {profile.phone && <a href={`tel:${profile.phone}`}>{profile.phone}</a>}
            {profile.wechat && <span className="d-block small">WeChat: {profile.wechat}</span>}
          </div>
        </div>
        <hr className="border-secondary my-4 opacity-25" />
        <p className="text-center small mb-0 opacity-75">
          © {new Date().getFullYear()} {siteName}. Powered by TourSaaS.
        </p>
      </div>
    </footer>
  );
}
