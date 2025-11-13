import React, { useEffect, useState } from "react";
import PageTemplate from "./PageTemplate";

function ProfilePage() {
    const name = "profile";
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Dohvati podatke o korisniku
        fetch('/api/me', {
            credentials: 'include' // Važno za session cookie
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Niste logirani');
                }
                return response.json();
            })
            .then(data => {
                setUserData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        // Redirect na logout endpoint
        window.location.href = '/api/auth/logout';
    };

    const body = (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Profil</h1>

            {loading && <p>Učitavanje...</p>}

            {error && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    <strong>Greška:</strong> {error}
                    <br />
                    <a href="/api/auth/login" style={{ color: '#1976d2', marginTop: '10px', display: 'inline-block' }}>
                        Prijavite se
                    </a>
                </div>
            )}

            {userData && (
                <div>
                    <div style={{
                        backgroundColor: '#f5f5f5',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <h2>Informacije o korisniku</h2>
                        <p><strong>Username:</strong> {userData.username}</p>
                        <p><strong>OAuth ID:</strong> {userData.oauth_id}</p>
                        <p><strong>Uloga:</strong> {userData.uloga}</p>

                        {userData.email && (
                            <p><strong>Email:</strong> {userData.email}</p>
                        )}

                        {userData.naziv_tvrtke && (
                            <>
                                <p><strong>Naziv tvrtke:</strong> {userData.naziv_tvrtke}</p>
                                <p><strong>Adresa:</strong> {userData.adresa}</p>
                                <p><strong>Grad:</strong> {userData.grad}</p>
                                <p><strong>Telefon:</strong> {userData.telefon}</p>
                            </>
                        )}

                        {userData.profImgUrl && (
                            <div style={{ marginTop: '15px' }}>
                                <strong>Profilna slika:</strong><br />
                                <img
                                    src={userData.profImgUrl ? `/${userData.profImgUrl}` : '/images/default.png'}
                                    alt="Profile"
                                    style={{
                                        maxWidth: '200px',
                                        marginTop: '10px',
                                        borderRadius: '8px'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <p style={{ display: 'none', color: '#666', fontSize: '14px' }}>
                                    (Slika nije dostupna)
                                </p>
                            </div>
                        )}

                        {userData.logoImgUrl && (
                            <div style={{ marginTop: '15px' }}>
                                <strong>Logo tvrtke:</strong><br />
                                <img
                                    src={`/${userData.logoImgUrl}`}
                                    alt="Logo"
                                    style={{
                                        maxWidth: '200px',
                                        marginTop: '10px',
                                        borderRadius: '8px'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <p style={{ display: 'none', color: '#666', fontSize: '14px' }}>
                                    (Slika nije dostupna)
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#d32f2f'}
                    >
                        Odjavi se
                    </button>

                    <div style={{
                        marginTop: '30px',
                        padding: '15px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}>
                        <strong>Debug info:</strong>
                        <pre style={{
                            marginTop: '10px',
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '4px',
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(userData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );

    return <PageTemplate name={name} body={body} />;
}

export default ProfilePage;