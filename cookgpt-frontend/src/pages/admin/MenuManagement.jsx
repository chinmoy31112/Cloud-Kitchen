import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import apiClient from '../../api/apiClient';

const MenuManagement = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        is_available: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsRes, catRes] = await Promise.all([
                apiClient.get('menu/items/'),
                apiClient.get('menu/categories/')
            ]);
            setItems(itemsRes.data.data);
            setCategories(catRes.data.data || catRes.data); // Adjust mapping safely
            setError(null);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("Access Denied: You do not have Kitchen Admin privileges.");
            } else {
                setError("Failed to fetch menu data.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category.id || item.category, // Handle nested or integer ID
            is_available: item.is_available
        });
        setSuccessMsg('');
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', category: '', is_available: true });
        setSuccessMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg('');
        
        try {
            if (editingId) {
                // Update
                await apiClient.put(`menu/items/${editingId}/`, formData);
                setSuccessMsg(`Successfully updated "${formData.name}".`);
            } else {
                // Create
                await apiClient.post('menu/items/create/', formData);
                setSuccessMsg(`Successfully created new dish: "${formData.name}".`);
            }
            handleCancel();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save menu item. Check your inputs.");
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete "${name}"?`)) return;
        
        try {
            await apiClient.delete(`menu/items/${id}/`);
            setSuccessMsg(`Dish "${name}" was removed from the menu.`);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Error deleting item. Make sure it isn't part of an active order.");
        }
    };

    if (loading && items.length === 0) return <AdminLayout><p>Loading Menu Manager...</p></AdminLayout>;

    if (error && items.length === 0) return (
        <AdminLayout>
            <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center', borderColor: '#fee2e2' }}>
                <h2 style={{color: '#ef4444', marginBottom: '1rem'}}>⛔ {error}</h2>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left Side: Dislpay List */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>Active Menu Items</h2>
                        <span style={{ color: 'var(--text-secondary)' }}>{items.length} Total</span>
                    </div>

                    {error && !loading && (
                        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}
                    
                    {successMsg && (
                        <div style={{ background: '#ecfdf5', color: '#047857', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #a7f3d0' }}>
                            ✔️ {successMsg}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.map(item => (
                            <div key={item.id} className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', opacity: item.is_available ? 1 : 0.6 }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.3rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {item.name} 
                                        {!item.is_available && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#ef4444', color: 'white', borderRadius: '4px' }}>Sold Out</span>}
                                    </h4>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {item.category?.name || 'Uncategorized'} | ₹{item.price}
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button onClick={() => handleEdit(item)} style={{ padding: '0.4rem 0.8rem', background: 'var(--surface-color)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(item.id, item.name)} style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Form Component */}
                <div className="card" style={{ position: 'sticky', top: '2rem', padding: '2rem', background: 'var(--surface-color)', border: '1px solid var(--primary-color)' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        {editingId ? 'Edit Dish' : 'Add New Dish'}
                    </h3>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Dish Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} placeholder="e.g. Truffle Fries" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }} placeholder="Ingredients and flavor profile..." />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Price (₹)</label>
                                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} />
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                                    <option value="" disabled>Select...</option>
                                    {Array.isArray(categories) && categories.map(cat => (
                                        <option key={cat.id || cat.name} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                            <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} style={{ transform: 'scale(1.2)' }} />
                            <span>Currently Available (In Stock)</span>
                        </label>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" style={{ flex: 1, padding: '1rem' }}>
                                {editingId ? 'Save Changes' : 'Create Dish'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancel} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-primary)' }}>
                                    Cancel
                                </button>
                            )}
                        </div>

                    </form>
                </div>

            </div>
        </AdminLayout>
    );
};

export default MenuManagement;
