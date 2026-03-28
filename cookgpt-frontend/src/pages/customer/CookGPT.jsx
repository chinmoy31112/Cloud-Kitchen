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
            setError("Please add at least one ingredient first!");
            return;
        }

        setLoading(true);
        setError(null);
        setRecipes(null);

        try {
            const res = await apiClient.post('ai/recommend/', { ingredients });
            // The API returns nested success:true, data: { recommended_recipes: [...] }
            setRecipes(res.data.data.recommended_recipes || []);
        } catch (err) {
            if (err.response?.status === 401) {
                setError("You must be logged in to chat with CookGPT.");
            } else {
                setError("CookGPT struggled to find recipes for those ingredients. Try common staples like 'tomato', 'flour', or 'chicken'.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseLayout>
            <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
                
                {/* Header / Intro */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖🍳</div>
                    <h1 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '2.5rem', letterSpacing: '-1px' }}>
                        Ask CookGPT
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Tell me what's lying in your fridge, and I'll calculate exactly what masterpiece you can cook right now.
                    </p>
                </div>

                {/* Input Area */}
                <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        What ingredients do you have?
                    </label>

                    {/* Ingredient Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {ingredients.map(ing => (
                            <span key={ing} style={{ background: 'var(--primary-color)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {ing}
                                <button onClick={() => removeIngredient(ing)} style={{ background: 'transparent', border: 'none', color: 'white', padding: 0, width: 'auto', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.8, boxShadow: 'none' }}>
                                    ✖
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
                            placeholder="Type an ingredient and press Enter (e.g. 'chicken')"
                            style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1rem' }}
                        />
                        <button onClick={generateRecipes} disabled={loading} style={{ padding: '0 2rem', borderRadius: '12px', fontSize: '1.1rem' }}>
                            {loading ? 'Thinking...' : 'Generate 🪄'}
                        </button>
                    </div>
                    {error && <p style={{ color: '#ef4444', marginTop: '1rem', marginBottom: 0 }}>{error}</p>}
                </div>

                {/* Loading State Animation */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div className="loader" style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>Crunching Heuristics...</p>
                        <style>{`@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
                    </div>
                )}

                {/* Output Area */}
                {recipes && !loading && (
                    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            Chef's Recommendations ({recipes.length} found)
                        </h3>

                        {recipes.length === 0 ? (
                            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🤷‍♂️</span>
                                <p>I couldn't find any recipes matching those exact ingredients in my memory. Try clearing the list and adding more broad staples.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {recipes.map((recipe, idx) => (
                                    <div key={idx} className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                                        {/* Recipe Header */}
                                        <div style={{ background: '#fff9f0', borderBottom: '1px solid #ffedd5', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>{recipe.name}</h3>
                                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{recipe.description}</p>
                                            </div>
                                            <div style={{ background: recipe.match_score > 70 ? '#10b981' : '#f59e0b', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                {recipe.match_score}% Match
                                            </div>
                                        </div>

                                        {/* Recipe Body */}
                                        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                                            
                                            {/* Attributes & Ingredients */}
                                            <div>
                                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    <span>⏱️ {recipe.preparation_time + recipe.cooking_time} mins</span>
                                                    <span>🔥 {recipe.difficulty}</span>
                                                    <span>🍽️ Serves {recipe.servings}</span>
                                                </div>

                                                <h4 style={{ marginBottom: '0.8rem', color: 'var(--text-primary)' }}>Required Ingredients:</h4>
                                                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.95rem' }}>
                                                    {recipe.ingredients.map(ing => (
                                                        <li key={ing} style={{ marginBottom: '0.3rem', color: ingredients.includes(ing) ? '#10b981' : 'var(--text-primary)' }}>
                                                            {ing} {ingredients.includes(ing) && '✅'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Instructions */}
                                            <div>
                                                <h4 style={{ marginBottom: '0.8rem', color: 'var(--text-primary)' }}>Cooking Steps:</h4>
                                                <ol style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
                                                    {recipe.instructions.map((step, i) => (
                                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{step}</li>
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
