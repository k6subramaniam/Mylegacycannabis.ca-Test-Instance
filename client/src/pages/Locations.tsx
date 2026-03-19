import SEOHead from '@/components/SEOHead';
import { Breadcrumbs, WaveDivider } from '@/components/Layout';
import { storeLocations } from '@/lib/data';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const HERO_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/86973655/5wgxseZemq4jvbSSj7t6zG/hero-locations-2eTfMvHXR9EvDXMXwCxHwg.webp';
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function Locations() {
  return (
    <>
      <SEOHead
        title="Store Locations — 24/7 Cannabis Dispensary"
        description="Visit any of our 5 My Legacy Cannabis locations across the GTA and Ottawa. Open 24/7. Mississauga, Hamilton, Queen St Toronto, Dundas Toronto, and Merivale Ottawa."
        canonical="https://mylegacycannabis.ca/locations"
      />

      {/* Hero */}
      <section className="relative bg-[#4B2D8E] overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="My Legacy Cannabis store locations" className="w-full h-full object-cover opacity-30" loading="eager" />
          <div className="absolute inset-0 bg-[#4B2D8E]/70" />
        </div>
        <div className="container relative z-10 py-12 md:py-20">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Locations' }]} />
          <h1 className="font-display text-3xl md:text-4xl text-white mb-3">OUR LOCATIONS</h1>
          <p className="text-white/70 font-body max-w-lg">5 locations across the Greater Toronto Area and Ottawa — all open 24/7.</p>
        </div>
        <WaveDivider color="#ffffff" />
      </section>

      {/* Locations Grid */}
      <section className="bg-white py-12 md:py-16 -mt-1">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storeLocations.map((loc, i) => (
              <motion.article key={loc.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-[#F5F5F5] rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                itemScope itemType="https://schema.org/LocalBusiness">
                {/* Map embed */}
                <div className="aspect-video bg-gray-200">
                  <iframe
                    src={loc.mapUrl}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of My Legacy Cannabis ${loc.name}`}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h2 className="font-display text-xl text-[#4B2D8E]" itemProp="name">MY LEGACY — {loc.name.toUpperCase()}</h2>
                      <p className="text-sm text-gray-600 font-body mt-1" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                        <span itemProp="streetAddress">{loc.address}</span>, <span itemProp="addressLocality">{loc.city}</span>, <span itemProp="addressRegion">{loc.province}</span> <span itemProp="postalCode">{loc.postalCode}</span>
                      </p>
                    </div>
                    <div className="bg-[#F15929] text-white font-display text-xs px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1">
                      <Clock size={12} /> 24/7
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <a href={`tel:${loc.phone.replace(/\D/g, '')}`} className="flex items-center gap-1.5 text-sm text-[#4B2D8E] hover:text-[#F15929] font-body transition-colors" itemProp="telephone">
                      <Phone size={14} /> {loc.phone}
                    </a>
                  </div>

                  <div className="flex gap-3">
                    <a href={`tel:${loc.phone.replace(/\D/g, '')}`}
                      className="flex-1 bg-[#4B2D8E] hover:bg-[#3a2270] text-white text-center font-display text-sm py-3 rounded-full transition-colors flex items-center justify-center gap-2">
                      <Phone size={16} /> CALL NOW
                    </a>
                    <a href={loc.directionsUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 bg-[#F15929] hover:bg-[#d94d22] text-white text-center font-display text-sm py-3 rounded-full transition-colors flex items-center justify-center gap-2">
                      <Navigation size={16} /> DIRECTIONS
                    </a>
                  </div>

                  <meta itemProp="openingHours" content="Mo-Su 00:00-23:59" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD for each location */}
      {storeLocations.map(loc => (
        <script key={loc.id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "LocalBusiness",
          "name": `My Legacy Cannabis — ${loc.name}`,
          "image": "https://d2xsxph8kpxj0f.cloudfront.net/86973655/5wgxseZemq4jvbSSj7t6zG/myLegacy-logo_1c4faece.png",
          "telephone": loc.phone,
          "address": { "@type": "PostalAddress", "streetAddress": loc.address, "addressLocality": loc.city, "addressRegion": loc.province, "postalCode": loc.postalCode, "addressCountry": "CA" },
          "geo": { "@type": "GeoCoordinates", "latitude": loc.lat, "longitude": loc.lng },
          "openingHoursSpecification": { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "00:00", "closes": "23:59" },
          "url": "https://mylegacycannabis.ca/locations"
        })}} />
      ))}
    </>
  );
}
