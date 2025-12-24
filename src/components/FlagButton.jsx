import { useState, useRef, useEffect } from "react";


const FLAGS = [
  { code: "gb", name: "English", url: "https://flagcdn.com/w320/gb.png" },
  { code: "in", name: "India",   url: "https://flagcdn.com/w320/in.png" },
  { code: "cn", name: "China",   url: "https://flagcdn.com/w320/cn.png" },
  { code: "jp", name: "Japan",   url: "https://flagcdn.com/w320/jp.png" },
  { code: "kr", name: "Korea",   url: "https://flagcdn.com/w320/kr.png" },
  { code: "fr", name: "France",  url: "https://flagcdn.com/w320/fr.png" },
  { code: "de", name: "Germany", url: "https://flagcdn.com/w320/de.png" },
  { code: "ru", name: "Russia",  url: "https://flagcdn.com/w320/ru.png" },
  { code: "es", name: "Spain",   url: "https://flagcdn.com/w320/es.png" },
  { code: "it", name: "Italy",   url: "https://flagcdn.com/w320/it.png" }
];

export default function FlagButton() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(FLAGS[0]);
  const wrapperRef = useRef(null);

  useEffect(() => {
  function handleClickOutside(event) {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setOpen(false);
    }
  }

  if (open) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [open]);


  return (
   <div ref={wrapperRef} style={{ position: "relative" }}>

      {/* ACTIVE FLAG */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "#222121ff",
          border: "1px solid #2c2b2bff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}
      >
        <img
          src={active.url}
          alt={active.name}
          width={30}
          height={20}
          style={{ borderRadius: 2 }}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
       <div
  style={{
    position: "absolute",
    top: "110%",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#2b2b2b",
    borderRadius: 18,
    border: "1px solid #3a3a3a",
    padding: "8px 6px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
    zIndex: 100
  }}
>

          {FLAGS.map((f) => (
            <div
              key={f.code}
              onClick={() => {
                setActive(f);
                setOpen(false);
              }}
              style={{
    width: 34,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  }}
>
              <img
                src={f.url}
                alt={f.name}
                width={22}
                height={16}
                style={{ borderRadius: 2 }}
              />
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
