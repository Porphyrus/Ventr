import './Input.scss';
import axios from 'axios';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const HISTORY_STORAGE_KEY = 'llamaPromptHistory';
const BACKEND_API_URL = 'http://localhost:8080/api/ask-llama';

function SecureLlamaAskerMulti() {
    const [prompt, setPrompt] = useState('It feels like the world is burning down around me.');
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

    const savePromptToHistory = useCallback((submittedPrompt, responseData) => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            let currentHistory = [];
            if (storedHistory) {
                try {
                    const parsed = JSON.parse(storedHistory);
                    if (Array.isArray(parsed)) {
                        currentHistory = parsed;
                    } else {
                        console.warn("Invalid history found in localStorage, resetting.");
                        localStorage.removeItem(HISTORY_STORAGE_KEY);
                    }
                } catch (parseError) {
                    console.error("Failed to parse history from localStorage, resetting.", parseError);
                    localStorage.removeItem(HISTORY_STORAGE_KEY);
                }
            }

            const newEntry = {
                prompt: submittedPrompt,
                timestamp: Date.now(),
                responses: { // Store responses in a nested object
                    negative: { answer: responseData.answer1 || null, error: responseData.error1 || null },
                    positive: { answer: responseData.answer2 || null, error: responseData.error2 || null },
                    philosophical: { answer: responseData.answer3 || null, error: responseData.error3 || null },
                    joke: { answer: responseData.answer4 || null, error: responseData.error4 || null }
                }
            };

            const updatedHistory = [...currentHistory, newEntry];
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

        } catch (storageError) {
            console.error("Failed to save prompt to localStorage:", storageError);
        }
    }, []);

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setError1(null);
        setError2(null);
        setError3(null);
        setError4(null);
        setResponse1('');
        setResponse2('');
        setResponse3('');
        setResponse4('');

        const submittedPrompt = prompt;

        try {
            const res = await axios.post(BACKEND_API_URL, {
                prompt: submittedPrompt
            });

            const { answer1, error1, answer2, error2, answer3, error3, answer4, error4 } = res.data;

            setResponse1(answer1 || '');
            setError1(error1);
            setResponse2(answer2 || '');
            setError2(error2);
            setResponse3(answer3 || '');
            setError3(error3);
            setResponse4(answer4 || '');
            setError4(error4);

            const errorsExist = [error1, error2, error3, error4].filter(Boolean);
            if (errorsExist.length === 4) {
                setError("All AI requests failed. See details below.");
            } else if (errorsExist.length > 0) {
                setError(`One or more AI requests failed (${errorsExist.length} total). See details below.`);
            }

            // *** MODIFIED: Pass response data to save function ***
            savePromptToHistory(submittedPrompt, { answer1, error1, answer2, error2, answer3, error3, answer4, error4 });

        } catch (err) {
            console.error("Error fetching from backend:", err);
            let errorMessage = 'Failed to fetch response from the server.';
            if (err.response && err.response.data && err.response.data.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, savePromptToHistory]); // Keep dependencies

    return (
        <div className="llama-asker">
            <form onSubmit={handleSubmit} className="llama-asker__form">
                <label htmlFor="prompt-input-secure-multi" className="llama-asker__label">Let off some steam:</label>
                <div className="llama-asker__textarea-div">
                    <textarea
                        id="prompt-input-secure-multi"
                        className="llama-asker__textarea"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        cols={50}
                        disabled={isLoading}
                    />
                </div>
                <div className='llama-asker__button-div'>
                    <button type="submit" className="llama-asker__button" disabled={isLoading || !prompt.trim()} >
                        {isLoading ? 'Letting off steam...' : 'Vent'}
                    </button>
                </div>
            </form>

            {isLoading && <p className="llama-asker__loading">Venting...</p>}

            {error && <p className="llama-asker__error-message llama-asker__error-message--general">{error}</p>}

            <div className="llama-asker__response-containers">

                <div className="llama-asker__response-container">
                    <h3 className="llama-asker__response-heading">Negative:</h3>
                    {error1 && <p className="llama-asker__error-message llama-asker__error-message--response">{error1}</p>}
                    {response1 && (
                        <pre className="llama-asker__response-text1">
                            {response1}
                        </pre>
                    )}
                    {!isLoading && !response1 && !error1 && !error && <p className="llama-asker__no-response">...</p>}
                </div>

                <div className="llama-asker__response-container">
                    <h3 className="llama-asker__response-heading">Positive:</h3>
                    {error2 && <p className="llama-asker__error-message llama-asker__error-message--response">{error2}</p>}
                    {response2 && (
                        <pre className="llama-asker__response-text2">
                            {response2}
                        </pre>
                    )}
                    {!isLoading && !response2 && !error2 && !error && <p className="llama-asker__no-response">...</p>}
                </div>
            </div>
            <div className="llama-asker__response-containers">

                <div className="llama-asker__response-container">
                    <h3 className="llama-asker__response-heading">Philosophical:</h3>
                    {error3 && <p className="llama-asker__error-message llama-asker__error-message--response">{error3}</p>}
                    {response3 && (
                        <pre className="llama-asker__response-text3">
                            {response3}
                        </pre>
                    )}
                    {!isLoading && !response3 && !error3 && !error && <p className="llama-asker__no-response">...</p>}
                </div>

                <div className="llama-asker__response-container">
                    <h3 className="llama-asker__response-heading">Joke:</h3>
                    {error4 && <p className="llama-asker__error-message llama-asker__error-message--response">{error4}</p>}
                    {response4 && (
                        <pre className="llama-asker__response-text4">
                            {response4}
                        </pre>
                    )}
                    {!isLoading && !response4 && !error4 && !error && <p className="llama-asker__no-response">...</p>}
                </div>
            </div>

            <div className="llama-asker__history-link-container">
                <Link to="/history">
                    <button className="llama-asker__history-button">
                        View Venting History
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default SecureLlamaAskerMulti;