import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import BaseLayout from '../../components/layouts/BaseLayout';
import apiClient from '../../api/apiClient';

const Profile = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        pincode: ''
    });

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await apiClient.get('users/addresses/');
                setAddresses(res.data.data);
            } catch (err) {
                console.error("Failed to fetch addresses");
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
    }, []);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await apiClient.post('users/addresses/', newAddress);
            setAddresses([...addresses, res.data.data]);
            setNewAddress({ label: 'Home', street: '', city: '', state: '', pincode: '' }); // reset
        } catch (err) {
            console.error("Add address error", err);
        }
    };

    if (!user) return <BaseLayout><p style={{textAlign: 'center', marginTop: '3rem'}}>Please log in.</p></BaseLayout>;

    return (
        <BaseLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto', gap: '2rem', display: 'flex', flexDirection: 'column' }}>
                
                <div className="card glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ color: 'var(--primary-color)' }}>My Profile</h2>
                        <button onClick={logoutUser} style={{ background: '#ef4444', padding: '0.4rem 1rem' }}>Logout</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: 'var(--text-secondary)' }}>
                        <div><strong style={{color: 'var(--text-primary)'}}>Name:</strong> {user.first_name} {user.last_name}</div>
                        <div><strong style={{color: 'var(--text-primary)'}}>Username:</strong> @{user.username}</div>
                        <div><strong style={{color: 'var(--text-primary)'}}>Email:</strong> {user.email}</div>
                        <div><strong style={{color: 'var(--text-primary)'}}>Phone:</strong> {user.phone}</div>
                        <div><strong style={{color: 'var(--text-primary)'}}>Role:</strong> <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', background: 'var(--primary-color)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>{user.role}</span></div>
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>My Addresses</h3>
                    
                    {loading ? <p>Loading addresses...</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {addresses.length === 0 ? <p style={{color: 'var(--text-secondary)'}}>No addresses saved yet.</p> : 
                                addresses.map(addr => (
                                    <div key={addr.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', background: 'var(--bg-color)' }}>
                                        <b style={{color: 'var(--primary-color)'}}>{addr.label}</b> {addr.is_default && <span style={{fontSize: '0.75rem', background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px'}}>Default</span>}
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {addr.street}<br/>
                                            {addr.city}, {addr.state} {addr.pincode}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    <h4 style={{ marginBottom: '1rem' }}>Add New Address</h4>
                    <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input type="text" placeholder="Label (Home, Work, etc)" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} required style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                        <input type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} required style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                        <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                        <input type="text" placeholder="State/Province" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} required style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                        <input type="text" placeholder="Zip/Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} required style={{ padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                        <button type="submit" style={{ gridColumn: 'span 2', padding: '0.7rem' }}>Save Address</button>
                    </form>
                </div>

            </div>
        </BaseLayout>
    );
};

export default Profile;
