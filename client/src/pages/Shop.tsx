import { useState, useMemo } from 'react';
import { Link, useParams, useSearch } from 'wouter';
import SEOHead from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { products, categories } from '@/lib/data';
import { ShoppingCart, SlidersHorizontal, X, ChevronDown, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const HERO_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/86973655/5wgxseZemq4jvbSSj7t6zG/hero-shop-5tiqFdCHUdeMeR3zPVXYu5.webp';

export default function Shop() {
  const params = useParams<{ category?: string }>();
  const searchStr = useSearch();
  const searchParams = new URLSearchParams(searchStr);
  const urlCategory = params.category || searchParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedStrain, setSelectedStrain] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { addItem } = useCart();

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory) result = result.filter(p => p.categorySlug === selectedCategory);
    if (selectedStrain) result = result.filter(p => p.strainType === selectedStrain);
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return result;
  }, [selectedCategory, selectedStrain, sortBy]);

  const activeCat = categories.find(c => c.slug === selectedCategory);
  const pageTitle = activeCat ? `${activeCat.name} — Shop` : 'Shop All Products';

  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }];
  if (activeCat) breadcrumbs.push({ label: activeCat.name, href: '' });

  return (
    <>
      <SEOHead title={pageTitle} description={activeCat ? activeCat.description : 'Browse our full selection of premium cannabis products — flower, pre-rolls, edibles, vapes, concentrates, and accessories. Free shipping on orders over $150.'} canonical={`https://mylegacycannabis.ca/shop${selectedCategory ? '/' + selectedCategory : ''}`} />

      {/* Hero */}
      <section className="relative bg-[#4B2D8E] py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Cannabis products shop" className="w-full h-full object-cover opacity-30" loading="eager" />
          <div className="absolute inset-0 bg-[#4B2D8E]/70" />
        </div>
        <div className="container relative z-10">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="font-display text-3xl md:text-4xl text-white">{activeCat ? activeCat.name.toUpperCase() : 'SHOP ALL'}</h1>
          <p className="text-white/70 font-body mt-2 max-w-lg">{activeCat ? activeCat.description : 'Browse our full selection of premium cannabis products.'}</p>
        </div>
      </section>

      <section className="bg-white py-8 md:py-12">
        <div className="container">
          {/* Filter bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden flex items-center gap-2 bg-[#F5F5F5] px-4 py-2.5 rounded-full font-display text-xs text-[#333]">
              <SlidersHorizontal size={16} /> FILTERS {(selectedCategory || selectedStrain) && <span className="bg-[#F15929] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center">!</span>}
            </button>
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <button onClick={() => { setSelectedCategory(''); setSelectedStrain(''); }}
                className={`px-4 py-2 rounded-full text-xs font-display transition-all ${!selectedCategory ? 'bg-[#4B2D8E] text-white' : 'bg-[#F5F5F5] text-[#333] hover:bg-[#e8e8e8]'}`}>ALL</button>
              {categories.map(cat => (
                <button key={cat.slug} onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-display transition-all ${selectedCategory === cat.slug ? 'bg-[#4B2D8E] text-white' : 'bg-[#F5F5F5] text-[#333] hover:bg-[#e8e8e8]'}`}>
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-body hidden sm:block">{filtered.length} products</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-[#F5F5F5] px-3 py-2 rounded-full text-xs font-body text-[#333] border-none focus:ring-2 focus:ring-[#4B2D8E]" aria-label="Sort products">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Mobile filters drawer */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden mb-6">
                <div className="bg-[#F5F5F5] rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm text-[#4B2D8E]">FILTERS</h3>
                    <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={18} /></button>
                  </div>
                  <div>
                    <p className="font-display text-xs text-gray-500 mb-2">CATEGORY</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSelectedCategory('')}
                        className={`px-3 py-1.5 rounded-full text-xs font-display ${!selectedCategory ? 'bg-[#4B2D8E] text-white' : 'bg-white text-[#333]'}`}>All</button>
                      {categories.map(cat => (
                        <button key={cat.slug} onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
                          className={`px-3 py-1.5 rounded-full text-xs font-display ${selectedCategory === cat.slug ? 'bg-[#4B2D8E] text-white' : 'bg-white text-[#333]'}`}>
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-xs text-gray-500 mb-2">STRAIN TYPE</p>
                    <div className="flex flex-wrap gap-2">
                      {['', 'Sativa', 'Indica', 'Hybrid', 'CBD'].map(s => (
                        <button key={s} onClick={() => setSelectedStrain(s === selectedStrain ? '' : s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-display ${selectedStrain === s || (!s && !selectedStrain) ? 'bg-[#F15929] text-white' : 'bg-white text-[#333]'}`}>
                          {s || 'All'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop strain filter */}
          <div className="hidden md:flex items-center gap-2 mb-6">
            <span className="text-xs text-gray-500 font-body mr-2">Strain:</span>
            {['', 'Sativa', 'Indica', 'Hybrid', 'CBD'].map(s => (
              <button key={s} onClick={() => setSelectedStrain(s === selectedStrain ? '' : s)}
                className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${selectedStrain === s || (!s && !selectedStrain) ? 'bg-[#F15929] text-white' : 'bg-[#F5F5F5] text-[#333] hover:bg-[#e8e8e8]'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-xl text-gray-400 mb-2">NO PRODUCTS FOUND</p>
              <p className="text-gray-500 font-body text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-[#F5F5F5] rounded-2xl overflow-hidden group hover:shadow-xl transition-all">
                  <Link href={`/product/${product.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {product.isNew && <span className="absolute top-2 left-2 bg-[#F15929] text-white font-display text-[10px] px-2.5 py-0.5 rounded-full">NEW</span>}
                      <span className="absolute top-2 right-2 bg-[#4B2D8E]/90 text-white font-mono-legacy text-[10px] px-2 py-0.5 rounded-full">{product.strainType}</span>
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-display text-xs md:text-sm text-[#4B2D8E] hover:text-[#F15929] transition-colors leading-tight">{product.name.toUpperCase()}</h3>
                    </Link>
                    <p className="text-[10px] text-gray-500 font-body mt-0.5">{product.category} · {product.weight}</p>
                    <p className="text-[10px] text-gray-400 font-mono-legacy">THC: {product.thc}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display text-base text-[#4B2D8E]">${product.price.toFixed(2)}</span>
                      <button onClick={() => { addItem(product); toast.success(`${product.name} added to cart`); }}
                        className="bg-[#F15929] hover:bg-[#d94d22] text-white p-2 rounded-full transition-all hover:scale-110 active:scale-95"
                        aria-label={`Add ${product.name} to cart`}>
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
