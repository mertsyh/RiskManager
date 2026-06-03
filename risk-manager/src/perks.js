// ─── PERSONALIZED MORALE PERKS ───
// Each employee can be cheered up by spending budget on things tailored to THEM — never by
// handing over raw cash. Two kinds:
//   • activity → repeatable, instant morale boost (buy it again whenever they get down).
//   • item     → one-time investment: an instant boost now PLUS a small passive morale bump
//                every day from then on (people remember you invested in them).
// Keyed by employee id (roster ids are fixed 1-8).

export const PERKS_BY_EMP = {
  // 1 · Mert — Senior Dev 🧑‍💻
  1: [
    { id:'mert-coffee',   type:'activity', icon:'☕', name:'Specialty Coffee Run',  cost:800,  morale:8,  desc:'A flat white from the good place down the street.' },
    { id:'mert-games',    type:'activity', icon:'🎮', name:'Indie Game Night',      cost:1500, morale:14, desc:'Unwind with the team after a brutal sprint.' },
    { id:'mert-keyboard', type:'item',     icon:'⌨️', name:'Mechanical Keyboard',   cost:5000, morale:22, passive:1, desc:'The tactile switches he has wanted for months.' },
  ],
  // 2 · Bob — DevOps 🔧
  2: [
    { id:'bob-burger',  type:'activity', icon:'🍔', name:'Burger & Server Talk',  cost:900,  morale:9,  desc:'Greasy food and war stories about prod incidents.' },
    { id:'bob-camp',    type:'activity', icon:'🏕️', name:'Weekend Camping Trip',  cost:2200, morale:16, desc:'Two days completely off the grid. No pagers.' },
    { id:'bob-homelab', type:'item',     icon:'🖥️', name:'Home Lab Upgrade',      cost:6000, morale:24, passive:1, desc:'Hardware for the side projects he loves.' },
  ],
  // 3 · Charlie — QA 🔍
  3: [
    { id:'charlie-bounty', type:'activity', icon:'🐞', name:'Bug Bounty Bonus',      cost:1200, morale:12, desc:'A cash reward for the nastiest bug squashed this week.' },
    { id:'charlie-escape', type:'activity', icon:'🧩', name:'Escape Room Outing',    cost:1600, morale:14, desc:'Hunting for edge cases — but for fun this time.' },
    { id:'charlie-course', type:'item',     icon:'📚', name:'Test Automation Course',cost:4500, morale:20, passive:1, desc:'Levels up the craft she keeps asking about.' },
  ],
  // 4 · Diana — PM 📊
  4: [
    { id:'diana-offsite', type:'activity', icon:'🗂️', name:'Offsite Planning Day',  cost:1800, morale:15, desc:'A calm day to map the roadmap away from the noise.' },
    { id:'diana-wine',    type:'activity', icon:'🍷', name:'Wine & Roadmap Evening', cost:2000, morale:14, desc:'Strategy talk over a good bottle.' },
    { id:'diana-desk',    type:'item',     icon:'🪑', name:'Ergonomic Standing Desk',cost:5500, morale:22, passive:1, desc:'No more back pain in those long stand-ups.' },
  ],
  // 5 · Eve — Security 🔒
  5: [
    { id:'eve-ctf',  type:'activity', icon:'🚩', name:'CTF Competition Entry', cost:1500, morale:15, desc:'The weekend capture-the-flag she has been eyeing.' },
    { id:'eve-lock', type:'activity', icon:'🔐', name:'Lockpicking Workshop',  cost:1300, morale:12, desc:'Hands-on fun that scratches the hacker itch.' },
    { id:'eve-keys', type:'item',     icon:'🗝️', name:'Hardware Security Keys', cost:5000, morale:22, passive:1, desc:'A pro pentest kit of her very own.' },
  ],
  // 6 · Frank — Frontend 🎨
  6: [
    { id:'frank-assets', type:'activity', icon:'🎨', name:'Design Asset Bundle', cost:1200, morale:12, desc:'A fresh pack of icons, fonts and illustrations.' },
    { id:'frank-museum', type:'activity', icon:'🖼️', name:'Museum & Inspiration Day', cost:1400, morale:13, desc:'A day soaking up colour and composition.' },
    { id:'frank-tablet', type:'item',     icon:'✏️', name:'Drawing Tablet',      cost:4800, morale:21, passive:1, desc:'For pixel-perfect mockups straight from the hand.' },
  ],
  // 7 · Grace — AI Eng. 🤖
  7: [
    { id:'grace-papers', type:'activity', icon:'📄', name:'Research Paper Access', cost:1600, morale:13, desc:'A subscription to every journal she keeps citing.' },
    { id:'grace-conf',   type:'activity', icon:'🧠', name:'ML Conference Ticket',  cost:2500, morale:18, desc:'Front-row seat to the talks she will not stop quoting.' },
    { id:'grace-gpu',    type:'item',     icon:'⚡', name:'Personal GPU Credits',  cost:8000, morale:28, passive:2, desc:'Train her side models overnight, on the house.' },
  ],
  // 8 · Hank — Intern 👶
  8: [
    { id:'hank-pizza',  type:'activity', icon:'🍕', name:'Pizza Friday',        cost:600,  morale:10, desc:'The simplest way to an intern’s heart.' },
    { id:'hank-arcade', type:'activity', icon:'🕹️', name:'Arcade Afternoon',    cost:900,  morale:13, desc:'Half a day of high scores with the team.' },
    { id:'hank-mentor', type:'item',     icon:'🎓', name:'Mentorship Program',  cost:3500, morale:20, passive:1, desc:'Pairs him with a senior dev who actually has time.' },
  ],
}

// Total passive morale/day an employee earns from the one-time items they own.
export function passiveMoraleFor(emp) {
  const catalog = PERKS_BY_EMP[emp.id] || []
  return (emp.ownedPerks || []).reduce((sum, pid) => {
    const perk = catalog.find(p => p.id === pid)
    return sum + (perk?.passive || 0)
  }, 0)
}
