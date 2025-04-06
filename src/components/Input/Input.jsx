import './Input.scss';
import axios from 'axios';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const HISTORY_STORAGE_KEY = 'llamaPromptHistory';
const BACKEND_API_URL = 'http://localhost:8080/api/ask-llama';

const RESPONSE_TYPES = {
    NEGATIVE: 'negative',
    POSITIVE: 'positive',
    PHILOSOPHICAL: 'philosophical',
    JOKE: 'joke'
};

function Input() {
    const [prompt, setPrompt] = useState('Example: It feels like the world is burning down around me.');
    const [response1, setResponse1] = useState('');
    const [response2, setResponse2] = useState('');
    const [response3, setResponse3] = useState('');
    const [response4, setResponse4] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [error1, setError1] = useState(null);
    const [error2, setError2] = useState(null);
    const [error3, setError3] = useState(null);
    const [error4, setError4] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [responseToggles, setResponseToggles] = useState({
        [RESPONSE_TYPES.NEGATIVE]: true,
        [RESPONSE_TYPES.POSITIVE]: true,
        [RESPONSE_TYPES.PHILOSOPHICAL]: true,
        [RESPONSE_TYPES.JOKE]: true,
    });
    const menuRef = useRef(null);
    const menuContainerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                if (!menuContainerRef.current || !menuContainerRef.current.contains(event.target)) {
                    setIsMenuOpen(false);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [menuRef, menuContainerRef]);

    const savePromptToHistory = useCallback((submittedPrompt, responseData, activeToggles) => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            let currentHistory = [];
            if (storedHistory) {
                try {
                    const parsed = JSON.parse(storedHistory);
                    if (Array.isArray(parsed)) { currentHistory = parsed; }
                    else { console.warn("Invalid history, resetting."); localStorage.removeItem(HISTORY_STORAGE_KEY); }
                } catch (parseError) { console.error("Failed to parse history, resetting.", parseError); localStorage.removeItem(HISTORY_STORAGE_KEY); }
            }
            const newEntry = {
                prompt: submittedPrompt, timestamp: Date.now(),
                responses: {
                    [RESPONSE_TYPES.NEGATIVE]: activeToggles[RESPONSE_TYPES.NEGATIVE] ? { answer: responseData.answer1 || null, error: responseData.error1 || null } : null,
                    [RESPONSE_TYPES.POSITIVE]: activeToggles[RESPONSE_TYPES.POSITIVE] ? { answer: responseData.answer2 || null, error: responseData.error2 || null } : null,
                    [RESPONSE_TYPES.PHILOSOPHICAL]: activeToggles[RESPONSE_TYPES.PHILOSOPHICAL] ? { answer: responseData.answer3 || null, error: responseData.error3 || null } : null,
                    [RESPONSE_TYPES.JOKE]: activeToggles[RESPONSE_TYPES.JOKE] ? { answer: responseData.answer4 || null, error: responseData.error4 || null } : null
                }
            };
            const updatedHistory = [...currentHistory, newEntry];
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (storageError) { console.error("Failed to save prompt:", storageError); }
    }, []);

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        const isAnyResponseEnabled = Object.values(responseToggles).some(v => v);
        if (!isAnyResponseEnabled) { setError("Please enable at least one response type."); setHasSubmitted(true); return; }
        setIsLoading(true); setHasSubmitted(true); setError(null);
        setError1(null); setError2(null); setError3(null); setError4(null);
        setResponse1(''); setResponse2(''); setResponse3(''); setResponse4('');
        const submittedPrompt = prompt;
        const currentToggles = { ...responseToggles };
        try {
            const res = await axios.post(BACKEND_API_URL, { prompt: submittedPrompt });
            const { answer1, error1, answer2, error2, answer3, error3, answer4, error4 } = res.data;
            if (currentToggles[RESPONSE_TYPES.NEGATIVE]) { setResponse1(answer1 || ''); setError1(error1); }
            if (currentToggles[RESPONSE_TYPES.POSITIVE]) { setResponse2(answer2 || ''); setError2(error2); }
            if (currentToggles[RESPONSE_TYPES.PHILOSOPHICAL]) { setResponse3(answer3 || ''); setError3(error3); }
            if (currentToggles[RESPONSE_TYPES.JOKE]) { setResponse4(answer4 || ''); setError4(error4); }
            const enabledErrors = [currentToggles[RESPONSE_TYPES.NEGATIVE] && error1, currentToggles[RESPONSE_TYPES.POSITIVE] && error2, currentToggles[RESPONSE_TYPES.PHILOSOPHICAL] && error3, currentToggles[RESPONSE_TYPES.JOKE] && error4].filter(Boolean);
            const totalEnabled = Object.values(currentToggles).filter(Boolean).length;
            if (enabledErrors.length === totalEnabled && totalEnabled > 0) { setError("All enabled AI requests failed."); }
            else if (enabledErrors.length > 0) { setError(`One or more enabled AI requests failed (${enabledErrors.length} total).`); }
            savePromptToHistory(submittedPrompt, { answer1, error1, answer2, error2, answer3, error3, answer4, error4 }, currentToggles);
        } catch (err) {
            console.error("Error fetching from backend:", err);
            let errorMessage = 'Failed to fetch response.';
            if (err.response?.data?.error) { errorMessage = err.response.data.error; }
            else if (err.message) { errorMessage = err.message; }
            setError(errorMessage);
        } finally { setIsLoading(false); }
    }, [prompt, responseToggles, savePromptToHistory]);

    const handleToggleClick = (type) => {
        setResponseToggles(prevToggles => ({ ...prevToggles, [type]: !prevToggles[type] }));
    };

    const isVentDisabled = isLoading || !prompt.trim() || Object.values(responseToggles).every(v => !v);

    return (
        <div className="llama-asker">
            <form onSubmit={handleSubmit} className="llama-asker__form">
                <label htmlFor="prompt-input-secure-multi" className="llama-asker__label">Let off some steam:</label>
                <div className="llama-asker__input-area">
                    <textarea id="prompt-input-secure-multi" className="llama-asker__textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} disabled={isLoading} />
                </div>
                <div className='llama-asker__button-div'>
                    <button type="submit" className="llama-asker__button" disabled={isVentDisabled} title={Object.values(responseToggles).every(v => !v) ? "Enable at least one response type" : ""}>
                        {isLoading ? 'Letting off steam...' : 'Vent'}
                    </button>
                    <div className="llama-asker__menu-container" ref={menuContainerRef}>
                        <button type="button" id="response-menu-button" className="llama-asker__menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-haspopup="true" aria-expanded={isMenuOpen} title="Response Options" disabled={isLoading}>
                            ⚙️
                        </button>
                        {isMenuOpen && (
                            <div className="llama-asker__response-menu" role="menu" ref={menuRef}>
                                <p className="llama-asker__menu-title">Include responses:</p>
                                {Object.entries(RESPONSE_TYPES).map(([key, type]) => (
                                    <button
                                        type="button"
                                        key={type}
                                        role="menuitemcheckbox"
                                        aria-checked={responseToggles[type]}
                                        onClick={() => handleToggleClick(type)}
                                        className={`llama-asker__menu-toggle llama-asker__menu-toggle--slider llama-asker__menu-toggle--${type}`}
                                    >
                                        <span className="llama-asker__slider-visual"></span>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {(isLoading || hasSubmitted) && (
                <div className="llama-asker__results-area">
                    {isLoading && <p className="llama-asker__loading">Venting...</p>}
                    {!isLoading && error && <p className="llama-asker__error-message llama-asker__error-message--general">{error}</p>}
                    {!isLoading && hasSubmitted && (
                        <>
                            <div className="llama-asker__response-containers">
                                {responseToggles[RESPONSE_TYPES.NEGATIVE] && (
                                    <div className="llama-asker__response-container llama-asker__response-container--negative">
                                        <h3 className="llama-asker__response-heading">Negative:</h3>
                                        {error1 && <p className="llama-asker__error-message llama-asker__error-message--response">{error1}</p>}
                                        {response1 && <pre>{response1}</pre>}
                                        {!response1 && !error1 && !error && <p className="llama-asker__no-response">...</p>}
                                    </div>
                                )}
                                {responseToggles[RESPONSE_TYPES.POSITIVE] && (
                                    <div className="llama-asker__response-container llama-asker__response-container--positive">
                                        <h3 className="llama-asker__response-heading">Positive:</h3>
                                        {error2 && <p className="llama-asker__error-message llama-asker__error-message--response">{error2}</p>}
                                        {response2 && <pre>{response2}</pre>}
                                        {!response2 && !error2 && !error && <p className="llama-asker__no-response">...</p>}
                                    </div>
                                )}
                            </div>
                            <div className="llama-asker__response-containers">
                                {responseToggles[RESPONSE_TYPES.PHILOSOPHICAL] && (
                                    <div className="llama-asker__response-container llama-asker__response-container--philosophical">
                                        <h3 className="llama-asker__response-heading">Philosophical:</h3>
                                        {error3 && <p className="llama-asker__error-message llama-asker__error-message--response">{error3}</p>}
                                        {response3 && <pre>{response3}</pre>}
                                        {!response3 && !error3 && !error && <p className="llama-asker__no-response">...</p>}
                                    </div>
                                )}
                                {responseToggles[RESPONSE_TYPES.JOKE] && (
                                    <div className="llama-asker__response-container llama-asker__response-container--joke">
                                        <h3 className="llama-asker__response-heading">Joke:</h3>
                                        {error4 && <p className="llama-asker__error-message llama-asker__error-message--response">{error4}</p>}
                                        {response4 && <pre>{response4}</pre>}
                                        {!response4 && !error4 && !error && <p className="llama-asker__no-response">...</p>}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="llama-asker__history-link-container">
                <Link to="/history">
                    <button className="llama-asker__history-button">View History</button>
                </Link>
            </div>
        </div>
    );
}

export default Input;