export type Option = {
    value: string;
    label: string;
};

export const toOptions = <
    T extends Record<string, string>
>(
    items: T[],
    valueKey: keyof T,
    labelKey: (keyof T)[]
): Option[] => {
    return items.map(item => ({
        value: String(item[valueKey]),
        label: labelKey.map(i => item[i]).join(' '),
    }));
};

