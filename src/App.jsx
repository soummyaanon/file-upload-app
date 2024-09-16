import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import { useAuth } from './ hooks/useAuth';

function App() {
  const { user, signIn, signOutUser } = useAuth();
  const [refreshFileList, setRefreshFileList] = useState(false);
  const [signingIn, setSigningIn] = useState(false); // State to track sign-in process

  const handleFileUploaded = () => {
    setRefreshFileList(prev => !prev);
  };

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signIn();
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
    setSigningIn(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>File Upload App</h1>
      {user ? (
        <>
          <button
            onClick={signOutUser}
            style={{ padding: '8px 16px', backgroundColor: '#3f51b5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '16px' }}
          >
            Sign Out
          </button>
          <FileUpload onFileUploaded={handleFileUploaded} />
          <FileList key={refreshFileList} />
        </>
      ) : (
        <button
          onClick={handleSignIn}
          style={{ padding: '8px 16px', backgroundColor: '#3f51b5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          disabled={signingIn} // Disable button during sign-in process
        >
          {signingIn ? 'Signing In...' : 'Sign In with Google'}
        </button>
      )}
    </div>
  );
}

export default App;