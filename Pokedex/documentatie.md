# React

### useEffect

useEffect callback MUST return:
→ nothing
→ OR cleanup function

async function returns:
→ Promise

Fix: define async function inside useEffect

Stateful vs Stateless

Stateless:
→ purely functional, no local state
→ no side effects (ideally)

Stateful:
→ contains state and logic to handle it
