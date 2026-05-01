import React, { useState } from 'react';
import BaseLayout from '../../components/layouts/BaseLayout';
import apiClient from '../../api/apiClient';

const CookGPT = () => {
    const [ingredients, setIngredients] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [recipes, setRecipes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAddIngredient = (e) => {
        if (e.key === 'Enter' && currentInput.trim()) {
            e.preventDefault();
            if (!ingredients.includes(currentInput.trim().toLowerCase())) {
                setIngredients([...ingredients, currentInput.trim().toLowerCase()]);
            }
            setCurrentInput('');
        }
    };

    const removeIngredient = (ingToRemove) => {
        setIngredients(ingredients.filter(ing => ing !== ingToRemove));
    };

    const generateRecipes = async () => {
        if (ingredients.length === 0) {
            setError("Please curate at least one ingredient first.");
            return;
        }

        setLoading(true);
        setError(null);
        setRecipes(null);

        try {
            const res = await apiClient.post('ai/recommend/', { ingredients });
            setRecipes(res.data.data.recommended_recipes || []);
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Exclusive access required. Please sign in.");
            } else {
                setError("Our culinary AI could not match these specific ingredients. Consider adding more foundational items.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseLayout>
            <div style={{ maxWidth: '800px', margin: '3rem auto' }}>
                
                {/* Header / Intro */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ 
                        fontFamily: "'Playfair Display', serif", 
                        fontSize: '3.5rem', 
                        color: 'var(--primary-color)',
                        fontStyle: 'italic',
                        marginBottom: '1rem'
                    }}>
                        Bespoke AI
                    </div>
                    <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '1.1rem', 
                        maxWidth: '600px', 
                        margin: '0 auto',
                        fontWeight: '300',
                        lineHeight: '1.8'
                    }}>
                        Present your available ingredients, and our intelligent system will curate a masterpiece tailored to your pantry.
                    </p>
                </div>

                {/* Input Area */}
                <div className="card glass-panel" style={{ padding: '3rem', marginBottom: '3rem', borderRadius: '24px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '1.5rem', 
                        fontWeight: '500', 
                        fontSize: '1.2rem',
                        fontFamily: "'Playfair Display', serif",
                        color: 'var(--text-primary)'
                    }}>
                        Your Ingredients
                    </label>

                    {/* Ingredient Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '2rem' }}>
                        {ingredients.map(ing => (
                            <span key={ing} style={{ 
                                background: 'rgba(184, 144, 91, 0.1)', 
                                color: 'var(--primary-hover)', 
                                border: '1px solid rgba(184, 144, 91, 0.3)',
                                padding: '0.5rem 1.2rem', 
                                borderRadius: '30px', 
                                fontSize: '0.9rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.8rem',
                                letterSpacing: '0.5px'
                            }}>
                                {ing}
                                <button onClick={() => removeIngredient(ing)} style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: 'var(--primary-color)', 
                                    padding: 0, 
                                    width: 'auto', 
                                    height: 'auto', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    cursor: 'pointer',
                                    boxShadow: 'none'
                                }}>
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Chat Input Bar */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input 
                            type="text" 
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={handleAddIngredient}
                            placeholder="Type an ingredient and press Enter (e.g. 'truffle')"
                            style={{ 
                                flex: 1, 
                                padding: '1.2rem 1.5rem', 
                                borderRadius: '30px', 
                                border: '1px solid var(--border-color)', 
                                background: 'rgba(255, 255, 255, 0.5)', 
                                color: 'var(--text-primary)', 
                                fontSize: '1rem' 
                            }}
                        />
                        <button onClick={generateRecipes} disabled={loading} style={{ 
                            padding: '0 2.5rem', 
                            borderRadius: '30px', 
                            fontSize: '0.95rem',
                            letterSpacing: '1px'
                        }}>
                            {loading ? 'Curating...' : 'Generate Menu'}
                        </button>
                    </div>
                    {error && <p style={{ color: '#b91c1c', marginTop: '1.5rem', marginBottom: 0, fontSize: '0.9rem' }}>{error}</p>}
                </div>

                {/* Loading State Animation */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div className="loader" style={{ display: 'inline-block', width: '40px', height: '40px', borderRadius: '50%', animation: 'spin 1.5s linear infinite' }}></div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', animation: 'pulse 2s infinite' }}>Consulting the Chef's Library...</p>
                        <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
                    </div>
                )}

                {/* Output Area */}
                {recipes && !loading && (
                    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
                        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                        <h3 style={{ 
                            marginBottom: '2rem', 
                            borderBottom: '1px solid var(--border-color)', 
                            paddingBottom: '1rem',
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.8rem',
                            color: 'var(--text-primary)'
                        }}>
                            Curated Recommendations
                        </h3>

                        {recipes.length === 0 ? (
                            <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <p style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>No immediate matches found for this specific pairing. Please refine your ingredients.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                {recipes.map((recipe, idx) => (
                                    <div key={idx} className="card glass-panel" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px' }}>
                                        {/* Recipe Header */}
                                        <div style={{ 
                                            background: 'linear-gradient(to right, #faf9f6, #ffffff)', 
                                            borderBottom: '1px solid var(--border-color)', 
                                            padding: '2rem', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'flex-start' 
                                        }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-primary)', fontSize: '1.6rem' }}>{recipe.name}</h3>
                                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '300' }}>{recipe.description}</p>
                                            </div>
                                            <div style={{ 
                                                border: `1px solid ${recipe.match_score > 70 ? 'var(--primary-color)' : '#94a3b8'}`, 
                                                color: recipe.match_score > 70 ? 'var(--primary-hover)' : 'var(--text-secondary)', 
                                                padding: '0.4rem 1.2rem', 
                                                borderRadius: '30px', 
                                                fontWeight: '500', 
                                                fontSize: '0.85rem',
                                                letterSpacing: '1px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {recipe.match_score}% Match
                                            </div>
                                        </div>

                                        {/* Recipe Body */}
                                        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                                            
                                            {/* Attributes & Ingredients */}
                                            <div>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    gap: '0.5rem', 
                                                    marginBottom: '2rem', 
                                                    fontSize: '0.85rem', 
                                                    color: 'var(--text-secondary)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px'
                                                }}>
                                                    <span>Time: {recipe.preparation_time + recipe.cooking_time} mins</span>
                                                    <span>Level: {recipe.difficulty}</span>
                                                    <span>Yield: {recipe.servings} servings</span>
                                                </div>

                                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Ingredients</h4>
                                                <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0, fontSize: '0.95rem' }}>
                                                    {recipe.ingredients.map(ing => (
                                                        <li key={ing} style={{ 
                                                            marginBottom: '0.6rem', 
                                                            color: ingredients.includes(ing) ? 'var(--primary-color)' : 'var(--text-secondary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <span style={{ fontSize: '0.6rem', color: 'var(--border-color)' }}>◆</span>
                                                            {ing}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Instructions */}
                                            <div>
                                                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Method</h4>
                                                <ol style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                                                    {recipe.instructions.map((step, i) => (
                                                        <li key={i} style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>{step}</li>
                                                    ))}
                                                </ol>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </BaseLayout>
    );
};

export default CookGPT;
