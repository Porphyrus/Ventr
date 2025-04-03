import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './History.scss';

const HISTORY_STORAGE_KEY = 'llamaPromptHistory';

const renderResponse = (responseType, responseData, baseClassName) => {
    if (!responseData) return null;

    const { answer, error } = responseData;

    return (
        <div className={`${baseClassName}__response ${baseClassName}__response--${responseType}`}>
            <h4 className={`${baseClassName}__response-heading`}>{responseType.charAt(0).toUpperCase() + responseType.slice(1)}:</h4>
            {error && <p className={`${baseClassName}__response-error`}>Error: {error}</p>}
            {answer && <pre className={`${baseClassName}__response-answer`}>{answer}</pre>}
            {!answer && !error && <p className={`${baseClassName}__response-no-data`}>N/A</p>}
        </div>
    );
};


function PromptHistory() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
            try {
                const parsedHistory = JSON.parse(storedHistory);
                if (Array.isArray(parsedHistory)) {
                    setHistory(parsedHistory);
                } else {
                    console.error("Stored history is not an array:", parsedHistory);
                    localStorage.removeItem(HISTORY_STORAGE_KEY);
                }
            } catch (error) {
                console.error("Failed to parse history from localStorage:", error);
                localStorage.removeItem(HISTORY_STORAGE_KEY);
            }
        }
    }, []);

    const handleClearHistory = () => {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        setHistory([]);
    };

    return (
        <div className="history-page">
            <h2 className="history-page__title">History</h2>
            <Link to="/" className="history-page__back-link">
                ← Back to Venting
            </Link>

            {history.length > 0 ? (
                <>
                    <ul className="history-page__list">
                        {history.slice().reverse().map((item, index) => (
                            <li key={`${item.timestamp}-${index}`} className="history-page__list-item"> {/* Improved key */}
                                <div className="history-page__prompt-area">
                                    <p className="history-page__prompt-text">
                                        <strong>Vent:</strong> {item.prompt}
                                    </p>
                                    <span className="history-page__timestamp">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </span>
                                </div>

                                {item.responses && ( // Check if responses object exists
                                    <div className="history-page__responses-section">
                                        {renderResponse('negative', item.responses.negative, 'history-page')}
                                        {renderResponse('positive', item.responses.positive, 'history-page')}
                                        {renderResponse('philosophical', item.responses.philosophical, 'history-page')}
                                        {renderResponse('joke', item.responses.joke, 'history-page')}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="history-page__clear-button-div">
                        <button
                            onClick={handleClearHistory}
                            className="history-page__clear-button"
                        >
                            Clear History
                        </button>
                    </div>
                </>
            ) : (
                <p className="history-page__no-history">
                    No venting history saved yet. Go back and vent!
                </p>
            )}
        </div>
    );
}

export default PromptHistory;