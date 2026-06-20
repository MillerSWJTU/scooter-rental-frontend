import React, { useState, useEffect } from 'react';
import API from '../services/api';

const TestConnection = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const testConnection = async () => {
            try {
                const response = await API.get('/test/connection');
                setMessage(response);
            } catch (err) {
                setError('Connection failed: ' + err.message);
            }
        };

        testConnection();
    }, []);

    return (
        <div className="mt-4">
            <h3>Connection Test</h3>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    );
};

export default TestConnection; 