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

    if (!user) return <BaseLayout fullScreen={true}><div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}><p>Please log in.</p></div></BaseLayout>;

    return (
        <BaseLayout fullScreen={true}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 2rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', gap: '2.5rem', display: 'flex', flexDirection: 'column', paddingBottom: '4rem' }}>
                    
                    <div className="card glass-panel" style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '2rem' }}>My Profile</h2>
                            <button onClick={logoutUser} className="btn glass-panel" style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.6rem 1.5rem', textTransform: 'none', boxShadow: 'none' }}>Logout</button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', color: 'var(--text-secondary)' }}>
                            <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Full Name</span>
                                <strong style={{color: 'var(--text-primary)', fontSize: '1.1rem'}}>{user.first_name} {user.last_name}</strong>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Username</span>
                                <strong style={{color: 'var(--text-primary)', fontSize: '1.1rem'}}>@{user.username}</strong>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Email Address</span>
                                <strong style={{color: 'var(--text-primary)', fontSize: '1.1rem'}}>{user.email}</strong>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Phone Number</span>
                                <strong style={{color: 'var(--text-primary)', fontSize: '1.1rem'}}>{user.phone}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="card glass-panel" style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-md)' }}>
                        <h3 style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', fontSize: '1.5rem' }}>My Delivery Addresses</h3>
                        
                        {loading ? <p>Loading addresses...</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
                                {addresses.length === 0 ? <p style={{color: 'var(--text-secondary)'}}>No addresses saved yet.</p> : 
                                    addresses.map(addr => (
                                        <div key={addr.id} style={{ border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', background: 'white', position: 'relative', transition: 'all 0.3s ease' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                                <b style={{color: 'var(--primary-color)', fontSize: '1.1rem'}}>{addr.label}</b> 
                                                {addr.is_default && <span style={{fontSize: '0.65rem', background: '#10b981', color: 'white', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase'}}>Default</span>}
                                            </div>
                                            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                                {addr.street}<br/>
                                                {addr.city}, {addr.state} {addr.pincode}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )}

                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Register New Address</h4>
                        <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                            <input type="text" placeholder="Label (Home, Work, etc)" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} required style={{ padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'white' }} />
                            <input type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} required style={{ padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'white' }} />
                            <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required style={{ padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'white' }} />
                            <input type="text" placeholder="State/Province" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} required style={{ padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'white' }} />
                            <input type="text" placeholder="Zip/Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} required style={{ padding: '0.8rem 1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'white' }} />
                            <button type="submit" style={{ gridColumn: 'span 2', padding: '1rem', fontSize: '1rem' }}>Save Address Profile</button>
                        </form>
                    </div>

                </div>
            </div>
        </BaseLayout>
    );
};

export default Profile;
