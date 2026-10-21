const make = (d) =>
  function Icon({ className = 'h-5 w-5' }) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
    );
  };

export const Shield = make('M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z M9 12l2 2 4-4');
export const Users = make('M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1 M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z M21 20v-1a4 4 0 00-3-3.9 M16 4.2a3.5 3.5 0 010 6.6');
export const Badge = make('M12 21a9 9 0 100-18 9 9 0 000 18z M8.5 12.5l2.5 2.5 4.5-5');
export const Chat = make('M21 12a8 8 0 01-11.5 7.2L4 20l1-4.2A8 8 0 1121 12z');
export const Search = make('M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.3-4.3');
export const Lock = make('M6 11V8a6 6 0 1112 0v3 M5 11h14v10H5z');
export const Upload = make('M12 16V4 M7 9l5-5 5 5 M4 20h16');
export const Check = make('M5 12.5l4.5 4.5L19 7');
export const Plus = make('M12 5v14M5 12h14');
