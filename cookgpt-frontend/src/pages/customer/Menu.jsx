import React, { useState, useEffect } from 'react';
import BaseLayout from '../../components/layouts/BaseLayout';
import apiClient from '../../api/apiClient';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, search]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('menu/categories/');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = 'menu/items/?is_available=true';
      if (selectedCategory) url += `&category_id=${selectedCategory}`;
      if (search) url += `&search=${search}`;
      
      const res = await apiClient.get(url);
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (itemId) => {
    try {
      await apiClient.post('cart/add/', { menu_item_id: itemId, quantity: 1 });
      alert('Item added to cart!'); // In production, replace with nice toast notification
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Please log in to add items to your cart.');
      } else {
        alert('Failed to add item. ' + (err.response?.data?.detail || ''));
      }
    }
  };

  return (
    <BaseLayout fullScreen={true}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '280px 1fr', 
        gap: '0', 
        flex: 1, 
        overflow: 'hidden',
        background: 'var(--bg-color)'
      }}>
        
        {/* Sidebar */}
        <div style={{ 
          padding: '2rem', 
          borderRight: '1px solid var(--border-color)',
          background: 'var(--surface-color)',
          overflowY: 'auto'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', fontSize: '1.1rem', letterSpacing: '1px' }}>CATEGORIES</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <button 
                onClick={() => setSelectedCategory(null)}
                style={{
                  width: '100%', textAlign: 'left', background: selectedCategory === null ? 'var(--primary-color)' : 'transparent',
                  color: selectedCategory === null ? 'white' : 'var(--text-primary)', border: 'none',
                  boxShadow: 'none', padding: '0.8rem 1.2rem', justifyContent: 'flex-start',
                  borderRadius: '12px', fontSize: '0.9rem'
                }}
              >
                All Items
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <button 
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    width: '100%', textAlign: 'left', background: selectedCategory === cat.id ? 'var(--primary-color)' : 'transparent',
                    color: selectedCategory === cat.id ? 'white' : 'var(--text-primary)', border: 'none',
                    boxShadow: 'none', padding: '0.8rem 1.2rem', justifyContent: 'flex-start',
                    borderRadius: '12px', fontSize: '0.9rem'
                  }}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Menu Grid */}
        <div style={{ padding: '2rem 3rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>The Menu</h2>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search culinary delights..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  padding: '0.8rem 1.2rem 0.8rem 3rem', 
                  borderRadius: '30px', 
                  border: '1px solid var(--border-color)', 
                  outline: 'none', 
                  width: '350px',
                  background: 'var(--surface-color)',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
               <p>Loading incredibly delicious food...</p>
            </div>
          ) : items.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '5rem' }}>No items found matching your criteria.</p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '2rem',
              paddingBottom: '4rem' 
            }}>
              {items.map(item => (
                <div key={item.id} className="card glass-panel" style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <div style={{ height: '220px', background: '#e2e8f0', overflow: 'hidden', position: 'relative' }}>
                    {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Image</div>
                    )}
                    <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '5px' }}>
                        {item.is_vegetarian ? (
                          <span style={{ background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Veg</span>
                        ) : (
                          <span style={{ background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Non-Veg</span>
                        )}
                    </div>
                  </div>
                  <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.8rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', letterSpacing: '-0.5px' }}>{item.name}</h3>
                      <span style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '1.1rem' }}>₹{item.price}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, lineHeight: '1.6' }}>{item.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      <span>⏱️ {item.preparation_time} mins</span>
                      {item.calories && <span>🔥 {item.calories} kcal</span>}
                    </div>
                    <button onClick={() => handleAddToCart(item.id)} style={{ width: '100%', padding: '1rem' }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </BaseLayout>
  );
};

export default Menu;
