import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'My Trip';
    const destinations = searchParams.get('destinations') || 'Somewhere Amazing';
    const days = searchParams.get('days') || '5';
    const vibe = searchParams.get('vibe') || 'Adventure'; 

    

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: 'linear-gradient(to bottom right, #4338ca, #be185d)',
                    color: 'white',
                    fontFamily: '"Inter"',
                }}
            >
                <div style={
                    {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        padding: '40px 60px',
                        borderRadius: '30px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    }
                }>
                    <div style={{ fontSize: 80, marginBottom: 20 }}>✈️</div>
                    < div style={{ fontSize: 60, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
                        {title}
                    </div>
                    < div style={{ fontSize: 30, opacity: 0.8, marginBottom: 30 }}>
                        {destinations} • {days} Days
                    </div>

                    < div style={{ display: 'flex', gap: '15px' }}>
                        {
                            vibe.split(' ').map((emoji, i) => (
                                <div key={i} style={{
                                    fontSize: 40,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    width: 70,
                                    height: 70,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }} >
                                    {emoji}
                                </div>
                            ))}
                    </div>

                    < div style={{ marginTop: 40, fontSize: 20, opacity: 0.6 }}>
                        Planned with AI Travel Assistant
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            
            
            
            
            
            
            
        }
    );
}
