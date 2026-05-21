import { useState, useEffect, useMemo } from 'react';
import './App.css';

// --- Types ---
interface Habit {
  id: string;
  name: string;
}

interface Checkmarks {
  [habitId: string]: {
    [dateString: string]: boolean;
  };
}

// --- Utils ---
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // Sunday is 0
  const diff = d.getDate() - day; // Adjust to Sunday
  return new Date(d.setDate(diff));
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getWeekDays = (startOfWeek: Date): Date[] => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

function App() {
  // --- State ---
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [checkmarks, setCheckmarks] = useState<Checkmarks>(() => {
    const saved = localStorage.getItem('checkmarks');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const start = getStartOfWeek(new Date());
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const [newHabitName, setNewHabitName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('checkmarks', JSON.stringify(checkmarks));
  }, [checkmarks]);

  // --- Derived Data ---
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);
  const todayStr = formatDate(new Date());

  // --- Handlers ---
  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName.trim(),
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const deleteHabit = (id: string) => {
    if (confirm('Delete this habit?')) {
      setHabits(habits.filter(h => h.id !== id));
      const newCheckmarks = { ...checkmarks };
      delete newCheckmarks[id];
      setCheckmarks(newCheckmarks);
    }
  };

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const saveEdit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, name: editName.trim() } : h));
    setEditingId(null);
  };

  const toggleCheck = (habitId: string, dateStr: string) => {
    // Prevent checking future days
    if (dateStr > todayStr) return;

    setCheckmarks(prev => {
      const habitChecks = prev[habitId] || {};
      return {
        ...prev,
        [habitId]: {
          ...habitChecks,
          [dateStr]: !habitChecks[dateStr],
        },
      };
    });
  };

  const navigateWeek = (direction: number) => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + (direction * 7));
    setCurrentWeekStart(next);
  };

  const goToday = () => {
    const start = getStartOfWeek(new Date());
    start.setHours(0, 0, 0, 0);
    setCurrentWeekStart(start);
  };

  const calculateStreak = (habitId: string) => {
    const checks = checkmarks[habitId] || {};
    let streak = 0;
    const curr = new Date();
    curr.setHours(0, 0, 0, 0);

    // Current streak: counts up to today, or up to yesterday-if-today-is-unchecked
    // We check backwards from today
    let checkDate = new Date(curr);
    
    // If today is unchecked, check if yesterday was checked. If not, streak is 0.
    // If today is checked, streak starts at 1 and we check yesterday, etc.
    while (true) {
      const dStr = formatDate(checkDate);
      if (checks[dStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If it's today and it's unchecked, we check yesterday to see if the streak is still "active"
        if (dStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue; 
        }
        break;
      }
    }
    return streak;
  };

  return (
    <div className="app-container">
      <header>
        <h1>Habit Tracker</h1>
        <div className="week-nav">
          <button onClick={() => navigateWeek(-1)}>← Prev</button>
          <button onClick={goToday}>This Week</button>
          <button onClick={() => navigateWeek(1)}>Next →</button>
        </div>
        <p className="week-label">
          Week of {currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      <main>
        {habits.length === 0 ? (
          <div className="empty-state">
            <p>No habits yet. Start by adding one below!</p>
          </div>
        ) : (
          <div className="grid-wrapper">
            <table className="habit-grid">
              <thead>
                <tr>
                  <th>Habit</th>
                  {weekDays.map(day => (
                    <th key={day.toISOString()} className={formatDate(day) === todayStr ? 'today-head' : ''}>
                      <div className="day-name">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                      <div className="day-date">{day.getDate()}</div>
                    </th>
                  ))}
                  <th>Streak</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => (
                  <tr key={habit.id}>
                    <td className="habit-name-cell">
                      {editingId === habit.id ? (
                        <input 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => saveEdit(habit.id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(habit.id)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => startEdit(habit)}>{habit.name}</span>
                      )}
                    </td>
                    {weekDays.map(day => {
                      const dStr = formatDate(day);
                      const isFuture = dStr > todayStr;
                      const isChecked = checkmarks[habit.id]?.[dStr];
                      return (
                        <td 
                          key={dStr} 
                          className={`${dStr === todayStr ? 'today-cell' : ''} ${isFuture ? 'future-cell' : ''}`}
                        >
                          <button 
                            className={`check-btn ${isChecked ? 'checked' : ''}`}
                            onClick={() => toggleCheck(habit.id, dStr)}
                            disabled={isFuture}
                          >
                            {isChecked ? '✓' : ''}
                          </button>
                        </td>
                      );
                    })}
                    <td className="streak-cell">
                      <span className="streak-badge">{calculateStreak(habit.id)}🔥</span>
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => deleteHabit(habit.id)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form className="add-habit-form" onSubmit={addHabit}>
          <input 
            type="text" 
            placeholder="New habit (e.g. Read 30 min)" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
          />
          <button type="submit">Add Habit</button>
        </form>
      </main>
    </div>
  );
}

export default App;
