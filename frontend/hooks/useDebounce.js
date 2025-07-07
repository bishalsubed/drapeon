import { useEffect } from "react";
import { useState } from "react";


export default function useDebounce(value, delay = 250) {

    const [debounceValue, setDebounceValue] = useState(value);

    useEffect(() => {
        const id = setTimeout(()=>{
            setDebounceValue(value)
        }, delay)

        return () => clearTimeout(id)
    }, [value, delay])

    return debounceValue;
}