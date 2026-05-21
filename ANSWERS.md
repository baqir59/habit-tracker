# Assessment Answers

### 1. How to run
1. Ensure Node.js is installed.
2. Navigate to the project root: `cd habit-tracker`
3. Install dependencies: `npm install`
4. Start the app: `npm run dev`
5. Open `http://localhost:5173` in your browser.

### 2. Stack & design choices
- **Stack**: I used **React + TypeScript + Vite**. React is ideal for state-heavy UIs like a habit grid. TypeScript ensures the data structures (Habits, Checkmarks) are robust. Vite provides an extremely fast development cycle.
- **Visual Decision 1 (The Grid)**: I used a standard HTML `<table>` wrapped in a scrollable `div` (`.grid-wrapper`). This ensures that on wide screens, the grid is stable and readable, while on mobile, users can swipe horizontally to see the full week without the layout breaking or text becoming unreadably small.
- **Visual Decision 2 (The Checkmark Buttons)**: I made the checkmarks large (32px) and used a "✓" symbol with a bright green background when checked. This provides immediate, satisfying feedback. I also disabled future checkmarks (lower opacity) to guide the user towards focusing on today.

### 3. Responsive & accessibility
- **Responsive**: On a 1440px laptop, the grid takes up the center of the screen with comfortable padding. On a 360px phone, the padding is reduced, and the grid becomes horizontally scrollable. The "Add Habit" form switches to a more compact layout if needed.
- **Accessibility Consideration**: I used semantic `<button>` elements for the checkmarks. This ensures they are keyboard-focusable and can be activated via the Space/Enter keys by default.
- **Skipped**: I knowingly skipped complex screen reader labels (ARIA-labels) for each specific cell (e.g., "Check 'Exercise' for Monday, May 22"). While valuable, implementing high-quality dynamic labels for a 7xN grid takes significant time; for this MVP, I focused on basic keyboard navigation.

### 4. AI usage
- **Tool**: Gemini / Claude
- **How I used it**: I used AI primarily as a "pair programmer" to help scaffold the initial Vite + TypeScript boilerplate and to brainstorm the best way to structure the nested state for the checkmarks. 
- **The Process**: I initially asked for a "clean way to map over a 7-day week in React using Date objects." The AI provided a standard utility function, but I had to manually adjust it to ensure the week always starts on Sunday regardless of the user's locale.
- **Specific Tweak**: The AI suggested a very basic "toggle" for the checkmarks, but I refactored the logic to ensure future dates are disabled and that the UI provides a clearer "visual lockout" for those cells. I also rewrote the streak calculation from scratch because the suggested version didn't handle the "yesterday-if-today-is-unchecked" edge case correctly.

### 5. Honest gap
The **Editing Experience** is functional but I'd like it to be more seamless. Right now, clicking a habit name swaps it for an input field; it works, but if I had another day, I’d probably implement a smoother inline transition or a dedicated edit mode to avoid layout shifts. I'd also love to add "Drag and Drop" for reordering habits to make the list more personal.

### Week Start & Streak Defense
- **Week Start**: The week starts on **Sunday**. This is common in many calendar systems and provides a consistent baseline for the `getStartOfWeek` utility function.
- **Streak Calculation**: The streak counts up to today if today is checked. If today is *not* checked, it counts the streak up to yesterday (preserving the streak for the day). This prevents the "streak" from appearing as 0 first thing in the morning before the user has had a chance to log their habit.
