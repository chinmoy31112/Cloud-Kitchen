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
    <BaseLayout>
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', margin: '2rem 0' }}>
        
        {/* Sidebar */}
        <div className="card glass-panel" style={{ padding: '1.5rem', alignSelf: 'start', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Categories</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <button 
                onClick={() => setSelectedCategory(null)}
                style={{
                  width: '100%', textAlign: 'left', background: selectedCategory === null ? 'var(--primary-color)' : 'transparent',
                  color: selectedCategory === null ? 'white' : 'var(--text-primary)', border: 'none',
                  boxShadow: 'none', padding: '0.5rem 1rem', justifyContent: 'flex-start'
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
                    boxShadow: 'none', padding: '0.5rem 1rem', justifyContent: 'flex-start'
                  }}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Menu Grid */}
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Menu</h2>
            <input 
              type="text" 
              placeholder="Search food..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', width: '300px' }}
            />
          </div>

          {loading ? (
            <p>Loading incredibly delicious food...</p>
          ) : items.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No items found matching your criteria.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {items.map(item => (
                <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '200px', background: '#e2e8f0', overflow: 'hidden', position: 'relative' }}>
                    {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Image</div>
                    )}
                    {item.is_vegetarian ? (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Veg</span>
                    ) : (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Non-Veg</span>
                    )}
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{item.name}</h3>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{item.price}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>{item.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      <span>⏱️ {item.preparation_time} mins</span>
                      {item.calories && <span>🔥 {item.calories} kcal</span>}
                    </div>
                    <button onClick={() => handleAddToCart(item.id)} style={{ width: '100%' }}>
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
