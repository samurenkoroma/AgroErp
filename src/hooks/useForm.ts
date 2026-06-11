import {useState} from "react"

export function useForm<T>(initialState: T) {
    const [data, setData] = useState<T>(initialState)

    const setField = <K extends keyof T>(field: K, value: T[K]) => {
        setData(prev => ({...prev, [field]: value}))
    }

    return {data, setData, setField}
}