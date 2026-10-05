import { useEffect, useRef, useState } from 'react';

function isValidDuration(seconds) {
  return Number.isInteger(seconds) && seconds >= 1 && seconds <= 3600;
}

export default function Timer() {
  const [duration, setDuration] = useState('60');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [status, setStatus] = useState('idle');

  const intervalRef = useRef(null);
  const deadlineRef = useRef(0);
  const remainingMsRef = useRef(60000);

  const durationSeconds = Number(duration);
  const validDuration = isValidDuration(durationSeconds);

  useEffect(() => {
    if (status !== 'running') return;

    const intervalId = setInterval(() => {
      const remainingMs = Math.max(
        0,
        deadlineRef.current - Date.now()
      );

      remainingMsRef.current = remainingMs;
      setSecondsLeft(Math.ceil(remainingMs / 1000));

      if (remainingMs === 0) {
        clearInterval(intervalId);
        setStatus('finished');
      }
    }, 250);

    intervalRef.current = intervalId;

    return () => clearInterval(intervalId);
  }, [status]);

  function startTimer() {
    if (!validDuration || status === 'running') return;

    if (status !== 'paused') {
      remainingMsRef.current = durationSeconds * 1000;
    }

    deadlineRef.current = Date.now() + remainingMsRef.current;
    setSecondsLeft(Math.ceil(remainingMsRef.current / 1000));
    setStatus('running');
  }

  function pauseTimer() {
    clearInterval(intervalRef.current);

    const remainingMs = Math.max(
      0,
      deadlineRef.current - Date.now()
    );

    remainingMsRef.current = remainingMs;
    setSecondsLeft(Math.ceil(remainingMs / 1000));
    setStatus(remainingMs === 0 ? 'finished' : 'paused');
  }

  function resetTimer(seconds = durationSeconds) {
    clearInterval(intervalRef.current);

    const nextSeconds = isValidDuration(seconds) ? seconds : 0;

    remainingMsRef.current = nextSeconds * 1000;
    setSecondsLeft(nextSeconds);
    setStatus('idle');
  }

  function changeDuration(event) {
    const value = event.target.value;
    setDuration(value);
    resetTimer(Number(value));
  }

  const minutes = String(
    Math.floor(secondsLeft / 60)
  ).padStart(2, '0');

  const seconds = String(secondsLeft % 60).padStart(2, '0');

  const messages = {
    idle: 'Ready',
    running: 'Rest timer running',
    paused: 'Paused',
    finished: 'Rest complete!',
  };

  return (
    <section
      aria-label="Workout rest timer"
      style={{ maxWidth: 360, margin: '24px auto', padding: 16 }}
    >
      <h2>Workout rest timer</h2>

      <label>
        Rest time (seconds):
        <input
          type="number"
          min="1"
          max="3600"
          step="1"
          value={duration}
          onChange={changeDuration}
          disabled={status === 'running'}
          style={{ width: 90, marginLeft: 8 }}
        />
      </label>

      <div
        role="timer"
        aria-label="Time remaining"
        aria-live="off"
        style={{ fontSize: '2.5rem', margin: '16px 0' }}
      >
        {minutes}:{seconds}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={startTimer}
          disabled={!validDuration || status === 'running'}
        >
          {status === 'paused' ? 'Resume' : 'Start'}
        </button>

        <button
          type="button"
          onClick={pauseTimer}
          disabled={status !== 'running'}
        >
          Pause
        </button>

        <button
          type="button"
          onClick={() => resetTimer()}
          disabled={!validDuration}
        >
          Reset
        </button>
      </div>

      <p role="status">
        {validDuration
          ? messages[status]
          : 'Enter a whole number from 1 to 3600 seconds.'}
      </p>
    </section>
  );
}