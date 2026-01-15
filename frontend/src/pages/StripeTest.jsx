import React, { useEffect } from 'react'; // useEffect potreban
import { useSearchParams } from 'react-router';

export default function StripeTest() {
    const [searchParams] = useSearchParams();
    const isSuccess = searchParams.get('success');
    const isCanceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    // Poziv backendu
    // Ovo ispod se događa nakon uspješne uplate - to koristim za ažuriranje baze
    useEffect(() => {
        if (isSuccess && sessionId) {
            fetch('/api/confirm-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            })
            .then(res => {
                if (!res.ok) throw new Error("Problem s potvrdom uplate");
                return res.json();
            })
            .then(data => {
                console.log("Baza uspješno ažurirana:", data);
            })
            .catch(err => {
                console.error("Greška pri ažuriranju:", err);
            });
        }
    }, [isSuccess, sessionId]);

    //AI generirano sve ispod - ovo je samo da radi uplata preko Stripea
    const handlePayment = async (tip) => {
        try {
            const response = await fetch('/api/test-stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tip: tip })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error("Greška:", err);
            alert("Neuspješno povezivanje s backendom.");
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            <h1>Stripe Testna Stranica</h1>

            {isSuccess && (
                <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#155724', margin: 0 }}>Uplata je uspjela! 🎉</h2>
                </div>
            )}

            {isCanceled && (
                <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#721c24', margin: 0 }}>Plaćanje otkazano. ❌</h2>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', background: 'white' }}>
                    <h3>Mjesečna</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>15.00 €</p>
                    <button onClick={() => handlePayment('mjesečna')} style={{ cursor: 'pointer', padding: '10px 20px' }}>
                        Odaberi Mjesečnu
                    </button>
                </div>

                <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', background: 'white' }}>
                    <h3>Godišnja</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>120.00 €</p>
                    <button onClick={() => handlePayment('godišnja')} style={{ cursor: 'pointer', padding: '10px 20px' }}>
                        Odaberi Godišnju
                    </button>
                </div>
            </div>
        </div>
    );
}