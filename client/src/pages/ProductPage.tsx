import { useParams, Link } from 'wouter';
import SEOHead from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { products, shippingZones, FREE_SHIPPING_THRESHOLD, calculatePointsEarned } from '@/lib/data';
import { ShoppingCart, Minus, Plus, Truck, Star, Shield, Clock, Gift, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find(p => p.slug === slug);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl text-[#4B2D8E] mb-4">PRODUCT NOT FOUND</h1>
        <Link href="/shop" className="text-[#F15929] font-display hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const related = products.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);
  const points = calculatePointsEarned(product.price * quantity);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} added to cart`);
    setQuantity(1);
  };

  return (
    <>
      <SEOHead
        title={`${product.name} — ${product.category}`}
        description={product.shortDescription}
        canonical={`https://mylegacycannabis.ca/product/${product.slug}`}
        ogType="product"
      />

      <section className="bg-white py-6 md:py-10">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }, { label: product.category, href: `/shop/${product.categorySlug}` }, { label: product.name }]} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* Product Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="relative aspect-square bg-[#F5F5F5] rounded-2xl overflow-hidden">
              <img src={product.images[0] || product.image} alt={product.name} className="w-full h-full object-cover" loading="eager" />
              {product.isNew && <span className="absolute top-4 left-4 bg-[#F15929] text-white font-display text-sm px-4 py-1.5 rounded-full">NEW</span>}
              <span className="absolute top-4 right-4 bg-[#4B2D8E] text-white font-mono-legacy text-sm px-3 py-1 rounded-full">{product.strainType}</span>
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#4B2D8E]/10 text-[#4B2D8E] font-display text-xs px-3 py-1 rounded-full">{product.category}</span>
                <span className="bg-[#F15929]/10 text-[#F15929] font-display text-xs px-3 py-1 rounded-full">{product.strainType}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl text-[#4B2D8E] mb-2">{product.name.toUpperCase()}</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'text-[#F15929] fill-[#F15929]' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-body">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-3xl text-[#4B2D8E]">${product.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500 font-mono-legacy">{product.weight}</span>
              </div>

              <div className="bg-[#F5F5F5] rounded-xl p-4 mb-4 space-y-2 font-mono-legacy text-sm">
                <div className="flex justify-between"><span className="text-gray-500">THC:</span><span className="text-[#333] font-medium">{product.thc}</span></div>
                {product.cbd && <div className="flex justify-between"><span className="text-gray-500">CBD:</span><span className="text-[#333] font-medium">{product.cbd}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Flavor:</span><span className="text-[#333] font-medium">{product.flavor}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Weight:</span><span className="text-[#333] font-medium">{product.weight}</span></div>
              </div>

              <p className="text-gray-600 font-body text-sm leading-relaxed mb-6">{product.description}</p>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center bg-[#F5F5F5] rounded-full">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-[#F15929] transition-colors" aria-label="Decrease quantity"><Minus size={16} /></button>
                  <span className="w-10 text-center font-display text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-[#F15929] transition-colors" aria-label="Increase quantity"><Plus size={16} /></button>
                </div>
                <button onClick={handleAddToCart}
                  className="flex-1 bg-[#F15929] hover:bg-[#d94d22] text-white font-display py-3.5 px-6 rounded-full transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                  <ShoppingCart size={18} /> ADD TO CART — ${(product.price * quantity).toFixed(2)}
                </button>
              </div>

              {/* Points earned */}
              <div className="bg-[#4B2D8E]/5 border border-[#4B2D8E]/10 rounded-xl p-3 mb-4 flex items-center gap-3">
                <Gift size={18} className="text-[#F15929] shrink-0" />
                <p className="text-sm font-body text-[#4B2D8E]">
                  <strong>Earn {points} points</strong> with this purchase — <Link href="/rewards" className="text-[#F15929] hover:underline">Learn about Rewards</Link>
                </p>
              </div>

              {/* Shipping estimates */}
              <div className="bg-[#F5F5F5] rounded-xl p-4">
                <h3 className="font-display text-sm text-[#4B2D8E] mb-3 flex items-center gap-2"><Truck size={16} /> SHIPPING ESTIMATES</h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono-legacy">
                  {shippingZones.map(zone => (
                    <div key={zone.name} className="flex justify-between bg-white rounded-lg p-2">
                      <span className="text-gray-500">{zone.name}</span>
                      <span className="text-[#333]">${zone.rate} · {zone.deliveryTime}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#F15929] font-body mt-2 flex items-center gap-1">
                  <Truck size={12} /> Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 font-body">
                <span className="flex items-center gap-1"><Shield size={14} className="text-[#4B2D8E]" /> Age Verified (19+)</span>
                <span className="flex items-center gap-1"><Clock size={14} className="text-[#4B2D8E]" /> Ships within 24hrs</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sticky mobile add to cart */}
      <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 p-3 safe-area-bottom">
        <button onClick={handleAddToCart}
          className="w-full bg-[#F15929] hover:bg-[#d94d22] text-white font-display py-3.5 rounded-full flex items-center justify-center gap-2">
          <ShoppingCart size={18} /> ADD TO CART — ${(product.price * quantity).toFixed(2)}
        </button>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="bg-[#F5F5F5] py-12">
          <div className="container">
            <h2 className="font-display text-2xl text-[#4B2D8E] mb-6">MORE {product.category.toUpperCase()}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} href={`/product/${p.slug}`} className="bg-white rounded-2xl overflow-hidden group hover:shadow-lg transition-all">
                  <div className="aspect-square overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-display text-xs text-[#4B2D8E]">{p.name.toUpperCase()}</h3>
                    <p className="font-display text-sm text-[#4B2D8E] mt-1">${p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Product",
        "name": product.name, "description": product.shortDescription,
        "image": product.images[0] || product.image,
        "brand": { "@type": "Brand", "name": "My Legacy Cannabis" },
        "offers": { "@type": "Offer", "price": product.price.toFixed(2), "priceCurrency": "CAD", "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", "seller": { "@type": "Organization", "name": "My Legacy Cannabis" } },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": product.rating, "reviewCount": product.reviewCount }
      })}} />
    </>
  );
}
