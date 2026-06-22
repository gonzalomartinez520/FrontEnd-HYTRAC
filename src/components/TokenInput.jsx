import { useRef, useState, useEffect } from "react";
import "../styles/tokenInput.css";

export default function TokenInput({ length = 6, onComplete }) {
    const [values, setValues] = useState(Array(length).fill(""));
    const inputsRef = useRef([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const updateValue = (index, char) => {
        const next = [...values];
        next[index] = char;
        setValues(next);

        if (char && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        if (next.every((v) => v.length === 1)) {
            onComplete(next.join(""));
        }
    };

    const handleChange = (index, e) => {
        const val = e.target.value.replace(/[^0-9]/g, "").slice(-1);
        updateValue(index, val);
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !values[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
        const chars = paste.slice(0, length).split("");
        const next = [...values];
        chars.forEach((char, i) => { next[i] = char; });
        setValues(next);

        const nextFocus = Math.min(chars.length, length - 1);
        inputsRef.current[nextFocus]?.focus();

        if (next.every((v) => v.length === 1)) {
            onComplete(next.join(""));
        }
    };

    const reset = () => {
        setValues(Array(length).fill(""));
        inputsRef.current[0]?.focus();
    };

    return (
        <div className="token-input-row" onPaste={handlePaste}>
            {values.map((val, i) => (
                <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="token-input-box"
                />
            ))}
        </div>
    );
}