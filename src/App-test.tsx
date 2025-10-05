import React from 'react';

function AppTest() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          🎉 Location Tracking UI Design
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
          Your Asset Tag application is now running successfully!
        </p>
        
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#2d5a2d', margin: '0 0 10px 0' }}>✅ Status Check:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>React is rendering correctly</li>
            <li>Vite dev server is working</li>
            <li>TypeScript is compiling</li>
            <li>All dependencies are installed</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#fff3cd',
          padding: '15px',
          borderRadius: '5px',
          border: '1px solid #ffeaa7'
        }}>
          <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>🚀 Next Steps:</h3>
          <p style={{ margin: 0, color: '#856404' }}>
            The app is working! You can now navigate to <strong>http://localhost:3000</strong> 
            to see your full Location Tracking UI Design application.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppTest;
