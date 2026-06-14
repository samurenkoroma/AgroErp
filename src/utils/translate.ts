export function generateFromName(name: string, maxLength: number = 20): string {
    const translit = (str: string): string => {
        const map: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        };

        return str.toLowerCase()
            .split('')
            .map(char => map[char] || (/[a-z0-9-\s]/i.test(char) ? char : ''))
            .join('')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, maxLength);
    };

    return translit(name);
}

export const generateCode = (cropName: string, varietyName: string, method: string, started?: Date): string => {
    const varietySlug = generateFromName(varietyName, 50);
    const cropSlug = generateFromName(cropName, 50);
    if (cropSlug === "") {
        return ""
    }
    if (started) {
        const date = `${started.getMonth() + 1}/${started.getFullYear()}`;
        return `${cropSlug}:${varietySlug}:${method}:${date}`.replace(/:{2,}/g, ':');

    }
    return `${cropSlug}:${varietySlug}:${method}:-/-`.replace(/:{2,}/g, ':');
};

export const generateName = (cropName: string, varietyName: string, method: string, started?: Date) => {
    if (cropName === "") {
        return ""
    }
    if (started) {
        const date = `${started.getMonth() + 1}/${started.getFullYear()}`;
        return `${cropName} ${varietyName} - ${method}(${date})`

    }
    return `${cropName} ${varietyName} - ${method}(-/-})`
}

/**
 * Транслитерация по ГОСТ 7.79-2000 (система B)
 * Используется для документов, загранпаспортов
 */
export function transliterateGOST(text: string): string {
    const map: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'x', 'ц': 'cz', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'ju', 'я': 'ja',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'X', 'Ц': 'Cz', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Ju', 'Я': 'Ja'
    };

    return text.split('').map(char => map[char] || char).join('');
}

// Пример
console.log(transliterateGOST('Щука и цыпленок')); // Shhuka i czyplyonok