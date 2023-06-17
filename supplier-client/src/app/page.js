'use client';

import styles from './page.module.css'
import { useState } from 'react';

export default function Home() {
  const [partName, setPartName] = useState('');
  const [response, setResponse] = useState(Object);
  const callAPI = async (partName) => {
    const result = await fetch(`http://localhost:3000/part/${partName}`, {
      method: 'GET'
    });
    const data = await result.json();
    setResponse({...data});
  };

  return (
      <div className={styles.container}>
        <h1>Get Part Number Data</h1>
          <main className={styles.main}>
              <input onChange={e => setPartName(e.target.value)} placeholder='Part Number'></input>
              <button disabled={partName == ''} onClick={() => callAPI(partName)}>Get Part Info</button>
              <div>{response != null ? JSON.stringify(response, null, 2) : ""}</div>
          </main>
      </div>
  );
}